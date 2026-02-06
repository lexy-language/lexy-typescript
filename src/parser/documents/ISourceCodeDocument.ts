import {Line} from "../line";

export interface ISourceCodeDocument {

  readonly fullFileName: string;

  hasMoreLines(): boolean;
  nextLine(): Line;
}
