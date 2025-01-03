
export class TypeName {

  private valueValue: string = crypto.randomUUID().replace("-", "");

   public get value(): string {
     return this.valueValue;
   }

   public parseName(parameter: string): void {
     this.valueValue = parameter;
   }
}
