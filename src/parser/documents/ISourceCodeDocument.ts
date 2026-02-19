import {Line} from "../line";
import {IFile} from "../../infrastructure/file";

export interface ISourceCodeDocument {

  readonly file: IFile;

  hasMoreLines(): boolean;
  nextLine(): Line;

  dispose(): void;
}
