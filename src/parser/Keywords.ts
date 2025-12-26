export class Keywords {
  public static readonly Function = "function";
  public static readonly EnumKeyword = "enum";
  public static readonly TableKeyword = "Table:";
  public static readonly TypeKeyword = "Type:";
  public static readonly ScenarioKeyword = "scenario";

  public static readonly If = "if";
  public static readonly Else = "else";
  public static readonly Elseif = "elseif";

  public static readonly Switch = "switch";
  public static readonly Case = "case";
  public static readonly Default = "default";

  public static readonly Include = "Include";

  public static readonly Parameters = "Parameters";
  public static readonly Results = "Results";
  public static readonly ValidationTable = "ValidationTable";
  public static readonly ExecutionLogging = "ExecutionLogging";
  public static readonly ExecutionLog = "Log";
  public static readonly Code = "Code";
  public static readonly ExpectErrors = "ExpectErrors";
  public static readonly ExpectComponentErrors = "ExpectComponentErrors";
  public static readonly ExpectExecutionErrors = "ExpectExecutionErrors";

  public static readonly ImplicitVariableDeclaration = "var";

  private static readonly values = [
    Keywords.Function,
    Keywords.EnumKeyword,
    Keywords.TableKeyword ,
    Keywords.TypeKeyword,
    Keywords.ScenarioKeyword,
    Keywords.ValidationTable,
    Keywords.If,
    Keywords.Else,
    Keywords.Elseif,
    Keywords.Switch,
    Keywords.Case,
    Keywords.Default,
    Keywords.Include,
    Keywords.Parameters,
    Keywords.Results,
    Keywords.Code,
    Keywords.ExecutionLogging,
    Keywords.ExecutionLog,
    Keywords.ExpectErrors,
    Keywords.ExpectComponentErrors,
    Keywords.ExpectExecutionErrors,
    Keywords.ImplicitVariableDeclaration
  ];

  public static contains(keyword: string): boolean {
    return Keywords.values.findIndex(value => value == keyword) >= 0;
  }
}