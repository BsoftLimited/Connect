use sysinfo::System;
use sysinfo::Disks;

use std::path::Path;

use crate::callbacks::ErrorCallback;

pub fn send_error(error_callback: ErrorCallback, error: &str) {
    let error_ptr = std::ffi::CString::new(error).unwrap().into_raw();
    error_callback(error_ptr);
    unsafe { let _ = std::ffi::CString::from_raw(error_ptr as *mut _); };
}

pub fn get_disk_space_for_path(path: &Path) -> Option<(String, u64, u64)> {
    let mut sys = System::new_all();

    sys.refresh_all();
    
    let disks = Disks::new_with_refreshed_list();

    for disk in disks.list() {
        let mount_point = disk.mount_point();
        if path.starts_with(mount_point) {
            let name = disk.name().to_str().unwrap_or("home");

            return Some((name.to_owned(), disk.total_space(),  disk.available_space()));
        }
    }
    None
}