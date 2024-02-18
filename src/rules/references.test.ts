import { Schema } from "extract-pg-schema";
import { describe, expect, it, test, vi } from "vitest";

import DeepPartial from "../tests/DeepPartial";
import { indexReferencingColumn, referenceActions } from "./references";

describe("indexReferencingColumn", () => {
  describe("no tables", () => {
    it("should pass when no tables exist", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        tables: [],
        views: [],
      };

      indexReferencingColumn.process({
        options: [],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });
  });

  describe("single column reference", () => {
    it("should pass when index found on referencing column", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                references: [{ name: "test_id_fkey" }],
              },
            ],
            indices: [{ name: "test_id_idx", columns: [{ name: "id" }] }],
          },
        ],
      };

      indexReferencingColumn.process({
        options: [],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("should report when no index found on referencing column", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                references: [{ name: "test_id_fkey" }],
              },
            ],
            indices: [],
          },
        ],
      };

      indexReferencingColumn.process({
        options: [],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "index-referencing-column",
          identifier: `schema.test.test_id_fkey`,
          message: `No index found on referencing column(s) id`,
          suggestedMigration: `CREATE INDEX ON "schema"."test" ("id");`,
        }),
      );
    });

    it("should report when referencing column is indexed as secondary column", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                references: [{ name: "test_id_fkey" }],
              },
              {
                name: "sub_id",
                references: [],
              },
            ],
            indices: [
              {
                name: "test_id_idx",
                columns: [{ name: "sub_id" }, { name: "id" }],
              },
            ],
          },
        ],
      };

      indexReferencingColumn.process({
        options: [],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "index-referencing-column",
          identifier: `schema.test.test_id_fkey`,
          message: `No index found on referencing column(s) id`,
          suggestedMigration: `CREATE INDEX ON "schema"."test" ("id");`,
        }),
      );
    });
  });

  describe("multiple column reference", () => {
    it("should pass when index found on at least one referencing column", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                references: [{ name: "test_id_sub_id_fkey" }],
              },
              {
                name: "sub_id",
                references: [{ name: "test_id_sub_id_fkey" }],
              },
            ],
            indices: [
              { name: "test_sub_id_idx", columns: [{ name: "sub_id" }] },
            ],
          },
        ],
      };

      indexReferencingColumn.process({
        options: [],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("should report when no index found on referencing columns", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                references: [{ name: "test_id_sub_id_fkey" }],
              },
              {
                name: "sub_id",
                references: [{ name: "test_id_sub_id_fkey" }],
              },
            ],
            indices: [],
          },
        ],
      };

      indexReferencingColumn.process({
        options: [],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "index-referencing-column",
          identifier: `schema.test.test_id_sub_id_fkey`,
          message: `No index found on referencing column(s) id, sub_id`,
          suggestedMigration: `CREATE INDEX ON "schema"."test" ("id", "sub_id");`,
        }),
      );
    });
  });
});

