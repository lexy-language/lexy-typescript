export interface IFileSystem {

  readAllLines(fileName: string): Promise<Array<string>>;

  fileExists(fileName: string): Promise<boolean>;
  directoryExists(absoluteFolder: string): Promise<boolean>;

  getDirectoryFiles(folder: string, extensions: Array<string>): Promise<string[]>;
  getDirectories(folder: string): Promise<string[]>;

  getFileName(fileName: string): string;
  getDirectoryName(fileName: string): string;
  getFullPath(directoryName: string): string;

  combine(fullPath: string, fileName: string): string;

  isPathRooted(folder: string): boolean;

  logFolders(): string;
}
