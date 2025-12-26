import {IFileSystem} from "../src/infrastructure/IFileSystem";
import {any} from "../src/infrastructure/arrayFunctions"
import path from "path";
import fs from "fs";

export class NodeFileSystem implements IFileSystem {
  combine(fullPath: string, fileName: string): string {
    return path.join(fullPath, fileName);
  }

  fileExists(fullFinName: string): boolean {
    return fs.existsSync(fullFinName);
  }

  getDirectoryName(fileName: string): string {
    return path.dirname(fileName);
  }

  getFileName(fileName: string): string {
    return path.basename(fileName);
  }

  getFullPath(fileName: string): string {
    return path.resolve(fileName);
  }

  readAllLines(fileName: string): Array<string> {
    return fs.readFileSync(fileName)
      .toString('utf8')
      .split('\n');
  }

  directoryExists(absoluteFolder: string): boolean {
    return fs.existsSync(absoluteFolder);
  }

  getDirectories(folder: string): Array<string> {
    return fs.readdirSync(folder, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
  }

  getDirectoryFiles(folder: string, filter: Array<string>): Array<string> {
    return fs.readdirSync(folder, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && any(filter, extension => dirent.name.endsWith(extension)))
      .map(dirent => dirent.name);
  }

  isPathComponented(folder: string): boolean {
    return path.isAbsolute(folder);
  }

  currentFolder() {
    return __dirname
  }

  logFolders(): string {
    const result = [];
    this.addFolder(this.currentFolder(), result);
    return result.join("\n");
  }

  private addFolder(folder: string, result: any[]) {
    const folders = this.getDirectories(folder);
    for (const each of folders) {
      const fullPath = this.combine(folder, each);
      result.push(fullPath);
      this.addFolder(fullPath, result);
    }
  }
}