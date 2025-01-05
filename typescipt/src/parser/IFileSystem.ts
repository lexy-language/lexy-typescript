export interface IFileSystem {

  readAllLines(fileName: string): Array<string>;

  getFileName(fullFileName: string): string;
  getDirectoryName(parentFullFileName: string): string;
  getFullPath(directName: string): string;

  combine(fullPath: string, fileName: string): string;

  fileExists(fullFinName: string): boolean;
}