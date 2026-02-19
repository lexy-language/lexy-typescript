import type {IFileSystem} from "./IFileSystem";

import {Assert} from "./assert";
import {IFile, File} from "./file";

export interface IProject  {
  readonly baseFolder: string;
  readonly fileSystem: IFileSystem;

  file(fileName: string): IFile;
}

export class Project implements IProject {

  public readonly baseFolder: string;
  public readonly fileSystem: IFileSystem;

  constructor(fileSystem: IFileSystem, baseFolder: string | null = null) {
    this.fileSystem = Assert.notNull(fileSystem, "fileSystem");
    this.baseFolder = baseFolder
      ? fileSystem.combine(fileSystem.currentFolder(), baseFolder)
      : fileSystem.currentFolder();
  }

  public file(name : string): IFile {
    return new File(this, name);
  }
}
