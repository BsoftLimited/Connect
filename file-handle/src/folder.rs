use std::{fs, io, path::PathBuf};

pub struct FolderInfo {
    pub name: String,
    pub total_size: u64,
    pub file_count: i32,
    pub folder_count: i32,
}

pub fn calculate_folder_size(path: &std::path::Path) -> Result<FolderInfo, io::Error> {
    let mut size = 0;
    let mut file_count:i32 = 0;
    let mut folder_count: i32 = 0;
    let name = path.file_name().unwrap_or_else(|| std::ffi::OsStr::new("")).to_string_lossy().into_owned();
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
    Ok(FolderInfo { name, total_size: size, file_count, folder_count })
}