use std::ffi::CString;
use std::fs;
use std::io;
use serde::Serialize;


// FFI-compatible structure
#[repr(C)]
pub struct ProgressEvent {
    bytes_copied: u64,
    total_bytes: u64,
    percentage: f32,
    completed: bool,
    error: *const std::os::raw::c_char,
}

// Callback type for progress updates
type ProgressCallback = extern "C" fn(event: ProgressEvent);

// Main copy function with progress
#[unsafe(no_mangle)]
pub extern "C" fn copy_file_with_progress(
    source_path: *const std::os::raw::c_char,
    dest_path: *const std::os::raw::c_char,
    callback: ProgressCallback,
) -> bool {
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
    
    // Send initial progress
    send_progress(callback, bytes_copied, total_bytes, false, None);
    
    loop {
        let bytes_read = io::Read::read(&mut source_file, &mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        
        io::Write::write_all(&mut dest_file, &buffer[..bytes_read])?;
        bytes_copied += bytes_read as u64;
        
        // Send progress update
        send_progress(callback, bytes_copied, total_bytes, false, None);
        
        // Small delay to allow UI updates
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
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
    
    let event = ProgressEvent {
        bytes_copied: copied,
        total_bytes: total,
        percentage,
        completed,
        error: error_ptr,
    };
    
    callback(event);
    
    // Clean up error string if we created one
    if !error_ptr.is_null() {
        unsafe { let _ = std::ffi::CString::from_raw(error_ptr as *mut _); };
    }
}

fn send_error(callback: ProgressCallback, error: &str) {
    send_progress(callback, 0, 0, true, Some(error));
}

#[unsafe(no_mangle)]
pub extern "C" fn add(left: i32, right: i32) -> i32 {
    left + right
}

#[unsafe(no_mangle)]
pub extern "C" fn hello() -> *const std::os::raw::c_char {
    CString::new("Hello from Rust!").unwrap().into_raw()
}

type OnClick = extern "C" fn(value: *mut std::os::raw::c_char);

#[unsafe(no_mangle)]
pub extern "C" fn with_callback(callback: OnClick) {
    let msg = CString::new("Hello from Rust with callback!").unwrap();
    callback(msg.into_raw());
    let msg = CString::new("Another message from Rust!").unwrap();
    callback(msg.into_raw());
}


#[derive(Serialize, Clone)]
#[repr(C)]
pub struct Progress { percentage: f32, done: bool}
impl Progress {
    fn to_json(&self) -> CString {
        let init = serde_json::to_string(self).unwrap();

        CString::new(init).unwrap()
    }
}

type OnProgress = extern "C" fn(percentage: f32, done: bool);

#[unsafe(no_mangle)]
pub extern "C" fn progress_callback(callback: OnProgress) {
    //let init = Progress { percentage: 0.1, done: false };
    callback(0.1, false);
    
    //let init = Progress { percentage: 50.0, done: false };
    callback(50.0, false);
    
    //let init = Progress { percentage: 100.0, done: true };
    callback(1000.0, true);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
