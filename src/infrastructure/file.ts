import {Assert} from "./assert";
import {IProject} from "./project";

export interface IFile {
  readonly project: IProject;
  readonly name: string;
  readonly baseFolder: string;
  readonly fullPath: string;

  equals(file: IFile): boolean;
}

export class File implements IFile  {

  public readonly project: IProject;

  public readonly name: string;
  public readonly baseFolder: string;
  public readonly fullPath: string;

  constructor(project: IProject, name: string) {
    this.project = Assert.notNull(project, "project");
    this.name = name;
    this.baseFolder = this.project.baseFolder;
    this.fullPath = this.project.fileSystem.combine(this.project.baseFolder, this.name);
  }

  public equals(other: File): boolean {
    return this.fullPath == other.fullPath;
  }

  public toString() {
    return this.name;
  }
}
