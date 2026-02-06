import {VerifyModelContext} from "./verifyModelContext";
import {VerifyLogging} from "./verifyLogging";
import {any} from "../src/infrastructure/arrayFunctions";

//where TItem : class
export class VerifyCollectionContext<TItem>  extends VerifyModelContext<readonly TItem[]> {

    constructor(model: readonly TItem[], logging: VerifyLogging) {
        super(model, logging)
    }

    public length(length: number, extraMessage: string): VerifyCollectionContext<TItem> {
        this.logging.logAssert(this.model.length == length, "Length", `- Length Failed '${this.model.length}' != '${length}' ({extraMessage}): `);
        return this;
    }

    public valueAt(index: number , verify: (item: TItem) => boolean): VerifyCollectionContext<TItem> {
        let value = index >= 0 && index < this.model.length ? this.model[index] : null;
        if (value != null)
        {
            let valid = verify(value);
            this.logging.logAssert(valid, value.toString(), `- ValueAt[{index}] not as expected: `);
            return this;
        }

        this.logging.logAssert(false, "null", `- valueAtEquals[${index}] invalid: `);

        return this;
    }

    public contains(expected: TItem): VerifyCollectionContext<TItem> {

        let value = this.model.indexOf(expected) >= 0;
        this.logging.logAssert(value, "collection", `- Contains[${expected}] invalid: `, );

        return this;
    }

    public any(criteria: (value: TItem) => boolean, extraMessage: string): VerifyCollectionContext<TItem> {

        let value = any(this.model, criteria);
        this.logging.logAssert(value, criteria.toString(),`- Any invalid - (${extraMessage}): `);

        return this;
    }

    public none(criteria: (value: TItem) => boolean, extraMessage: string): VerifyCollectionContext<TItem> {

        let value = !any(this.model, criteria);
        this.logging.logAssert(value, criteria.toString(), `- None invalid$ - (${extraMessage}): `);

        return this;
    }
}
