import type {ISourceCodeDocument} from "./ISourceCodeDocument";
import type {IFileSystem} from "../../infrastructure/IFileSystem";
import type {ISourceCodeDocuments} from "./ISourceCodeDocuments";

import {Assert} from "../../infrastructure/assert";

export class FileSourceDocuments implements ISourceCodeDocuments {

  private readonly documentsValue: ISourceCodeDocument[];

  public get documents(): ISourceCodeDocument[] {
    return this.documentsValue;
  }

  constructor(documents: ISourceCodeDocument[]) {
    this.documentsValue = Assert.notNull(documents, "documents");
  }

  public static async create(fileSystem: IFileSystem, fileNames: readonly string[]): Promise<ISourceCodeDocuments> {

    Assert.notNull(fileSystem, "fileSystem");
    Assert.notNull(fileNames, "fileNames");

    const documents = [];
    for (const fileName of fileNames) {
      const fullPath = fileSystem.getFullPath(fileName);
      documents.push(await fileSystem.createFileSourceDocument(fullPath));
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

