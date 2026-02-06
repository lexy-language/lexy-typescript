import {Assert} from "../../infrastructure/assert";
import {IFileSystem} from "../../infrastructure/IFileSystem";
import {ISourceCodeDocument} from "./ISourceCodeDocument";
import {FileSourceDocument} from "./fileSourceDocument";

export class FileDocuments {

  private readonly documentsValue: FileSourceDocument[];

  public get documents(): ISourceCodeDocument[] {
    return this.documentsValue;
  }

  constructor(documents: FileSourceDocument[]) {
    this.documentsValue = Assert.notNull(documents, "documents");
  }

  public static create(fileSystem: IFileSystem, fileNames: readonly string[]): FileDocuments {
    const documents = fileNames.map(fileName => {
      const fullPath = fileSystem.getFullPath(fileName);
      return new FileSourceDocument(fullPath);
    });

    return new FileDocuments(documents);
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

