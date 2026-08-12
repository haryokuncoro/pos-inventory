import Papa from "papaparse"
import {
  productImportRowSchema,
  type ProductImportRow,
} from "./import-product-schema"

export type ParsedProductImportRow = {
  rowNumber: number
  data?: ProductImportRow
  errors: string[]
}

export function parseProductCsv(
  file: File,
): Promise<ParsedProductImportRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,

      complete(results) {
        const rows: ParsedProductImportRow[] =
          results.data.map((row, index) => {
            const parsed =
              productImportRowSchema.safeParse(row)

            if (!parsed.success) {
              return {
                rowNumber: index + 2,
                errors: parsed.error.issues.map(
                  (issue) =>
                    `${issue.path.join(".")}: ${issue.message}`,
                ),
              }
            }

            return {
              rowNumber: index + 2,
              data: parsed.data,
              errors: [],
            }
          })

        resolve(rows)
      },

      error(error) {
        reject(error)
      },
    })
  })
}