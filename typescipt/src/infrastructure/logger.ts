export enum LogLevel {
  Debug = "Debug",
  Information = "Information",
  Warning = "Warning",
  Error = "Error"
}

export interface ILogger {
  logDebug(message: string): void;
  logInformation(message: string): void;
  logError(message: string): void;
  isEnabled(level: LogLevel): boolean;
}

export class ConsoleLogger implements ILogger {
  isEnabled(level: LogLevel) {
    return true;
  }

  logDebug(message: string) {
    console.log(`[DBG] - ${message}`)
  }

  logError(message: string) {
    console.log(`[ERR] - ${message}`)
  }

  logInformation(message: string) {
    console.log(`[INF]  - ${message}`)
  }
}