describe("referenceActions", () => {
  describe("no tables", () => {
    it("should pass when no tables exist", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        tables: [],
        views: [],
      };

      referenceActions.process({
        options: [{}],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });
  });

  describe("single column reference", () => {
    test.each([
      { option: {} }, // [onUpdate, onDelete] = [skipped, skipped]
      { option: { onUpdate: "NO ACTION" } }, // [correct, skipped]
      { option: { onDelete: "CASCADE" } }, // [skipped, correct]
      { option: { onUpdate: "NO ACTION", onDelete: "CASCADE" } }, // [correct, correct]
    ])(
      "should pass when specified value is undefined or same as actual: $option",
      ({ option }) => {
        const mockReporter = vi.fn();
        const schemaObject: DeepPartial<Schema> = {
          name: "schema",
          tables: [
            {
              name: "test",
              columns: [
                {
                  name: "id",
                  references: [
                    {
                      name: "test_id_fkey",
                      onUpdate: "NO ACTION",
                      onDelete: "CASCADE",
                    },
                  ],
                },
              ],
            },
          ],
        };

        referenceActions.process({
          options: [option],
          schemaObject: schemaObject as Schema,
          report: mockReporter,
        });

        expect(mockReporter).toBeCalledTimes(0);
      },
    );

    test.each([
      {
        option: { onUpdate: "CASCADE" }, // [onUpdate, onDelete] = [wrong, skipped]
        expectedIssues: [
          {
            message: `Reference action ON UPDATE expected to be "CASCADE" but got "NO ACTION"`,
            suggestedMigration: `ALTER TABLE "schema"."test" DROP CONSTRAINT "test_id_fkey", ADD CONSTRAINT "test_id_fkey" FOREIGN KEY ("id") REFERENCES "other_table"("test_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
          },
        ],
      },
      {
        option: { onUpdate: "CASCADE", onDelete: "CASCADE" }, // [wrong, correct]
        expectedIssues: [
          {
            message: `Reference action ON UPDATE expected to be "CASCADE" but got "NO ACTION"`,
            suggestedMigration: `ALTER TABLE "schema"."test" DROP CONSTRAINT "test_id_fkey", ADD CONSTRAINT "test_id_fkey" FOREIGN KEY ("id") REFERENCES "other_table"("test_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
          },
        ],
      },
      {
        option: { onDelete: "NO ACTION" }, // [skipped, wrong]
        expectedIssues: [
          {
            message: `Reference action ON DELETE expected to be "NO ACTION" but got "CASCADE"`,
            suggestedMigration: `ALTER TABLE "schema"."test" DROP CONSTRAINT "test_id_fkey", ADD CONSTRAINT "test_id_fkey" FOREIGN KEY ("id") REFERENCES "other_table"("test_id") ON UPDATE NO ACTION ON DELETE NO ACTION;`,
          },
        ],
      },
      {
        option: { onUpdate: "NO ACTION", onDelete: "NO ACTION" }, // [correct, wrong]
        expectedIssues: [
          {
            message: `Reference action ON DELETE expected to be "NO ACTION" but got "CASCADE"`,
            suggestedMigration: `ALTER TABLE "schema"."test" DROP CONSTRAINT "test_id_fkey", ADD CONSTRAINT "test_id_fkey" FOREIGN KEY ("id") REFERENCES "other_table"("test_id") ON UPDATE NO ACTION ON DELETE NO ACTION;`,
          },
        ],
      },
      {
        option: { onUpdate: "CASCADE", onDelete: "NO ACTION" }, // [wrong, wrong]
        expectedIssues: [
          {
            message: `Reference action ON UPDATE expected to be "CASCADE" but got "NO ACTION"`,
            suggestedMigration: `ALTER TABLE "schema"."test" DROP CONSTRAINT "test_id_fkey", ADD CONSTRAINT "test_id_fkey" FOREIGN KEY ("id") REFERENCES "other_table"("test_id") ON UPDATE CASCADE ON DELETE NO ACTION;`,
          },
          {
            message: `Reference action ON DELETE expected to be "NO ACTION" but got "CASCADE"`,
            suggestedMigration: `ALTER TABLE "schema"."test" DROP CONSTRAINT "test_id_fkey", ADD CONSTRAINT "test_id_fkey" FOREIGN KEY ("id") REFERENCES "other_table"("test_id") ON UPDATE CASCADE ON DELETE NO ACTION;`,
          },
        ],
      },
    ])(
      "should report when specified value is not undefined and differs: $option",
      ({ option, expectedIssues }) => {
        const mockReporter = vi.fn();
        const schemaObject: DeepPartial<Schema> = {
          name: "schema",
          tables: [
            {
              name: "test",
              columns: [
                {
                  name: "id",
                  references: [
                    {
                      name: "test_id_fkey",
                      tableName: "other_table",
                      columnName: "test_id",
                      onUpdate: "NO ACTION",
                      onDelete: "CASCADE",
                    },
                  ],
                },
              ],
            },
          ],
        };

        referenceActions.process({
          options: [option],
          schemaObject: schemaObject as Schema,
          report: mockReporter,
        });

        expect(mockReporter).toBeCalledTimes(expectedIssues.length);
        expectedIssues.forEach((expectedIssue) => {
          expect(mockReporter).toBeCalledWith(
            expect.objectContaining({
              rule: "reference-actions",
              identifier: `schema.test.test_id_fkey`,
              message: expectedIssue.message,
              suggestedMigration: expectedIssue.suggestedMigration,
            }),
          );
        });
      },
    );
  });

  describe("multiple column reference", () => {
    it("should report only once when multiple column reference has incorrect action", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                references: [
                  {
                    name: "test_id_sub_id_fkey",
                    tableName: "other_table",
                    columnName: "test_id",
                    onUpdate: "NO ACTION",
                    onDelete: "CASCADE",
                  },
                ],
              },
              {
                name: "sub_id",
                references: [
                  {
                    name: "test_id_sub_id_fkey",
                    tableName: "other_table",
                    columnName: "test_sub_id",
                    onUpdate: "NO ACTION",
                    onDelete: "CASCADE",
                  },
                ],
              },
            ],
          },
        ],
      };

      referenceActions.process({
        options: [{ onUpdate: "CASCADE" }],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "reference-actions",
          identifier: `schema.test.test_id_sub_id_fkey`,
          message: `Reference action ON UPDATE expected to be "CASCADE" but got "NO ACTION"`,
          suggestedMigration: `ALTER TABLE "schema"."test" DROP CONSTRAINT "test_id_sub_id_fkey", ADD CONSTRAINT "test_id_sub_id_fkey" FOREIGN KEY ("id", "sub_id") REFERENCES "other_table"("test_id", "test_sub_id") ON UPDATE CASCADE ON DELETE CASCADE;`,
        }),
      );
    });
  });
});
