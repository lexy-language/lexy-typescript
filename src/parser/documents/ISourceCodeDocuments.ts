import {ISourceCodeDocument} from "./ISourceCodeDocument";

export interface ISourceCodeDocuments {

  get documents(): ISourceCodeDocument[];

  dispose(): void;
}
