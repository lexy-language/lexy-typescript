export enum OperatorType {
  NotSet = "NotSet",

  Assignment = "Assignment",
  Addition = "Addition",
  Subtraction = "Subtraction",
  Multiplication = "Multiplication",
  Division = "Division",
  Modulus = "Modulus",
  OpenParentheses = "OpenParentheses",
  CloseParentheses = "CloseParentheses",
  OpenBrackets = "OpenBrackets",
  CloseBrackets = "CloseBrackets",
  GreaterThan = "GreaterThan",
  LessThan = "LessThan",
  GreaterThanOrEqual = "GreaterThanOrEqual",
  LessThanOrEqual = "LessThanOrEqual",

  Equals = "Equals",
  NotEqual = "NotEqual",

  And = "And",
  Or = "Or",

  ArgumentSeparator = "ArgumentSeparator",
  Spread = "Spread"
}