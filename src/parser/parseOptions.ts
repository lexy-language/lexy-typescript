
export interface ILineFilter {
  useLine(content: string): boolean;
}

export type ParseOptions = {
  suppressException?: boolean;
  lineFilter?: ILineFilter
}