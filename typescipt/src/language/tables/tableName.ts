
export class TableName {

  private valueValue: string;

   public get value(): string {
    return this.valueValue;
   }

   public parseName(parameter: string): void {
     this.valueValue = parameter;
   }
}
