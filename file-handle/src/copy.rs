use std::fs;
use std::io;
use std::io::Error;
use std::path::PathBuf;

use crate::callbacks::ProgressCallback;
use crate::folder::calculate_folder_size;
use crate::folder::FolderInfo;

enum FileType<'a>{
    Folder(&'a FolderInfo),
    File(u64)
}

struct ProgressReport<'a>{
    name: &'a str, files_copied: i32, bytes_copied: u64
}

fn send_progress(callback: ProgressCallback, file_type: FileType, report: ProgressReport ) {
    let bytes_copied = report.bytes_copied;
    
    let name_ptr = std::ffi::CString::new(report.name).unwrap().into_raw();
    let files_copied = report.files_copied;

    let (total_files, total_bytes) = match file_type {
        FileType::Folder(info) => (info.file_count, info.total_size),
        FileType::File(info) => (1, info)
    };

    let percentage = if total_bytes > 0 { (bytes_copied as f64 / total_bytes as f64) * 100.0 } else { 0.0 };
    
    callback(name_ptr, total_files, files_copied, total_bytes, bytes_copied, percentage);
    
    unsafe {
        let _ = std::ffi::CString::from_raw(name_ptr as *mut _);
    }  
}

fn copy_file_process<F>(source: &str, destination: &str, file_name: &str, callback: F) -> io::Result<()> where F: Fn(&str, usize){
    let mut bytes_copied = 0;

    let source_result = fs::File::open(source);
    if let Err(error) =  source_result{
        let error_msg = format!("Failed to open source file {}: {}", source, error);
        return Err(Error::new(io::ErrorKind::NotFound, error_msg));
    }

    let mut source_file = source_result.unwrap();

    let mut dest_final_path = format!("{}/{}", destination, file_name);
    let mut attempt = 1;
    // check if file already exists at destination
    while PathBuf::from(&dest_final_path).exists(){
        let file_buf = PathBuf::from(file_name);
        let file_extention = file_buf.extension().and_then(|ext| ext.to_str()).unwrap_or("");
        let file_name_only = file_buf.file_stem().and_then(|name| name.to_str()).unwrap_or(file_name);
        if file_extention.is_empty(){
            dest_final_path = format!("{}/{}_{}", destination, file_name_only, attempt);
        }else{
            dest_final_path = format!("{}/{}_{}.{}", destination, file_name_only, attempt, file_extention);
        }
        attempt += 1;
    }

    let dest_result = fs::File::create(&dest_final_path);
    if let Err(error) =  dest_result{
        let error_msg = format!("Failed to create destination file {}/{}: {}", destination, file_name, error);
        return Err(Error::new(io::ErrorKind::Other, error_msg));
    }

    let mut dest_file = dest_result.unwrap();
    
    let buffer_size = 8192; // 8KB chunks
    let mut buffer = vec![0; buffer_size];

    // get current time
    let mut last_time = std::time::Instant::now();
    // Send initial progress
    callback(file_name, 0);
    
    loop {
        let bytes_result = io::Read::read(&mut source_file, &mut buffer);
        if let Err(error) =  bytes_result{
            let error_msg = format!("Failed to read from source file {}: {}", source, error);
            return Err(Error::new(io::ErrorKind::Other, error_msg));
        }

        let bytes_read = bytes_result.unwrap();
        if bytes_read < 1 {
            println!("I am leaving");
            break;
        }
        //println!("bytes read: {}", bytes_read);
        
        if let Err(error) =  io::Write::write_all(&mut dest_file, &buffer[..bytes_read]){
            let error_msg = format!("Failed to write to destination file {}/{}: {}", destination, file_name, error);
            return Err(Error::new(io::ErrorKind::Other, error_msg));
        }

        bytes_copied += bytes_read;

        // check if at least 500ms has passed since last update then send update
        if last_time.elapsed().as_millis() >= 500 {
            callback(file_name, bytes_copied);
            last_time = std::time::Instant::now();
        }
    }
    
    // Send completion
    println!("send completion update");
    callback(file_name, bytes_copied);

    Ok(())
}

struct Transit{
    source: PathBuf,
    destination: PathBuf
}

