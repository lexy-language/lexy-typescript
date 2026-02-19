import {compileExpression} from "./compileExpression";
import {Assert} from "../src";
import {VerifyLogging} from "./verifyLogging";
import {VerifyCollectionContext} from "./verifyCollectionContext";

export type ModelPropertyHandler<TModel, TProperty> = (value: TModel) => TProperty;

export class VerifyModelContext<TModel> {

  protected readonly model: TModel;
  protected readonly logging: VerifyLogging;

  constructor(model: TModel, logging: VerifyLogging) {
    this.model = Assert.notNull(model, "model");
    this.logging = Assert.notNull(logging, "logging");
  }

  public collection<TItem>(expression: ModelPropertyHandler<TModel, TItem>,
                           handler: (context: VerifyCollectionContext<TItem>) => void): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    this.logging.appendLine("Collection: " + message);
    handler(new VerifyCollectionContext<TItem>(value, this.logging));
    return this;
  }

  public fail(message: string): VerifyModelContext<TModel> {
    this.logging.appendLine(">> " + message);
    this.logging.errorOccurred();
    return this;
  }

  public areEqual<TValue>(expression: ModelPropertyHandler<TModel, TValue>, actual: TValue, extraMessage: string = null): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    const suffix = extraMessage != null ? ` (${extraMessage})` : "";
    this.logging.logAssert(value == actual, message, `- areEqual Failed '${value}' != '${actual}' ${suffix}: `);
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

  public isNotNull<TSubModel>(expression: ModelPropertyHandler<TModel, TSubModel>,
                              subContext: (context: VerifyModelContext<TSubModel>) => void,
                              extraMessage: string = null): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    let valid = value != null;
    if (valid) {
      return this.inSubContext(subContext, value);
    }
    this.logging.logAssert(value != null, message, `- isNotNull Failed '${extraMessage}': `);
    return this;
  }

  public isNull<TValue>(expression: ModelPropertyHandler<TModel, TValue>, extraMessage: string = null): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    const suffix = extraMessage != null ? ` (${extraMessage})` : "";
    this.logging.logAssert(value == null, message, `- isNull Failed '${value}${suffix}': `);
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

  public isOfType<TExpected>(expression: ModelPropertyHandler<TModel, object>, typeName: string, cast: (value: object) => TExpected, subContext: (context: VerifyModelContext<TExpected> | null) => void = null): VerifyModelContext<TModel> {
    const [value, message] = compileExpression(expression, this.model);
    const subInstance = cast(value);
    const valid = subInstance != null;
    if (valid) {
      return this.inSubContext(subContext, subInstance);
    }

    this.logging.logAssert(false, message, `- isOfType<${typeName}> Failed: `);
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

  public containsKey<TKey, TValue>(expression: ModelPropertyHandler<TModel, Map<TKey, TValue>>, key: TKey, subContext: ((context: VerifyModelContext<TModel>) => void) | null = null) {
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

  public ifNotNull<T>(value: T, subContext: (context: VerifyModelContext<TModel>) => void): VerifyModelContext<TModel> {
    if (value != null) {
      subContext(this);
    }
    return this;
  }

  public forEach<TItem>(items: readonly TItem[], handler: (item: TItem) => void): void {
    for (const item of items) {
      handler(item);
    }
  }

  private inContext(subContext: (context: VerifyModelContext<TModel>) => void): VerifyModelContext<TModel> {
    this.logging.withIndentation(() => subContext(this));
    return this;
  }

  private inSubContext<TSubModel>(subContext: (context: VerifyModelContext<TSubModel>) => void, value: TSubModel) {
    if (subContext != null) {
      this.logging.withIndentation(() => subContext(new VerifyModelContext<TSubModel>(value, this.logging)));
    }
    return this;
  }
}
