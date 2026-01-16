import {Assert} from "../src";
import {compileExpression} from "./compileExpression";

class VerifyLogging {
  private readonly stringBuilder: string[] = [];
  private errorsValue: boolean;

  private indention: number;

  public get errors(): boolean {
    return this.errorsValue;
  }

  public toString() {
    return this.stringBuilder.join("");
  }

  public errorOccurred(): void {
    this.errorsValue = true;
  }

  public appendLine(message: string) {
    this.stringBuilder.push(message);
  }

  public logAssert(valid: boolean, message: string, title: string) {
    if (valid) return;

    if (this.indention > 0) {
      this.stringBuilder.push(' '.repeat(this.indention * 2));
    }

    this.stringBuilder.push(title + message);
    this.errorsValue = true;
  }

  public withIndentation(action: () => void) {
    this.indention++;
    action();
    this.indention--;
  }
}

export type ModelPropertyHandler<TModel, TProperty> = (value: TModel) => TProperty;
export type ContextHandler<TModel> = (context: VerifyModelContext<TModel>) => void;

export class VerifyModelContext<TModel> {

  private readonly model: TModel;
  private readonly logging: VerifyLogging;

  constructor(model: TModel, logging: VerifyLogging) {
    this.model = model;
    this.logging = logging;
  }

  public fail(message: string): VerifyModelContext<TModel> {
    this.logging.appendLine(">> " + message);
    this.logging.errorOccurred();
    return this;
  }

