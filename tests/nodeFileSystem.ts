import {IFileSystem} from "../src/infrastructure/IFileSystem";
import {any} from "../src/infrastructure/arrayFunctions"
import path from "path";
import fs from "fs";

export class NodeFileSystem implements IFileSystem {
  combine(fullPath: string, fileName: string): string {
    return path.join(fullPath, fileName);
  }

  async readAllLines(fileName: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      fs.readFile(fileName, 'utf8', (error, value: string) => {
        if (error) return reject(error);
        resolve(value != null ? value.split('\n') : null);
      })
    });
  }

  fileExists(fileName: string): Promise<boolean> {
    //Silly, but fs.exists is marked as deprecated in my node version
    return new Promise<boolean>((resolve, reject) => {
      try {
        resolve(fs.existsSync(fileName));
      } catch (error) {
        reject(error);
      }
    });
  }

  directoryExists(folder: string): Promise<boolean> {
    //Silly, but fs.exists is marked as deprecated in my node version
    return new Promise<boolean>((resolve, reject) => {
      try {
        resolve(fs.existsSync(folder));
      } catch (error) {
        reject(error);
      }
    });
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


  async getDirectories(folder: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      fs.readdir(folder, {withFileTypes: true}, (err, data) => {
        if (err) return reject(err);
        resolve(data.filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name));
      });
    });
  }

  async getDirectoryFiles(folder: string, filter: Array<string>): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      return fs.readdir(folder, { withFileTypes: true }, (err, data) => {
        if (err) return reject(err);
        resolve(data.filter(dirent => dirent.isFile() && any(filter, extension => dirent.name.endsWith(extension)))
          .map(dirent => dirent.name));
      });
    });
  }

  isPathRooted(folder: string): boolean {
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
    const folders = fs.readdirSync(folder, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    for (const each of folders) {
      const fullPath = this.combine(folder, each);
      result.push(fullPath);
      this.addFolder(fullPath, result);
    }
  }
}
