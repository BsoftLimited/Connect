use sysinfo::IS_SUPPORTED_SYSTEM;

mod callbacks;
use crate::callbacks::{DeleteCallback, ErrorCallback, FolderSizeCallback, ProgressCallback, StorageCallback};

mod utils;
use crate::utils::{get_disk_space_for_path, send_error};

mod detele;
use detele::delete;

mod folder;
use crate::folder::calculate_folder_size;

mod copy;
use copy::copy;

#[unsafe(no_mangle)]
pub extern "C" fn storage_info(home: *const std::os::raw::c_char, callback: StorageCallback, error_callback: ErrorCallback) {
    let home_str = unsafe { std::ffi::CStr::from_ptr(home).to_string_lossy().into_owned() };

    // Run the async copy function
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async move {
        if IS_SUPPORTED_SYSTEM{
            let result = get_disk_space_for_path(&std::path::PathBuf::from(&home_str));
            if let Some((name, total, available)) = result {
                let name_ptr = std::ffi::CString::new(name).unwrap().into_raw();
                callback(name_ptr, total, available);

                unsafe { let _ = std::ffi::CString::from_raw(name_ptr as *mut _); };
            }else{
                let error_msg = format!("Failed to get storage info for path: {}", &home_str);
                send_error(error_callback, &error_msg);
            }
        }else{
            send_error(error_callback, "this system doesn't support getting system info");
        }
    });
}

#[unsafe(no_mangle)]
pub extern "C" fn get_folder_info(path: *const std::os::raw::c_char, callback: FolderSizeCallback, error_callback: ErrorCallback) {
    let path_str = unsafe { std::ffi::CStr::from_ptr(path).to_string_lossy().into_owned() };

    // Run the async copy function
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async move {
        let result = calculate_folder_size(&std::path::PathBuf::from(path_str));
        if let Err(e) = result {
            send_error(error_callback, &e.to_string());
        }else{
            // send the folder info back via callback
            let info = result.unwrap();

            let name_ptr = std::ffi::CString::new(info.name).unwrap().into_raw();
            callback(name_ptr, info.folder_count, info.file_count, info.total_size);
            unsafe { let _ = std::ffi::CString::from_raw(name_ptr as *mut _); };
        }
    });
}

#[unsafe(no_mangle)]
pub extern "C" fn copy_with_progress(source_path: *const std::os::raw::c_char, dest_path: *const std::os::raw::c_char, callback: ProgressCallback, error_callback: ErrorCallback) {
    println!("source_path: {:?}, dest_path: {:?}", source_path, dest_path);
    // Convert C strings to Rust strings
    let source = unsafe { std::ffi::CStr::from_ptr(source_path).to_string_lossy().into_owned() };
    let destination = unsafe { std::ffi::CStr::from_ptr(dest_path).to_string_lossy().into_owned() };

    println!("source_path: {}, dest_path: {}", source, destination);

    // Run the async copy function
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async move {
        let result = copy(&source, &destination, callback).await;
        if let Err(e) = result {
            send_error(error_callback, &e.to_string());
        }
    })
}

#[unsafe(no_mangle)]
pub extern "C" fn delete_with_progress(path: *const std::os::raw::c_char, callback: DeleteCallback, error_callback: ErrorCallback) {
    let path_str = unsafe { std::ffi::CStr::from_ptr(path).to_string_lossy().into_owned() };
    
    let result = delete(&path_str, callback);
    if let Err(e) = result {
        send_error(error_callback, &e.to_string());
    }
}