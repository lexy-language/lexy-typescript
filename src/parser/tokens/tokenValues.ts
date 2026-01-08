function charOf(value: string): number {
  return value.charCodeAt(0);
}

export class TokenValues {
  public static TableSeparator = charOf('|');
  public static Quote = charOf('\"');
  public static Assignment = charOf('=');

  public static MemberAccessString: string = '.';

  public static ArgumentSeparator = charOf(',');

  public static DivisionOrComment = charOf('/');

  public static Addition = charOf('+');
  public static Subtraction = charOf('-');
  public static Multiplication = charOf('*');
  public static Modulus = charOf('%');
  public static OpenParentheses = charOf('(');
  public static CloseParentheses = charOf(')');
  public static OpenBrackets = charOf('[');
  public static CloseBrackets = charOf(']');
  public static GreaterThan = charOf('>');
  public static LessThan = charOf('<');

  public static NotEqualStart = charOf('!');

  public static And = charOf('&');
  public static Or = charOf('|');

  public static Spread = charOf('.');
  public static DecimalSeparator = charOf('.');

  public static DateTimeStarter: string = `d`;

  public static BooleanTrue: string = `true`;
  public static BooleanFalse: string = `false`;

  public static Dash = charOf('-');
  public static Slash = charOf('/');
  public static Colon = charOf(':');
  public static Space = charOf(' ');
}