fn copy_folder_iterative(source: &str, destination: &str, folder_info: &FolderInfo, callback: ProgressCallback) -> io::Result<()>{
    let mut bytes_copied: u64 = 0;
    let mut files_copied: i32  = 0;

    let mut stack = vec![
        Transit{ source: PathBuf::from(source), destination: PathBuf::from(destination) }
    ];

    while let Some(transit) = stack.pop() {
        let _ = fs::create_dir_all(&transit.destination);

        for entry_result in fs::read_dir(&transit.source)? {
            if let Err(error) = entry_result{
                let error_msg = format!("Failed to read directory {}: {}", transit.source.to_string_lossy(), error);
                return Err(Error::new(io::ErrorKind::Other, error_msg));
            }
            let entry = entry_result.unwrap();

            let metadata_result = entry.metadata();
            if let Err(error) =  metadata_result{
                let error_msg = format!("Failed to get metadata for {}: {}", entry.path().to_string_lossy(), error);
                return Err(Error::new(io::ErrorKind::Other, error_msg));
            }

            let metadata = metadata_result.unwrap();
            let file_name = entry.file_name().to_string_lossy().into_owned();
    
            if metadata.is_file() {
                let file_source = entry.path().to_str().unwrap().to_string();
                let file_destination = transit.destination.to_str().unwrap();

                let copy_result = copy_file_process(&file_source, file_destination, &file_name, | file_name, file_bytes_copied |{
                    send_progress(callback, FileType::Folder(&folder_info), ProgressReport{
                        name: file_name, files_copied, bytes_copied: bytes_copied + file_bytes_copied as u64
                    });
                });

                if copy_result.is_err() {
                    return copy_result;
                }

                files_copied += 1;
                bytes_copied += metadata.len();
            } else if metadata.is_dir() {
                let dest_path = format!("{}/{}", transit.destination.to_string_lossy(), &file_name);
                stack.push(Transit { source: entry.path(), destination: PathBuf::from(dest_path) });
            }else{
                let error_msg = format!("unable to determine file type: {}", entry.path().to_string_lossy());
                return Err(Error::new(io::ErrorKind::Other, error_msg));
            }
        }
    }

    send_progress(callback, FileType::Folder(&folder_info), ProgressReport{
        name: &folder_info.name,  files_copied: folder_info.folder_count, bytes_copied: folder_info.total_size
    });

    Ok(())
}

pub async fn copy( source: &str, destination: &str, callback: ProgressCallback) -> io::Result<()>{
    let source_buffer = PathBuf::from(source);
    let metadata_result = source_buffer.metadata();

    if metadata_result.is_err() {
        let error_msg = format!("Failed to get metadata for source path {}: {}", source, metadata_result.err().unwrap());
        return Err(io::Error::new(io::ErrorKind::InvalidInput, error_msg));
    }
    
    let metadata = metadata_result.unwrap();
    if metadata.is_file() {
        let file_name = source_buffer.file_name().unwrap_or_else(|| std::ffi::OsStr::new("")).to_string_lossy().into_owned();
        let total_size = metadata.len();

        // Send initial progress
        send_progress(callback, FileType::File(total_size), ProgressReport{
            name: &file_name,  files_copied: 0, bytes_copied: 0
        });

        let copy_result = copy_file_process(source, destination, &file_name, | file_name, bytes_copied|{
            send_progress(callback, FileType::File(total_size), ProgressReport{
                name: &file_name,  files_copied: 1, bytes_copied: bytes_copied as u64
            });
        });

        return copy_result;
    }else if metadata.is_dir() {
        let calculate_result = calculate_folder_size(&source_buffer);
        if calculate_result.is_err() {
            let error_msg = format!("Failed to calculate folder size for {}: {}", source, calculate_result.err().unwrap());
            return Err(io::Error::new(io::ErrorKind::Other, error_msg));
        }
        let folder_info = calculate_result.unwrap();

        let source_file_name = source_buffer.file_name().unwrap().to_string_lossy().into_owned();
        let mut final_dest = format!("{}/{}", destination, source_file_name);
        let mut attempt = 1;
        //check if final_dest folder already exists
        while PathBuf::from(&final_dest).exists(){
            final_dest = format!("{}/{}_{}", destination, source_file_name, attempt);
            attempt += 1;
        }

        let copy_result = copy_folder_iterative(source, &final_dest, &folder_info, callback);
        if copy_result.is_ok() {
            send_progress(callback, FileType::Folder(&folder_info), ProgressReport{
                name: &folder_info.name,
                files_copied: folder_info.file_count, bytes_copied: folder_info.total_size
            });
        }
        return copy_result;
    } else {
        let error_msg = format!("Source path is neither a file nor a directory: {}", source);
        return Err(io::Error::new(io::ErrorKind::InvalidInput, error_msg));
    }
}