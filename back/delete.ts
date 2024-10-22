import * as fs from 'fs';
import * as path from 'path';

export function deleteJsFiles(directoryPath: string): void {
    function deleteFile(filePath: string): void {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Ошибка при удалении файла ${filePath}: ${err}`);
            }
        });
    }

    function traverseAndDelete(dir: string): void {
        fs.readdirSync(dir).forEach((file) => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                traverseAndDelete(filePath);
            } else {
                if (file.endsWith('.js')) {
                    deleteFile(filePath);
                }
            }
        });
    }
    const folders = ['scenarios', 'src'];

    folders.forEach((folder) => {
        const folderPath = path.join(directoryPath, folder);
        traverseAndDelete(folderPath);
    });
    fs.unlink("config.js", (err) => {
        if (err) {
            console.error(`Ошибка при удалении файла config.js: ${err}`);
        }
    });
    fs.unlink("delete.js", (err) => {
        if (err) {
            console.error(`Ошибка при удалении файла delete.js: ${err}`);
        }
    });
}
