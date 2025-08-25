import { FileCopier } from "./src/utils/file-copy";

async function main() {
  const source = './large-file.iso';
  const destination = './copy-large-file.iso';

  console.log('Starting file copy...');

  try {
    const success = await FileCopier.copyFile(source, destination, (progress) => {
      if (progress.error) {
        console.error(`Error: ${progress.error}`);
        return;
      }

      if (progress.completed) {
        console.log('Copy completed successfully!');
        return;
      }

      console.log(
        `Progress: ${progress.percentage.toFixed(1)}% ` +
        `(${formatBytes(progress.bytes_copied)} / ${formatBytes(progress.total_bytes)})`
      );
    });

    console.log(success ? 'Copy succeeded' : 'Copy failed');
  } catch (error) {
    console.error('Copy error:', error);
  }
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Run the example
main();