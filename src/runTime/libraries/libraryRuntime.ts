export enum Types {
  Number = "number",
  String = "string",
  Date ="date"
}

export type LibraryFunctionInfo = {returnType: Types, args: Types[]}
export type LibraryFunctionsInfo = {[name: string]: LibraryFunctionInfo}
export type LibraryFunctions = {[name: string]: Function}

export type LibraryRuntime = {
  name: string,
  functions: LibraryFunctions,
  functionsInfo: LibraryFunctionsInfo
}