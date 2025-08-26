use std::ffi::CString;
use std::fs;
use std::io;

// Callback type for progress updates
type ProgressCallback = extern "C" fn(bytes_copied: u64, total_bytes: u64, percentage: f32, completed: bool, error: *const std::os::raw::c_char);

// Main copy function with progress
#[unsafe(no_mangle)]
pub extern "C" fn copy_file_with_progress(source_path: *const std::os::raw::c_char, dest_path: *const std::os::raw::c_char, callback: ProgressCallback) -> bool {
    // Convert C strings to Rust strings
    let source = unsafe { std::ffi::CStr::from_ptr(source_path).to_string_lossy().into_owned() };
    let destination = unsafe { std::ffi::CStr::from_ptr(dest_path).to_string_lossy().into_owned() };

    // Run the async copy function
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async move {
        if let Err(e) = copy_file_async(&source, &destination, callback).await {
            send_error(callback, &e.to_string());
            false
        } else {
            true
        }
    })
}

async fn copy_file_async( source: &str, destination: &str, callback: ProgressCallback) -> io::Result<()> {
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
    send_progress(callback, bytes_copied, total_bytes, false, None);
    
    loop {
        let bytes_read = io::Read::read(&mut source_file, &mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        
        io::Write::write_all(&mut dest_file, &buffer[..bytes_read])?;
        bytes_copied += bytes_read as u64;

        // check if at least 500ms has passed since last update then send update
        if last_time.elapsed().as_millis() >= 500 {
            send_progress(callback, bytes_copied, total_bytes, false, None);
            last_time = std::time::Instant::now();
        }
    }
    
    // Send completion
    send_progress(callback, total_bytes, total_bytes, true, None);
    Ok(())
}

fn send_progress(callback: ProgressCallback, copied: u64, total: u64, completed: bool, error: Option<&str>) {
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

fn send_error(callback: ProgressCallback, error: &str) {
    send_progress(callback, 0, 0, true, Some(error));
}

type OnProgress = extern "C" fn(message: *const std::os::raw::c_char, percentage: f32, done: bool);

#[unsafe(no_mangle)]
pub extern "C" fn progress_callback(name: *const std::os::raw::c_char,  callback: OnProgress) {
    let name_string = unsafe { std::ffi::CStr::from_ptr(name).to_string_lossy().into_owned() };

    // Run the async copy function
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async move {
        let mut progress: f32 = 0.0;
        while progress <= 100.0 {
            let name_ptr = CString::new(format!("processing: {}", &name_string)).unwrap().into_raw();

            callback(name_ptr, progress, progress == 100.0);
            progress += 10.0;

            // 1 seconds delay
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        }
    });
}

#[unsafe(no_mangle)]
pub extern "C" fn get_folder_size(path: *const std::os::raw::c_char) -> u64 {
    let path_str = unsafe { std::ffi::CStr::from_ptr(path).to_string_lossy().into_owned() };
    match calculate_folder_size(&std::path::PathBuf::from(path_str)) {  
        Ok(size) => size,
        Err(_) => 0,
    }
}

fn calculate_folder_size(path: &std::path::Path) -> io::Result<u64> {
    let mut size = 0;
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        if metadata.is_file() {
            size += metadata.len();
        } else if metadata.is_dir() {
            size += calculate_folder_size(&entry.path())?;
        }
    }
    Ok(size)
}

// copy folder recursively with progress
#[unsafe(no_mangle)]
pub extern "C" fn copy_folder_with_progress(source_path: *const std::os::raw::c_char, dest_path: *const std::os::raw::c_char, callback: ProgressCallback) -> bool {
    // Convert C strings to Rust strings
    let source = unsafe { std::ffi::CStr::from_ptr(source_path).to_string_lossy().into_owned() };
    let destination = unsafe { std::ffi::CStr::from_ptr(dest_path).to_string_lossy().into_owned() };

    // Run the async copy function
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async move {
        if let Err(e) = copy_folder_async(&source, &destination, callback).await {
            send_error(callback, &e.to_string());
            false
        } else {
            true
        }
    })
}

async fn copy_folder_async(source: &str, destination: &str, callback: ProgressCallback) -> io::Result<()> {
    let mut total_bytes = 0;
    let mut bytes_copied = 0;

    // First, calculate total size
    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        if metadata.is_file() {
            total_bytes += metadata.len();
        } else if metadata.is_dir() {
            total_bytes += calculate_folder_size(&entry.path())?;
        }
    }

    // Send initial progress
    send_progress(callback, bytes_copied, total_bytes, false, None);

    // Now copy files and folders (sync, but called from async context)
    tokio::task::spawn_blocking(move || {
        copy_recursive_sync(source, destination, &mut bytes_copied, total_bytes, callback)
    }).await??;

    // Send completion
    send_progress(callback, total_bytes, total_bytes, true, None);
    Ok(())
}

fn copy_recursive_sync(source: &str, destination: &str, bytes_copied: &mut u64, total_bytes: u64, callback: ProgressCallback) -> io::Result<()> {
    fs::create_dir_all(destination)?;

    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
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
                send_progress(callback, *bytes_copied, total_bytes, false, None);
            }
        } else if metadata.is_dir() {
            copy_recursive_sync(&entry.path().to_string_lossy(), &dest_path, bytes_copied, total_bytes, callback)?;
        }
    }
    Ok(())
}

/*
use std::fs;
use std::path::PathBuf;

fn traverse_dir_iterative(root: &str) {
    let mut stack = vec![PathBuf::from(root)];

    while let Some(path) = stack.pop() {
        if let Ok(entries) = fs::read_dir(&path) {
            for entry in entries.flatten() {
                let entry_path = entry.path();
                if entry_path.is_dir() {
                    stack.push(entry_path);
                } else if entry_path.is_file() {
                    println!("File: {:?}", entry_path);
                }
            }
        }
    }
}

 */