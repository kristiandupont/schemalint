import { Schema } from "extract-pg-schema";
import { describe, expect, it, vi } from "vitest";

import DeepPartial from "../tests/DeepPartial";
import { indexReferencingColumn } from "./references";

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
          suggestedMigration: `CREATE INDEX ON "test"("id");`,
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
          suggestedMigration: `CREATE INDEX ON "test"("id");`,
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
          suggestedMigration: `CREATE INDEX ON "test"("id", "sub_id");`,
        }),
      );
    });
  });
});
