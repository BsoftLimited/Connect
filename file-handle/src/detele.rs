use std::{fs, io};
use std::io::Error;
use std::path::{Path, PathBuf};
use std::sync::mpsc::{channel, Sender};
use std::thread;

use crate::callbacks::{DeleteCallback};
use crate::folder::calculate_folder_size;

pub struct DeleteProgress {
    pub current_file: String,
    pub total_files: i32,
    pub total_deleted: i32,
    pub completed: i32,
    pub error: Option<String>,
}

// Helper function to send progress updates
fn send_progress( tx: &Sender<DeleteProgress>, path: &PathBuf, total_files: i32, total_deleted: i32, completed: i32, error: Option<String>) {
    let result= tx.send(DeleteProgress {
        current_file: path.to_string_lossy().into_owned(),
        total_files,
        total_deleted,
        completed,
        error,
    });

    if let Err(error) = result{
        println!("unable to sent delete update: {}", error);
    }
}

fn send_callback_progress(callback: &DeleteCallback, progress: &DeleteProgress ) {
    let name_ptr = std::ffi::CString::new(progress.current_file.clone()).unwrap().into_raw();
    let total_files = progress.total_files;
    let total_deleted = progress.total_deleted;
    let completed = progress.completed;
    
    callback(name_ptr, total_files, total_deleted, completed);
    
    unsafe {
        let _ = std::ffi::CString::from_raw(name_ptr as *mut _);
    }  
}


// Main deletion function with progress reporting
pub fn delete<P: AsRef<Path>>( path: P, callback: DeleteCallback) -> io::Result<()> {
    let path = path.as_ref();
    let (tx, rx) = channel();
    let path_buf = path.to_path_buf();
    
    // Spawn a thread to handle the deletion
    let handle = thread::spawn(move || {
        let mut total_deleted = 0;
        // Send initial progress
        send_progress(&tx, &path_buf, total_deleted, 0, 0, None);

        let total_files_result = {
            let metadata = fs::metadata(&path_buf);
            if metadata.is_err(){
                io::Result::Err(metadata.err().unwrap())
            }else if metadata.unwrap().is_dir(){
                let result = calculate_folder_size(&path_buf);
                if result.is_err(){
                    io::Result::Err(result.err().unwrap())
                }else{
                    let info = result.unwrap();
                    Ok(info.file_count + info.folder_count + 1)
                }
            }else{
                Ok(1)
            }
        };

        if let Err(error) = total_files_result{
            send_progress(&tx, &path_buf, 0,  total_deleted, 0, Some(error.to_string()));
            return;
        }
            
        let total_files = total_files_result.unwrap();

        if let Err(e) = delete_iterative(&path_buf, &tx, total_files, &mut total_deleted) {
            send_progress(&tx, &path_buf, total_files,  total_deleted, 0, Some(e.to_string()));
            return;
        }
    });

    // Listen for progress updates and call the callback
    while let Ok(progress) = rx.recv() {
        if let Some(error) = &progress.error{
            return Err(Error::new(io::ErrorKind::Other, error.to_string()));
        }

        send_callback_progress(&callback, &progress);
        if progress.completed == 1 {
            println!("finised delete operation");
            break;
        }
    }
    
    handle.join().map(|_| Ok(())).map_err(|e| {
        Error::new(io::ErrorKind::UnexpectedEof, format!("Thread error: {:?}", e))
    })?
}


#[derive(Debug)]
enum ProcessState {
    FirstVisit(PathBuf),
    ReadyToDelete(PathBuf),
}

// Iterative deletion with state tracking
fn delete_iterative( path: &PathBuf, tx: &Sender<DeleteProgress>, total_files: i32, total_deleted: &mut i32) -> io::Result<()> {
    let mut stack = vec![ProcessState::FirstVisit(path.clone())];

    while let Some(state) = stack.pop() {
        match state {
            ProcessState::FirstVisit(current_path) => {
                let metadata = fs::metadata(&current_path)?;
                
                if metadata.is_dir() {
                    // Read directory contents
                    let entries: Vec<_> = fs::read_dir(&current_path)?.filter_map(|entry| entry.ok()).map(|entry| entry.path()).collect();

                    if entries.is_empty() {
                        // Empty directory - delete immediately
                        let delete_result = fs::remove_dir(&current_path);
                        if delete_result.is_err(){
                            return delete_result;
                        }
                        *total_deleted += 1;
                        send_progress(tx, &current_path, total_files, *total_deleted, 0, None);
                    } else {
                        // Push directory for later deletion after processing contents
                        stack.push(ProcessState::ReadyToDelete(current_path));
                        
                        // Push all contents for processing
                        for entry in entries {
                            stack.push(ProcessState::FirstVisit(entry));
                        }
                    }
                } else {
                    // It's a file - delete it
                    let delete_result =  fs::remove_file(&current_path);
                    if delete_result.is_err(){
                        return delete_result;
                    }
                    *total_deleted += 1;
                    send_progress(tx, &current_path, total_files, *total_deleted, 0, None);
                }
            }
            ProcessState::ReadyToDelete(dir_path) => {
                // Delete directory (contents should be deleted by now)
                let delete_result = fs::remove_dir(&dir_path);
                if delete_result.is_err(){
                    if delete_result.as_ref().err().unwrap().kind() == std::io::ErrorKind::NotFound{
                        continue;
                    }
                    return delete_result;
                }

                *total_deleted += 1;
                send_progress(tx, &dir_path, total_files, *total_deleted, 0, None);
            }
        }
    }

    // Send completion progress
    send_progress(&tx, &path, total_files, total_files, 1, None);

    Ok(())
}