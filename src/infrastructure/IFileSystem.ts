export interface IFileSystem {

  readAllLines(fileName: string): Array<string>;

  getFileName(fileName: string): string;
  getDirectoryName(fileName: string): string;
  getFullPath(directoryName: string): string;

  combine(fullPath: string, fileName: string): string;

  fileExists(fileName: string): boolean;
  directoryExists(absoluteFolder: string): boolean;

  isPathRooted(folder: string): boolean;

  getDirectoryFiles(folder: string, extensions: Array<string>): Array<string>;
  getDirectories(folder: string): Array<string>;

  logFolders(): string;
}