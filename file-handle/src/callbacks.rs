pub type ErrorCallback = extern "C" fn(error: *const std::os::raw::c_char);
pub type ProgressCallback = extern "C" fn(
    name: *const std::os::raw::c_char, total_files: i32, files_copied: i32,
    total_bytes: u64, bytes_copied: u64, percentage: f64 );

pub type StorageCallback = extern "C" fn(name: *const std::os::raw::c_char, total: u64, available: u64);

pub type FolderSizeCallback = extern "C" fn(
    name: *const std::os::raw::c_char, folder_count: i32, file_count: i32,
    total_bytes: u64);

pub type DeleteCallback = extern "C" fn(name: *const std::os::raw::c_char, file_count: i32, deleted_count: i32, completed: i32);