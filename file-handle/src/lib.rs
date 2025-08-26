use std::fs;
use std::io;
use std::path::PathBuf;

fn calculate_folder_size(path: &std::path::Path) -> u64 {
    let mut size = 0;
    let mut stack = vec![PathBuf::from(path)];

    while let Some(path) = stack.pop() {
        if let Ok(entries) = fs::read_dir(&path) {
            for entry in entries.flatten() {
                let entry_path = entry.path();
                if entry_path.is_dir() {
                    stack.push(entry_path);
                } else if entry_path.is_file() {
                    size += entry_path.metadata().unwrap().len();
                }
            }
        }
    }
    size
}

// Callback type for progress updates
type FileProgressCallback = extern "C" fn(bytes_copied: u64, total_bytes: u64, percentage: f32, completed: bool, error: *const std::os::raw::c_char);

fn send_file_progress(callback: FileProgressCallback, copied: u64, total: u64, completed: bool, error: Option<&str>) {
    let percentage = if total > 0 { (copied as f32 / total as f32) * 100.0 } else { 0.0 };
    
    let error_ptr = if let Some(err) = error {
        std::ffi::CString::new(err).unwrap().into_raw()
    } else {
        std::ptr::null()
    };
    
    callback(copied, total, percentage, completed, error_ptr);
    
    // Clean up error string if we created one
    if !error_ptr.is_null() {
        unsafe { let _ = std::ffi::CString::from_raw(error_ptr as *mut _); };
    }
}

async fn copy_file_async( source: &str, destination: &str, callback: FileProgressCallback) -> io::Result<()> {
    let metadata = fs::metadata(source)?;
    let total_bytes = metadata.len();
    
    let mut bytes_copied = 0;
    let mut source_file = fs::File::open(source)?;
    let mut dest_file = fs::File::create(destination)?;
    
    let buffer_size = 8192; // 8KB chunks
    let mut buffer = vec![0; buffer_size];

    // get current time
    let mut last_time = std::time::Instant::now();
    
    // Send initial progress
    send_file_progress(callback, bytes_copied, total_bytes, false, None);
    
    loop {
        let bytes_read = io::Read::read(&mut source_file, &mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        
        io::Write::write_all(&mut dest_file, &buffer[..bytes_read])?;
        bytes_copied += bytes_read as u64;

        // check if at least 500ms has passed since last update then send update
        if last_time.elapsed().as_millis() >= 500 {
            send_file_progress(callback, bytes_copied, total_bytes, false, None);
            last_time = std::time::Instant::now();
        }
    }
    
    // Send completion
    send_file_progress(callback, total_bytes, total_bytes, true, None);
    Ok(())
}

struct Transit{
    source: PathBuf,
    destination: PathBuf
}

type FolderProgressCallback = extern "C" fn(name: *const std::os::raw::c_char, bytes_copied: u64, total_bytes: u64, percentage: f32, completed: bool, error: *const std::os::raw::c_char);

fn send_folder_progress(callback: FolderProgressCallback, name: &str, copied: u64, total: u64, completed: bool, error: Option<&str>) {
    let percentage = if total > 0 { (copied as f32 / total as f32) * 100.0 } else { 0.0 };
    
    let error_ptr = if let Some(err) = error {
        std::ffi::CString::new(err).unwrap().into_raw()
    } else {
        std::ptr::null()
    };

    let name_ptr = std::ffi::CString::new(name).unwrap().into_raw();
    
    callback(name_ptr, copied, total, percentage, completed, error_ptr);
    
    // Clean up error and name string
    unsafe {
        if !error_ptr.is_null() {
            let _ = std::ffi::CString::from_raw(error_ptr as *mut _);
        }
    
        let _ = std::ffi::CString::from_raw(name_ptr as *mut _);
    }
}

fn copy_folder_iterative(source: &str, destination: &str, bytes_copied: &mut u64, total_bytes: u64, callback: FolderProgressCallback) -> io::Result<()>{
    let mut stack = vec![
        Transit{ source: PathBuf::from(source), destination: PathBuf::from(destination) }
    ];

    while let Some(transit) = stack.pop() {
        fs::create_dir_all(transit.destination)?;
        for entry in fs::read_dir(&transit.source)? {
            let entry = entry?;
            let metadata = entry.metadata()?;
            let file_name = entry.file_name();
            let dest_path = format!("{}/{}", destination, entry.file_name().to_string_lossy());
    
            if metadata.is_file() {
                let mut file = fs::File::open(entry.path())?;
                let mut dest_file = fs::File::create(&dest_path)?;
                let mut buffer = vec![0; 8192];
    
                loop {
                    let bytes_read = io::Read::read(&mut file, &mut buffer)?;
                    if bytes_read == 0 {
                        break;
                    }
                    io::Write::write_all(&mut dest_file, &buffer[..bytes_read])?;
                    *bytes_copied += bytes_read as u64;
    
                    // Send progress update
                    send_folder_progress(callback, file_name.to_str().unwrap(), *bytes_copied, total_bytes, false, None);
                }
            } else if metadata.is_dir() {
                stack.push(Transit { 
                    source: entry.path(),
                    destination: PathBuf::from(dest_path) });
            }
        }
    }

    Ok(())
}

#[unsafe(no_mangle)]
pub extern "C" fn get_folder_size(path: *const std::os::raw::c_char) -> u64 {
    let path_str = unsafe { std::ffi::CStr::from_ptr(path).to_string_lossy().into_owned() };
    
    calculate_folder_size(&std::path::PathBuf::from(path_str))
}

#[unsafe(no_mangle)]
pub extern "C" fn copy_file_with_progress(source_path: *const std::os::raw::c_char, dest_path: *const std::os::raw::c_char, callback: FileProgressCallback) -> bool {
    // Convert C strings to Rust strings
    let source = unsafe { std::ffi::CStr::from_ptr(source_path).to_string_lossy().into_owned() };
    let destination = unsafe { std::ffi::CStr::from_ptr(dest_path).to_string_lossy().into_owned() };

    // Run the async copy function
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async move {
        if let Err(e) = copy_file_async(&source, &destination, callback).await {
            send_file_progress(callback, 0, 0, true, Some(&e.to_string()));
            false
        } else {
            true
        }
    })
}

// copy folder recursively with progress
#[unsafe(no_mangle)]
pub extern "C" fn copy_folder_with_progress(source_path: *const std::os::raw::c_char, dest_path: *const std::os::raw::c_char, callback: FolderProgressCallback) -> bool {
    // Convert C strings to Rust strings
    let source = unsafe { std::ffi::CStr::from_ptr(source_path).to_string_lossy().into_owned() };
    let destination = unsafe { std::ffi::CStr::from_ptr(dest_path).to_string_lossy().into_owned() };

    // Run the async copy function
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async move {
        let source_file = PathBuf::from(&source);

        if let Some(file_name) = source_file.file_name(){
            let total_bytes = calculate_folder_size(&source_file);
            let mut bytes_copied = 0;

            // Send initial progress
            send_folder_progress(callback, &file_name.to_string_lossy(),  bytes_copied, total_bytes, false, None);

            if let Ok(()) = copy_folder_iterative(source.as_str(), &destination, &mut bytes_copied, total_bytes, callback){
                send_folder_progress(callback, &file_name.to_string_lossy(), total_bytes, total_bytes, true, None);
                return true;
            }
        }
        false
    })
}