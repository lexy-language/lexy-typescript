import {IFile} from "../src/infrastructure/file";
import {IProject, Project} from "../src/infrastructure/project";
import {NodeFileSystem} from "./nodeFileSystem";

export class TestFile implements IFile {

  private static readonly project: IProject = new Project(new NodeFileSystem());

  public get project(): IProject {
    return TestFile.project;
  }

  public readonly name: string = "tests.lexy";
  public readonly baseFolder: string = "/";
  public readonly fullPath: string = "/tests.lexy";

  public static instance: IFile = new TestFile();

  equals(file: IFile): Boolean {
    return file && file.fullPath == this.fullPath;
  }
}
