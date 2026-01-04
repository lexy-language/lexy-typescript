import {IdentifierPath} from "../language/identifierPath";
import {DateLibrary} from "../runTime/libraries/dateLibrary";
import {NumberLibrary} from "../runTime/libraries/numberLibrary";
import {MathLibrary} from "../runTime/libraries/mathLibrary";
import {LibraryRuntime} from "../runTime/libraries/libraryRuntime";
import {ILibrary, Library} from "./library";

export interface ILibraries {
  getLibrary(identifier: IdentifierPath): ILibrary | null;
  runtimes(): ReadonlyArray<ILibrary>;
}

export class Libraries implements ILibraries {

  private libraryObjects: {[key: string]: ILibrary} = {};

  public constructor(libraryRuntimes: LibraryRuntime[]) {
    this.addSystemLibraries();
    libraryRuntimes?.forEach(library => this.addLibrary(library));
  }

  private addSystemLibraries() {
    this.addLibrary(DateLibrary);
    this.addLibrary(MathLibrary);
    this.addLibrary(NumberLibrary);
  }

  private addLibrary(libraryRuntime: LibraryRuntime) {
    const library = Library.build(libraryRuntime);
    this.libraryObjects[library.name] = library;
  }

  public getLibrary(identifier: IdentifierPath): ILibrary | null {
    return this.libraryObjects[identifier.fullPath()] ?? null;
  }

  public runtimes(): ReadonlyArray<ILibrary> {
    const result = new Array<ILibrary>();
    for (const key in this.libraryObjects) {
      const libraryObject = this.libraryObjects[key];
      result.push(libraryObject.runTime);
    }
    return result;
  }
}