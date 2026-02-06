import {VerifyLogging} from "./verifyLogging";
import {Assert} from "../src";
import {VerifyCollectionContext} from "./verifyCollectionContext";

export class VerifyContext {

  private readonly logging: VerifyLogging;

  constructor(logging: VerifyLogging) {
    this.logging = Assert.notNull(logging, "logging");
  }

  public collection<TItem>(list: readonly TItem[], testHandler: (context: VerifyCollectionContext<TItem>) => void): VerifyContext {

    Assert.notNull(list, "list");
    Assert.notNull(testHandler, "testHandler");

    let verify = new VerifyCollectionContext<TItem>(list, this.logging);
    testHandler(verify);

    return this;
  }

  public fail(message: string): VerifyContext {
    this.logging.logAssert(false, message, "Failed");
    return this;
  }

  public isTrue(contains: boolean, message: string): VerifyContext {
    this.logging.logAssert(contains, message, "- Is true invalid: ");
    return this;
  }
}
