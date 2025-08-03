export const isVideoOrAudio = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? "unknown";
    return ["mp4", "mkv", "avi", "mp3", "wav"].includes(ext);
}