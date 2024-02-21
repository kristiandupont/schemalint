import type { Schema } from "extract-pg-schema";
import { describe, expect, it, vi } from "vitest";

import type DeepPartial from "../tests/DeepPartial";
import { mandatoryColumns } from "./mandatoryColumns";

describe("mandatoryColumns", () => {
  describe("no tables", () => {
    it("should pass when no tables exist", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        tables: [],
        views: [],
      };

      mandatoryColumns.process({
        options: [{}],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });
  });

  describe("single mandatory column", () => {
    it("should pass when mandatory column exists", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                expandedType: "pg_catalog.int4",
                ordinalPosition: 1,
              },
            ],
          },
        ],
      };

      mandatoryColumns.process({
        options: [{ id: { expandedType: "pg_catalog.int4" } }],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("should report when mandatory column does not exist", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [],
          },
        ],
      };

      mandatoryColumns.process({
        options: [{ id: { expandedType: "pg_catalog.int4" } }],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "mandatory-columns",
          identifier: `schema.test`,
          message: `Mandatory column "id" is missing`,
        }),
      );
    });

    it("should report when mandatory column exists but type differs", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                expandedType: "pg_catalog.int2",
                ordinalPosition: 1,
              },
            ],
          },
        ],
      };

      mandatoryColumns.process({
        options: [{ id: { expandedType: "pg_catalog.int4" } }],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "mandatory-columns",
          identifier: `schema.test.id`,
          message: `Column "id" has properties {"expandedType":"pg_catalog.int2"} but expected {"expandedType":"pg_catalog.int4"}`,
        }),
      );
    });

    it("should report when mandatory column exists but ordinalPosition differs", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                expandedType: "pg_catalog.int2",
                ordinalPosition: 1,
              },
            ],
          },
        ],
      };

      mandatoryColumns.process({
        options: [{ id: { ordinalPosition: 2 } }],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "mandatory-columns",
          identifier: `schema.test.id`,
          message: `Column "id" has properties {"ordinalPosition":1} but expected {"ordinalPosition":2}`,
        }),
      );
    });
  });

  describe("multiple mandatory columns", () => {
    it("should pass when multiple mandatory columns exist", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                expandedType: "pg_catalog.int4",
                ordinalPosition: 1,
              },
              {
                name: "created_at",
                expandedType: "pg_catalog.timestamptz",
                ordinalPosition: 2,
              },
            ],
          },
        ],
      };

      mandatoryColumns.process({
        options: [
          {
            id: { expandedType: "pg_catalog.int4" },
            created_at: { expandedType: "pg_catalog.timestamptz" },
          },
        ],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("should report when one of the multiple mandatory columns does not exist", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [
              {
                name: "id",
                expandedType: "pg_catalog.int4",
                ordinalPosition: 1,
              },
            ],
          },
        ],
      };

      mandatoryColumns.process({
        options: [
          {
            id: { expandedType: "pg_catalog.int4" },
            created_at: { expandedType: "pg_catalog.timestamptz" },
          },
        ],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "mandatory-columns",
          identifier: `schema.test`,
          message: `Mandatory column "created_at" is missing`,
        }),
      );
    });

    it("should report when multiple mandatory columns do not exist", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            columns: [],
          },
        ],
      };

      mandatoryColumns.process({
        options: [
          {
            id: { expandedType: "pg_catalog.int4" },
            created_at: { expandedType: "pg_catalog.timestamptz" },
          },
        ],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "mandatory-columns",
          identifier: `schema.test`,
          message: `Mandatory column "id" is missing`,
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "mandatory-columns",
          identifier: `schema.test`,
          message: `Mandatory column "created_at" is missing`,
        }),
      );
    });
  });
});
