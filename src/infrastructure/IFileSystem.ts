import type {ISourceCodeDocument} from "../parser/documents/ISourceCodeDocument";
import type {ISourceCodeDocuments} from "../parser/documents/ISourceCodeDocuments";
import type {IFile} from "./file";

export interface IFileSystem {

  readAllLines(fileName: string): Promise<Array<string>>;
  writeAllLines(fileName: string, lines: readonly string[]): Promise<void>;

  fileExists(fileName: string): Promise<boolean>;
  directoryExists(absoluteFolder: string): Promise<boolean>;

  getDirectoryFiles(folder: string, extensions: Array<string>): Promise<string[]>;
  getDirectories(folder: string): Promise<string[]>;

  currentFolder(): string;

  getFileName(fileName: string): string;
  getDirectoryName(fileName: string): string;
  getFullPath(directoryName: string): string;

  combine(fullPath: string, fileName: string): string;

  isPathRooted(folder: string): boolean;

  logFolders(): string;

  createFileSourceDocument(file: IFile): Promise<ISourceCodeDocument>;
  createFileSourceDocuments(files: readonly IFile[]): Promise<ISourceCodeDocuments>;
}
