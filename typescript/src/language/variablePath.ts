import {isNullOrEmpty} from "../parser/tokens/character";

export class VariablePath {

  public readonly path: string[];

  public get parentIdentifier(): string {
    return this.path[0];
  }

  public get hasChildIdentifiers(): boolean {
    return this.path.length > 1;
  }

  public get parts(): number {
    return this.path.length;
  }

  constructor(variablePath: string[]) {
    this.path = variablePath;
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

  public childrenReference(): VariablePath {
    const parts = this.path.slice(1);
    return new VariablePath(parts);
  }

  append(parts: Array<string>): VariablePath {
    const newPath = [...this.path, ...parts];
    return new VariablePath(newPath);
  }
}
