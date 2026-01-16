import {Assert} from "../src";

class VerifyLogging
{
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

    public logAssert(valid: boolean, message:string, title: string) {
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

export type ContextHandler = (context: VerifyModelContext) => void;
export type SubContextHandler<TValue> = (value: TValue, context: VerifyModelContext) => void;

export class VerifyModelContext {

    private readonly logging: VerifyLogging;

    constructor(logging: VerifyLogging) {
        this.logging = logging;
    }
    
    public fail(message: string): VerifyModelContext {
        this.logging.appendLine(">> " + message);
        this.logging.errorOccurred();
        return this;
    }

    public areEqual<T>(value: T, actual: T, message: string): VerifyModelContext {
        this.logging.logAssert(value == actual, message, `- areEqual Failed '${value}' != '${actual}': `);
        return this;
    }

    public areNotEqual<T>(value: T, actual: T, message: string): VerifyModelContext {
        this.logging.logAssert(value != actual, message, `- areNotEqual Failed '${value}' == '${actual}': `);
        return this;
    }

    public areSame<T>(value: T, actual: T, message: string): VerifyModelContext {
        this.logging.logAssert(value === actual, message, `- areSame Failed '${value}' !== '${actual}': `);
        return this;
    }

    public isEmpty(value: string, message: string): VerifyModelContext {
        this.logging.logAssert(value == "", message, `- isEmpty Failed '${value}': `);
        return this;
    }

    public isNotNull<TSubModel>(value: TSubModel, message: string, subContext: SubContextHandler<TSubModel>): VerifyModelContext {
        var valid = value != null;
        if (valid) {
            return this.inSubContext(subContext, value);
        }
        this.logging.logAssert(value != null, message, `- isNotNull Failed '${value}': `);
        return this;
    }

    public isNull(value: string, message: string): VerifyModelContext {
        this.logging.logAssert(value == null, message, `- isNull Failed '${value}': `);
        return this;
    }

    public isTrue(value: boolean | null, message: string): VerifyModelContext {
        this.logging.logAssert(value === true, message, `- isTrue Failed '${value}': `);
        return this;
    }

    public isFalse(value: boolean | null, message: string): VerifyModelContext {
        this.logging.logAssert(value === true, message, `- isFalse Failed '${value}': `);
        return this;
    }

    public countIs<T>(collection: ReadonlyArray<T>, expected: number, message: string): VerifyModelContext {
        let valid = collection.length == expected;
        this.logging.logAssert(valid, message, `- countIs Failed '${collection.length}' != '${expected}': `);
        return this;
    }

    public countMapIs<TKey, TValue>(collection: Map<TKey, TValue>, expected: number, message: string): VerifyModelContext {
        let valid = collection.size == expected;
        this.logging.logAssert(valid, message, `- CountIs Failed '${collection.size}' != '${expected}': `);
        return this;
    }

    public containsKey<TKey, TValue>(collection: Map<TKey, TValue>, key: TKey, message: string): VerifyModelContext {
        let valid = collection.has(key);
        this.logging.logAssert(valid, message, `- containsKey Failed '${key}': `);
        return this;
    }

    public containsKey<TKey, TValue>(collection: Map<TKey, TValue>, key: TKey, message: string, subContext: SubContextHandler<TValue> = null) {
        let valid = collection.has(key);
        if (collection.has(key)) {
            if (!subContext) return this;
            let collectionValue = collection.get(key);
            return this.inSubContext(subContext, collectionValue);
        }

        this.logging.logAssert(valid, message, `- containsKey '${key}': `);
        return this;
    }

    public valueAt<TItem>(list: ReadonlyArray<TItem>, index: number, message: string, subContext: SubContextHandler<TItem>): VerifyModelContext {
        let value = index >= 0 && index < list.length ? list[index] : null;
        if (value != null) {
            return this.inSubContext(subContext, value);
        }

        this.logging.logAssert(false, message, `- valueAt '${index}': `);
        return this;
    }

    public valueAtEquals<TItem>(list: ReadonlyArray<TItem>, index: number, expected: TItem, message: string) {
        let value = index >= 0 && index < list.length ? list[index] : null;
        if (value != null) {
            this.logging.logAssert(expected == expected, message, `- valueAtEquals[${index}] '${expected}' != '${value}': `);
            return this;
        }

        this.logging.logAssert(false, message, `- valueAtEquals[${index}] invalid: `);
        return this;
    }

    public valuePropertytAtEquals<TItem, TValue>(list: ReadonlyArray<TItem>, index: number, property: (item: TItem) => TValue, expected: TValue, message: string) {
        let item = index >= 0 && index < list.length ? list[index] : null;
        if (item != null) {
            let propertyValue = property(item);
            this.logging.logAssert(propertyValue == propertyValue, message, `- propertyValueAtEquals[${index}] '${expected}' != '${propertyValue}': `);
            return this;
        }
        this.logging.logAssert(false, message, `- propertyValueAtEquals[${index}] invalid: `);

        return this;
    }

    private inContext(subContext: (context: VerifyModelContext) => void): VerifyModelContext {
        this.logging.withIndentation(() => subContext(this));
        return this;
    }

    private inSubContext<TSubModel>(subContext: SubContextHandler<TSubModel>, value: TSubModel) {
        this.logging.withIndentation(() => subContext(value, new VerifyModelContext<TSubModel>(this.logging)));
        return this;
    }
}

export class Verify {

    private readonly verifyModelContext: VerifyModelContext;
    private readonly logging: VerifyLogging = new VerifyLogging();

    constructor() {
        this.verifyModelContext = new VerifyModelContext(this.logging);
    }

    public static model<TModel>(testHandler: ContextHandler) {

        Assert.notNull(testHandler, "testHandler")

        let verify = new Verify();
        verify.execute<TModel>(testHandler);
        verify.verifyAll();
    }

    private execute<TFactory>(testHandler: ContextHandler) {
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
