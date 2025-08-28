use std::fs;
use std::io;
use std::path::PathBuf;

#[derive(serde::Serialize)]
struct FolderInfo {
    total_size: u64,
    file_count: u32,
    folder_count: u32,
}



#[derive(serde::Serialize)]
struct FolderInfoResult{
    info: FolderInfo,
    error: Option<String>
}

impl FolderInfoResult {
    fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap_or_else(|_| "{\"error\":\"Serialization failed\"}".to_string())
    }
}

fn calculate_folder_size(path: &std::path::Path) -> Result<FolderInfo, io::Error> {
    let mut size = 0;
    let mut file_count = 0;
    let mut folder_count = 0;
    let mut stack = vec![PathBuf::from(path)];

    while let Some(path) = stack.pop() {
        match fs::read_dir(&path) {
            Ok(entries) => {
                for entry in entries.flatten() {
                    let entry_path = entry.path();
                    if entry_path.is_dir() {
                        stack.push(entry_path);
                        folder_count += 1;
                    } else if entry_path.is_file() {
                        size += entry_path.metadata().unwrap().len();
                        file_count += 1;
                    }
                }
            },
            Err(e) => {
                // Handle the error (e.g., log it) and continue
                eprintln!("Error reading directory {}: {}", path.display(), &e);
                return Err(e);
            }
        }
    }
    Ok(FolderInfo { total_size: size, file_count, folder_count })
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
    let source_buffer = PathBuf::from(source);
    let metadata = source_buffer.metadata().unwrap();
    let file_name = source_buffer.file_name().unwrap().to_str().unwrap();
    let total_bytes = metadata.len();
    
    let mut bytes_copied = 0;
    let mut source_file = fs::File::open(source)?;
    let mut dest_file = fs::File::create(format!("{}/{}", destination, file_name))?;
    
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

type FolderProgressCallback = extern "C" fn(
    name: *const std::os::raw::c_char,
    total_files: u32,
    files_copied: u32,
    total_bytes: u64,
    bytes_copied: u64,  
    percentage: f32, 
    completed: bool, 
    error: *const std::os::raw::c_char);

struct FolderProgressReport<'a>{
    name: &'a str, files_copied: u32, bytes_copied: u64, completed: bool, error: Option<&'a str>
}

fn send_folder_progress(callback: FolderProgressCallback, folder_info: &FolderInfo, report: FolderProgressReport ) {
    let total_bytes = folder_info.total_size;
    let bytes_copied = report.bytes_copied;

    let percentage = if total_bytes > 0 { (bytes_copied as f32 / total_bytes as f32) * 100.0 } else { 0.0 };
    
    let error_ptr = if let Some(err) = report.error {
        std::ffi::CString::new(err).unwrap().into_raw()
    } else {
        std::ptr::null()
    };

    let name_ptr = std::ffi::CString::new(report.name).unwrap().into_raw();
    let total_files = folder_info.file_count;
    let files_copied = report.files_copied;
    let completed = report.completed;
    
    callback(name_ptr, total_files, files_copied, total_bytes, bytes_copied, percentage, completed, error_ptr);
    
    // Clean up error and name string
    unsafe {
        if !error_ptr.is_null() {
            let _ = std::ffi::CString::from_raw(error_ptr as *mut _);
        }
    
        let _ = std::ffi::CString::from_raw(name_ptr as *mut _);
    }
}

fn copy_folder_iterative(source: &str, destination: &str, folder_info: &FolderInfo, callback: FolderProgressCallback) -> io::Result<()>{
    let mut bytes_copied: u64 = 0;
    let mut files_copied: u32  = 0;

    let mut stack = vec![
        Transit{ source: PathBuf::from(source), destination: PathBuf::from(destination) }
    ];

    while let Some(transit) = stack.pop() {
        fs::create_dir_all(&transit.destination)?;
        for entry in fs::read_dir(&transit.source)? {
            let entry = entry?;
            let metadata = entry.metadata()?;
            let file_name = entry.file_name();
            let dest_path = format!("{}/{}", transit.destination.to_string_lossy(), entry.file_name().to_string_lossy());
    
            if metadata.is_file() {
                let mut file = fs::File::open(entry.path())?;
                let mut dest_file = fs::File::create(&dest_path)?;
                let mut buffer = vec![0; 8192];

                files_copied += 1;
                send_folder_progress(callback, &folder_info, FolderProgressReport{
                    name: file_name.to_str().unwrap(),
                    files_copied, bytes_copied, completed: false,  error: None
                });

                let mut last_time = std::time::Instant::now();
                loop {
                    let bytes_read = io::Read::read(&mut file, &mut buffer)?;
                    if bytes_read == 0 {
                        break;
                    }
                    io::Write::write_all(&mut dest_file, &buffer[..bytes_read])?;
                    bytes_copied += bytes_read as u64;

                    if last_time.elapsed().as_millis() >= 500 {
                        send_folder_progress(callback, &folder_info, FolderProgressReport{
                            name: file_name.to_str().unwrap(),
                            files_copied, bytes_copied, completed: false,  error: None
                        });
                        last_time = std::time::Instant::now();
                    }
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
pub extern "C" fn get_folder_info(path: *const std::os::raw::c_char) -> *mut std::os::raw::c_char {
    let path_str = unsafe { std::ffi::CStr::from_ptr(path).to_string_lossy().into_owned() };
    
    let info = calculate_folder_size(&std::path::PathBuf::from(path_str));
    let json = info.to_json();
    let c_string = std::ffi::CString::new(json).unwrap();
    
    c_string.into_raw()
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
            let folder_info = calculate_folder_size(&source_file);

            // Send initial progress
            send_folder_progress(callback, &folder_info, FolderProgressReport{
                name: &file_name.to_string_lossy(),  files_copied: 0, completed: false,  error: None, bytes_copied: 0
            });

            if let Ok(()) = copy_folder_iterative(source.as_str(), &destination, &folder_info, callback){
                send_folder_progress(callback, &folder_info, FolderProgressReport{
                    name: &file_name.to_string_lossy(),  files_copied: 0, completed: true,  error: None, bytes_copied: 0
                });
                return true;
            }
        }
        false
    })
}