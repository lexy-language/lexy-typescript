import {ISourceCodeDocument} from "./ISourceCodeDocument";

export interface ISourceCodeDocuments {

  get documents(): readonly ISourceCodeDocument[];

  dispose(): void;
}
