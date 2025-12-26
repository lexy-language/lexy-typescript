export class Keywords {
  public static readonly Function = "function";
  public static readonly EnumKeyword = "enum";
  public static readonly TableKeyword = "table";
  public static readonly TypeKeyword = "type";
  public static readonly ScenarioKeyword = "scenario";

  public static readonly If = "if";
  public static readonly Else = "else";
  public static readonly Elseif = "elseif";

  public static readonly Switch = "switch";
  public static readonly Case = "case";
  public static readonly Default = "default";

  public static readonly Include = "include";

  public static readonly Parameters = "parameters";
  public static readonly Results = "results";
  public static readonly ValidationTable = "validationTable";

  public static readonly ExpectErrors = "expectErrors";
  public static readonly ExpectComponentErrors = "expectComponentErrors";
  public static readonly ExpectExecutionErrors = "expectExecutionErrors";
  public static readonly ExecutionLogging = "executionLogging";
  public static readonly ExecutionLog = "log";

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