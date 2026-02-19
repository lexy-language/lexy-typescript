import {ModelPropertyHandler, VerifyModelContext} from "./verifyModelContext";
import {VerifyLogging} from "./verifyLogging";
import {any} from "../src/infrastructure/arrayFunctions";
import {compileExpression} from "./compileExpression";
import {Assert} from "../src";

export class VerifyCollectionContext<TItem> {

  protected readonly model: readonly TItem[];
  protected readonly logging: VerifyLogging;

  constructor(collection: readonly TItem[], logging: VerifyLogging) {
    this.model = Assert.notNull(collection, "collection");
    this.logging = Assert.notNull(logging, "logging");
  }

  public length(length: number, extraMessage: string): VerifyCollectionContext<TItem> {
    this.logging.logAssert(this.model.length == length, extraMessage, `- Length Failed '${this.model.length}' != '${length}': `);
    return this;
  }

  public valueAt(index: number , verify: (item: TItem) => boolean): VerifyCollectionContext<TItem> {
    const value = index >= 0 && index < this.model.length ? this.model[index] : null;
    if (value != null)
    {
        let valid = verify(value);
        this.logging.logAssert(valid, value.toString(), `- ValueAt[{index}] not as expected: `);
        return this;
    }

    this.logging.logAssert(false, "null", `- valueAtEquals[${index}] invalid: `);

    return this;
  }

  public valueModelProperty<TValue>(index: number, expression: ModelPropertyHandler<TItem, TValue>, verify: (item: VerifyModelContext<TValue>) => void): VerifyCollectionContext<TItem> {

    const item = index >= 0 && index < this.model.length ? this.model[index] : null;
    const [value, message] = compileExpression(expression, item);
    if (value != null)
    {
        const model = new VerifyModelContext<TValue>(value, this.logging)
        verify(model);
        return this;
    }

    this.logging.logAssert(false, message, `- valueModel[${index}] is null: `);

    return this;
  }

  public valueModel<TValue>(index: number, verify: (item: VerifyModelContext<TValue>) => void): VerifyCollectionContext<TItem> {

    const item = index >= 0 && index < this.model.length ? this.model[index] : null;
    if (item != null)
    {
        const model = new VerifyModelContext<TValue>(item, this.logging)
        verify(model);
        return this;
    }

    this.logging.logAssert(false, "item == null", `- valueModel[${index}] is null: `);

    return this;
  }

  public valueModelOfType<TValue>(index: number, typeName: string, cast: (item: TItem) => TValue | null, verify: (item: VerifyModelContext<TValue>) => void): VerifyCollectionContext<TItem> {

    const item = index >= 0 && index < this.model.length ? this.model[index] : null;
    if (item == null) {
        this.logging.logAssert(false, "item == null", `- valueModel[${index}] is null: `);
        return this;
    }

    const specific = cast(item);
    if (specific == null) {
        this.logging.logAssert(false, "invalid type", `- ValueModel[${index}] is not ${typeName}: `);
        return this;
    }

    const model = new VerifyModelContext<TValue>(item, this.logging)
    verify(model);
    return this;
  }

  public contains(expected: TItem): VerifyCollectionContext<TItem> {

    let value = this.model.indexOf(expected) >= 0;
    this.logging.logAssert(value, "collection", `- Contains[${expected}] invalid: `, );

    return this;
  }

  public any(criteria: (value: TItem) => boolean, extraMessage: string): VerifyCollectionContext<TItem> {

    let value = any(this.model, criteria);

    this.logging.logAssert(value, criteria.toString(),`- Any invalid - >>${extraMessage}<<: `);

    return this;
  }

  public none(criteria: (value: TItem) => boolean, extraMessage: string): VerifyCollectionContext<TItem> {

    let value = !any(this.model, criteria);
    this.logging.logAssert(value, criteria.toString(), `- None invalid$ - (${extraMessage}): `);

    return this;
  }
}
