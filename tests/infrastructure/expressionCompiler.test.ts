import {compileExpression} from "../compileExpression";

class Sub2Model
{
  public sub2Property: number;
}

class SubModel
{
  public subProperty: number;
  public inner2: Sub2Model;
}

class Model
{
  public property: number;
  public inner: SubModel;
}

describe('executionLogging', () => {

  it('CompilePropertyOfModel', async () => {

    let model = new Model();
    model.property = 9;

    let [value, message] = compileExpression(model => model.property, model);

    expect(message).toBe("model.property");
    expect(value).toBe(9);
  });

  it('CompilePropertyOfInnerModel', async () => {

    let model = new Model();
    model.inner = new SubModel();
    model.inner.subProperty = 77;

    let [value, message] = compileExpression(model => model.inner.subProperty, model);

    expect(message).toBe("model.inner.subProperty");
    expect(value).toBe(77);
  });

  it('CompilePropertyOfInnerInnerModel', async () => {

    let model = new Model();
    model.inner = new SubModel();
    model.inner.inner2 = new Sub2Model();
    model.inner.inner2.sub2Property = 9

    let [value, message] = compileExpression(model => model.inner.inner2.sub2Property, model);

    expect(message).toBe("model.inner.inner2.sub2Property");
    expect(value).toBe(9);
  });
});
