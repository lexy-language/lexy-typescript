import {ILogger, LogLevel} from "../src";

export class DummyLogger implements ILogger {

  isEnabled(level: LogLevel): boolean {
    return false;
  }

  logDebug(message: string): void {
  }

  logError(message: string): void {
  }

  logInformation(message: string): void {
  }
}