  public areEqual<TValue>(expression: ModelPropertyHandler<TModel, TValue>, actual: TValue): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    this.logging.logAssert(value == actual, message, `- areEqual Failed '${value}' != '${actual}': `);
    return this;
  }

  public areNotEqual<TValue>(expression: ModelPropertyHandler<TModel, TValue>, actual: TValue): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    this.logging.logAssert(value != actual, message, `- areNotEqual Failed '${value}' == '${actual}': `);
    return this;
  }

  public areSame<TValue>(expression: ModelPropertyHandler<TModel, TValue>, actual: TValue): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    this.logging.logAssert(value === actual, message, `- areSame Failed '${value}' !== '${actual}': `);
    return this;
  }

  public isEmpty<TValue>(expression: ModelPropertyHandler<TModel, TValue>): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    this.logging.logAssert(value == "", message, `- isEmpty Failed '${value}': `);
    return this;
  }

  public isNotNull<TSubModel>(expression: ModelPropertyHandler<TModel, TSubModel>, subContext: ContextHandler<TSubModel>): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    let valid = value != null;
    if (valid) {
      return this.inSubContext(subContext, value);
    }
    this.logging.logAssert(value != null, message, `- isNotNull Failed '${value}': `);
    return this;
  }

  public isNull<TValue>(expression: ModelPropertyHandler<TModel, TValue>): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    this.logging.logAssert(value == null, message, `- isNull Failed '${value}': `);
    return this;
  }

  public isTrue(expression: ModelPropertyHandler<TModel, boolean | null>): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    this.logging.logAssert(value === true, message, `- isTrue Failed '${value}': `);
    return this;
  }

  public isFalse(expression: ModelPropertyHandler<TModel, boolean | null>): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    this.logging.logAssert(value === true, message, `- isFalse Failed '${value}': `);
    return this;
  }

  public countIs<T>(expression: ModelPropertyHandler<TModel, ReadonlyArray<T>>, expected: number): VerifyModelContext<TModel> {
    const [collection, message] = compileExpression(expression, this.model);
    let valid = collection.length == expected;
    this.logging.logAssert(valid, message, `- countIs Failed '${collection.length}' != '${expected}': `);
    return this;
  }

  public countMapIs<TKey, TValue>(expression: ModelPropertyHandler<TModel, Map<TKey, TValue>>, expected: number): VerifyModelContext<TModel> {
    const [collection, message] = compileExpression(expression, this.model);
    let valid = collection.size == expected;
    this.logging.logAssert(valid, message, `- CountIs Failed '${collection.size}' != '${expected}': `);
    return this;
  }

  public containsKey<TKey, TValue>(expression: ModelPropertyHandler<TModel, Map<TKey, TValue>>, key: TKey): VerifyModelContext<TModel> {
    const [collection, message] = compileExpression(expression, this.model);
    let valid = collection.has(key);
    this.logging.logAssert(valid, message, `- containsKey Failed '${key}': `);
    return this;
  }

  public containsKey<TKey, TValue>(expression: ModelPropertyHandler<TModel, Map<TKey, TValue>>, key: TKey, subContext: ContextHandler<TValue> = null) {
    const [collection, message] = compileExpression(expression, this.model);
    let valid = collection.has(key);
    if (collection.has(key)) {
      if (!subContext) return this;
      let collectionValue = collection.get(key);
      return this.inSubContext(subContext, collectionValue);
    }

    this.logging.logAssert(valid, message, `- containsKey '${key}': `);
    return this;
  }

  public valueAt<TItem>(expression: ModelPropertyHandler<TModel, ReadonlyArray<TItem>>, index: number, subContext: ContextHandler<TItem>): VerifyModelContext<TModel> {
    const [list, message] = compileExpression(expression, this.model);
    let value = index >= 0 && index < list.length ? list[index] : null;
    if (value != null) {
      return this.inSubContext(subContext, value);
    }

    this.logging.logAssert(false, message, `- valueAt '${index}': `);
    return this;
  }

  public valueAtEquals<TItem>(expression: ModelPropertyHandler<TModel, ReadonlyArray<TItem>>, index: number, expected: TItem) {
    const [list, message] = compileExpression(expression, this.model);
    let value = index >= 0 && index < list.length ? list[index] : null;
    if (value != null) {
      this.logging.logAssert(expected == expected, message, `- valueAtEquals[${index}] '${expected}' != '${value}': `);
      return this;
    }

    this.logging.logAssert(false, message, `- valueAtEquals[${index}] invalid: `);
    return this;
  }

  public valuePropertyAtEquals<TItem, TValue>(expression: ModelPropertyHandler<TModel, ReadonlyArray<TItem>>, index: number, property: (item: TItem) => TValue, expected: TValue) {
    const [listValue, itemMessage] = compileExpression(expression, this.model);
    let item = index >= 0 && index < listValue.length ? listValue[index] : null;
    if (item != null) {
      const [propertyValue, propertyMessage] = compileExpression(property, item);

      this.logging.logAssert(propertyValue == propertyValue, propertyMessage, `- propertyValueAtEquals[${index}] '${expected}' != '${propertyValue}': `);
      return this;
    }
    this.logging.logAssert(false, itemMessage, `- propertyValueAtEquals[${index}] invalid: `);

    return this;
  }

  private inContext(subContext: (context: VerifyModelContext<TModel>) => void): VerifyModelContext<TModel> {
    this.logging.withIndentation(() => subContext(this));
    return this;
  }

  private inSubContext<TSubModel>(subContext: ContextHandler<TSubModel>, value: TSubModel) {
    this.logging.withIndentation(() => subContext(new VerifyModelContext<TSubModel>(value, this.logging)));
    return this;
  }
}

export class Verify<TModel> {

  private readonly verifyModelContext: VerifyModelContext<TModel>;
  private readonly logging: VerifyLogging = new VerifyLogging();

  constructor(value: TModel) {
    this.verifyModelContext = new VerifyModelContext(value, this.logging);
  }

  public static model<TModel>(value: TModel, testHandler: ContextHandler<TModel>) {

    Assert.notNull(value, "value")
    Assert.notNull(testHandler, "testHandler")

    let verify = new Verify(value);
    verify.execute<TModel>(testHandler);
    verify.verifyAll();
  }

  private execute<TFactory>(testHandler: ContextHandler<TFactory>) {
    testHandler(this.verifyModelContext);
  }

  private verifyAll() {
    let summary = this.logging.toString();
    if (this.logging.errors) {
      throw new Error(summary);
    }

    console.log(summary);
  }
}
