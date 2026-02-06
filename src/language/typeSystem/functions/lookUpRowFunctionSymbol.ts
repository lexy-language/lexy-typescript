import {Type} from "../type";
import {SourceReference} from "../../sourceReference";
import {SymbolBuilder} from "../../symbols/symbolBuilder";
import {SymbolKind} from "../../symbols/symbolKind";
import {Symbol} from "../../symbols/symbol";

export class LookUpRowFunctionSymbol
{
    private static readonly description: string = `The \`LookUpRow\`function returns a specific row from a table.

The function will loop over all rows in a table from the start and will compare the value of a specific column \`searchValueColumn\` with the defined \`lookUpValue\`.
- If the value in the column equals the \`lookUpValue\`, the row is returned.
- If the value in the column exceeds the \`lookUpValue\`, the value \`resultColumn\` of the previous row is returned.

NOTE: table search value columns should be sorted from small to large in order these functions to work correctly. This also applies to string columns, they should be sorted alphabetically.`;

    public static create(reference: SourceReference, tableName: string, resultsType: Type | null): Symbol {

        return SymbolBuilder.build(build => build
            .reference(reference)
            .name(`table function: ${tableName}.LookUpRow`)
            .description(LookUpRowFunctionSymbol.description)
            .kind(SymbolKind.TableFunction)
            .signatures(signatures => signatures
                .signature(`LookUpRow from table. Search column is the first column. Result type '${resultsType}'.`, signature => signature
                    .parameter("lookUpValue", "The value to search for")
                    .parameter("Table.ResultColumn", "The column to return the value from")
                )
                .signature(`LookUpRow from table. Result type '${resultsType}'.`, signature => signature
                    .parameter("lookUpValue", "The value to search for")
                    .parameter("Table.SearchColumn", "The column to find the search value in")
                    .parameter("Table.ResultColumn", "The column to return the value from")
                )
                .signature(`LookUpRow value from result column and a discriminator. The discriminator column is the first column, the search column is the first column. Result type '${resultsType}'.`, signature => signature
                    .parameter("discriminator", "The discriminator value")
                    .parameter("lookUpValue", "The value to search for")
                    .parameter("Table.ResultColumn", "The column to return the value from")
                )
                .signature(`LookUpRow value from result column and a discriminator. Result type '${resultsType}'.`, signature => signature
                    .parameter("discriminator", "The discriminator value")
                    .parameter("lookUpValue", "The value to search for")
                    .parameter("Table.DiscriminatorColumn", "The discriminator column")
                    .parameter("Table.SearchColumn", "The column to find the search value in")
                    .parameter("Table.ResultColumn", "The column to return the value from")
                )
            ));
    }
}
