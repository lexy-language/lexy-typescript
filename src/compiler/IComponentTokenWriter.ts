import type {IComponentNode} from "../language/componentNode";
import {GeneratedType} from "./generatedType";

export interface IComponentTokenWriter {
   createCode(generateNode: IComponentNode): GeneratedType;
}
