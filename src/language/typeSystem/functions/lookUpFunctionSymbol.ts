import {Type} from "../type";
import {SourceReference} from "../../sourceReference";
import {SymbolBuilder} from "../../symbols/symbolBuilder";
import {SymbolKind} from "../../symbols/symbolKind";
import {Symbol} from "../../symbols/symbol";

export class LookUpFunctionSymbol
{
    private static readonly description: string = `The \`LookUp\`function returns a specific value from the \`resultColumn\` column from a table.

The function will loop over all rows in a table from the start and will compare the value of a specific column \`searchValueColumn\` with the defined \`lookUpValue\`.
- If the value in the column equals the \`lookUpValue\`, the value in the \`resultColumn\` is returned.
- If the value in the column exceeds the \`lookUpValue\`, the value \`resultColumn\` of the previous row or the previous row is returned.

NOTE: table search value columns should be sorted from small to large in order these functions to work correctly. This also applies to string columns, they should be sorted alphabetically.`;

    public static create(reference: SourceReference, tableName: string, resultsType: Type | null): Symbol {

        return SymbolBuilder.build(build => build
            .reference(reference)
            .name(`table function: ${tableName}.LookUp`)
            .description(LookUpFunctionSymbol.description)
            .kind(SymbolKind.TableFunction)
            .signatures(signatures => signatures
                .signature(`Lookup value from result column. Search column is the first column. Result type '${resultsType}'.`, signature => signature
                    .parameter("lookUpValue", "The value to search for")
                    .parameter("Table.ResultColumn", "The column to return the value from")
                )
                .signature(`Lookup value from result column. Result type '${resultsType}'.`, signature => signature
                    .parameter("lookUpValue", "The value to search for")
                    .parameter("Table.SearchColumn", "The column to find the search value in")
                    .parameter("Table.ResultColumn", "The column to return the value from")
                )
                .signature(`Lookup value from result column by discriminator. The discriminator column is the first column, the search column is the first column. Result type '${resultsType}'.`, signature => signature
                    .parameter("discriminator", "The discriminator value")
                    .parameter("lookUpValue", "The value to search for")
                    .parameter("Table.ResultColumn", "The column to return the value from")
                )
                .signature(`Lookup value from result column by discriminator. Result type '${resultsType}'.`, signature => signature
                    .parameter("discriminator", "The discriminator value")
                    .parameter("lookUpValue", "The value to search for")
                    .parameter("Table.DiscriminatorColumn", "The discriminator column")
                    .parameter("Table.SearchColumn", "The column to find the search value in")
                    .parameter("Table.ResultColumn", "The column to return the value from")
                )
            ));
    }
}
