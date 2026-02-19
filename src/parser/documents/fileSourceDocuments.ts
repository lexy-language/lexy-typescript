import type {ISourceCodeDocument} from "./ISourceCodeDocument";
import type {IFileSystem} from "../../infrastructure/IFileSystem";
import type {ISourceCodeDocuments} from "./ISourceCodeDocuments";

import {Assert} from "../../infrastructure/assert";
import {IFile} from "../../infrastructure/file";

export class FileSourceDocuments implements ISourceCodeDocuments {

  private readonly documentsValue: ISourceCodeDocument[];

  public get documents(): readonly ISourceCodeDocument[] {
    return this.documentsValue;
  }

  constructor(documents: ISourceCodeDocument[]) {
    this.documentsValue = Assert.notNull(documents, "documents");
  }

  public static async create(fileSystem: IFileSystem, files: readonly IFile[]): Promise<ISourceCodeDocuments> {

    Assert.notNull(fileSystem, "fileSystem");
    Assert.notNull(files, "files");

    const documents = [];
    for (const file of files) {
      documents.push(await fileSystem.createFileSourceDocument(file));
    }

    return new FileSourceDocuments(documents);
  }

  public dispose() {
    const errors = [];
    for (const document of this.documentsValue) {
      try {
        document.dispose();
      } catch (error){
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      const errorsString = [];
      for (const error of errors) {
        errorsString.push(error + "\n");
      }
      throw new Error("Error occurred while disposing source file documents: \n" + errorsString);
    }
  }
}

