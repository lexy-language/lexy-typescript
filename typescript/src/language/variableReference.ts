import {isNullOrEmpty} from "../parser/tokens/character";

export class VariableReference {

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

  public toString(): string {
    return this.fullPath();
  }

  public childrenReference(): VariableReference {
    const parts = this.path.slice(1);
    return new VariableReference(parts);
  }

  static parse(key: string): VariableReference {
    if (isNullOrEmpty(key)) throw new Error("Invalid empty variable reference.")
    const parts = key.split(".");
    return new VariableReference(parts);
  }

  append(parts: Array<string>): VariableReference {
    const newPath = [...this.path, ...parts];
    return new VariableReference(newPath);
  }
}
