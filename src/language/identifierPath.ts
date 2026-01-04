import {isNullOrEmpty} from "../infrastructure/validationFunctions";
import {addRange, take} from "../infrastructure/arrayFunctions";

export class IdentifierPath {

  public readonly path: string[];

  public get rootIdentifier(): string {
    return this.path[0];
  }

  public get hasChildIdentifiers(): boolean {
    return this.path.length > 1;
  }

  public get parts(): number {
    return this.path.length;
  }

  constructor(identifierPath: string[]) {
    this.path = identifierPath;
  }

  public fullPath(): string {
    return this.path.join('.');
  }

  public lastPart(): string {
    return this.path[this.path.length - 1];
  }

  public toString(): string {
    return this.fullPath();
  }

  public childrenReference(): IdentifierPath {
    const parts = this.path.slice(1);
    return new IdentifierPath(parts);
  }

  append(parts: Array<string>): IdentifierPath {
    const newPath = [...this.path, ...parts];
    return new IdentifierPath(newPath);
  }

  public withoutLastPart(): IdentifierPath {
    if (this.parts <= 1) throw new Error("Parts <= 1");

    return new IdentifierPath(take(this.path, this.parts - 1));
  }

  public static parse(parts: string[]): IdentifierPath {
    if (!parts) throw new Error("Invalid empty identifier reference.")
    const allParts = Array<string>();
    addRange(allParts, parts, this.splitBySeparator);
    return new IdentifierPath(parts);
  }

  static parseString(path: string): IdentifierPath {
    if (isNullOrEmpty(path)) throw new Error("Invalid empty identifier reference.")
    const parts = this.splitBySeparator(path);
    return new IdentifierPath(parts);
  }

  private static splitBySeparator(path: string) {
    return path.split(".");
  }
}
