import {Assert} from "../src";
import {VerifyModelContext} from "./verifyModelContext";
import {VerifyLogging} from "./verifyLogging";
import {VerifyContext} from "./verifyContext";
import {VerifyComparableCollectionContext} from "./verifyComparableCollectionContext";
import {VerifyCollectionContext} from "./verifyCollectionContext";

export class Verify<TModel> {

  public static all(testHandler: (contexy: VerifyContext) => void): void {

    Assert.notNull(testHandler, "testHandler");

    let logging = new VerifyLogging();
    let verify = new VerifyContext(logging);
    testHandler(verify);
    logging.assertNoErrors();
  }

  public static async allAsync(testHandler: (context: VerifyContext) => Promise<void>): Promise<void> {

    Assert.notNull(testHandler, "testHandler");

    let logging = new VerifyLogging();
    let verify = new VerifyContext(logging);
    await testHandler(verify);
    logging.assertNoErrors();
  }

  public static model<TModel>(value: TModel, testHandler: (context: VerifyModelContext<TModel>) => void) {

    Assert.notNull(value, "value")
    Assert.notNull(testHandler, "testHandler")

    let logging = new VerifyLogging();
    let verify = new VerifyModelContext(value, logging);
    testHandler(verify);
    logging.assertNoErrors();
  }

  public static collection<TItem>(list: readonly TItem[], testHandler: (context: VerifyCollectionContext<TItem>) => void) {

    Assert.notNull(testHandler, "testHandler")

    let logging = new VerifyLogging();
    let verify = new VerifyCollectionContext<TItem>(list, logging);
    testHandler(verify);
    logging.assertNoErrors();
  }

  public static comparableCollection<TItem>(list: readonly TItem[], testHandler: (context: VerifyComparableCollectionContext<TItem>) => void) {

    Assert.notNull(testHandler, "testHandler")

    let logging = new VerifyLogging();
    let verify = new VerifyComparableCollectionContext<TItem>(list, logging);
    testHandler(verify);
    logging.assertNoErrors();
  }
}
