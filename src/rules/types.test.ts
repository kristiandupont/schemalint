import type { Schema } from "extract-pg-schema";
import { describe, expect, it, vi } from "vitest";

import type { Reporter } from "../Rule";
import type DeepPartial from "../tests/DeepPartial";
import * as types from "./types";

const assertReport = (
  mockReporter: Reporter,
  expectedRule: string,
  expectedIdentifier: string,
  expectedMessage: string,
  expectedSuggestedMigration: string,
) => {
  expect(mockReporter).toBeCalledWith(
    expect.objectContaining({
      rule: expectedRule,
      identifier: expectedIdentifier,
      message: expectedMessage,
      suggestedMigration: expectedSuggestedMigration,
    }),
  );
};

const assertJSONBReport = (
  mockReporter: Reporter,
  expectedIdentifier: string,
  expectedSuggestedMigration: string,
) => {
  assertReport(
    mockReporter,
    "prefer-jsonb-to-json",
    expectedIdentifier,
    "Prefer JSONB to JSON types",
    expectedSuggestedMigration,
  );
};

const assertTextReport = (
  mockReporter: Reporter,
  expectedIdentifier: string,
  expectedColumnType: string,
  expectedSuggestedMigration: string,
) => {
  assertReport(
    mockReporter,
    "prefer-text-to-varchar",
    expectedIdentifier,
    `Prefer text to ${expectedColumnType} types`,
    expectedSuggestedMigration,
  );
};

const assertIdentityReport = (
  mockReporter: Reporter,
  expectedIdentifier: string,
  expectedSuggestedMigration: string,
) => {
  assertReport(
    mockReporter,
    "prefer-identity-to-serial",
    expectedIdentifier,
    "Prefer IDENTITY to type SERIAL",
    expectedSuggestedMigration,
  );
};

describe("types", () => {
  describe("prefer-jsonb-to-json", () => {
    it("no tables has no errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = { tables: [] };

      types.preferJsonbToJson.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("one table, json columns has errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.json" },
                name: "bad_column",
              },
              {
                type: { kind: "base", fullName: "pg_catalog.text" },
                name: "not_relavant",
              },
              {
                type: { kind: "base", fullName: "pg_catalog.json" },
                name: "bad_column2",
              },
            ],
          },
        ],
      };

      types.preferJsonbToJson.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      assertJSONBReport(
        mockReporter,
        "schema.one_table.bad_column",
        'ALTER TABLE "schema"."one_table" ALTER COLUMN "bad_column" TYPE JSONB;',
      );
      assertJSONBReport(
        mockReporter,
        "schema.one_table.bad_column2",
        'ALTER TABLE "schema"."one_table" ALTER COLUMN "bad_column2" TYPE JSONB;',
      );
    });

    it("one table, no json column has no errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.varchar" },
                name: "not_relevant_column",
              },
            ],
          },
        ],
      };

      types.preferJsonbToJson.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });
    it("multiple tables with multiple json columns has multiple errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.json" },
                name: "bad_column",
              },
            ],
          },
          {
            name: "two_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.varchar" },
                name: "not_relevant_column",
              },
            ],
          },
          {
            name: "three_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.json" },
                name: "bad_column3",
              },
            ],
          },
        ],
      };

      types.preferJsonbToJson.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      assertJSONBReport(
        mockReporter,
        "schema.one_table.bad_column",
        'ALTER TABLE "schema"."one_table" ALTER COLUMN "bad_column" TYPE JSONB;',
      );
      assertJSONBReport(
        mockReporter,
        "schema.three_table.bad_column3",
        'ALTER TABLE "schema"."three_table" ALTER COLUMN "bad_column3" TYPE JSONB;',
      );
    });
  });

  describe("prefer-text-to-varchar", () => {
    it("no tables has no errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = { tables: [] };

      types.preferTextToVarchar.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("one table, varchar columns has errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.varchar" },
                name: "bad_column",
              },
              {
                type: { kind: "base", fullName: "pg_catalog.varchar" },
                name: "bad_column2",
              },
            ],
          },
        ],
      };

      types.preferTextToVarchar.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      assertTextReport(
        mockReporter,
        "schema.one_table.bad_column",
        "varchar",
        'ALTER TABLE "schema"."one_table" ALTER COLUMN "bad_column" TYPE TEXT;',
      );
      assertTextReport(
        mockReporter,
        "schema.one_table.bad_column2",
        "varchar",
        'ALTER TABLE "schema"."one_table" ALTER COLUMN "bad_column2" TYPE TEXT;',
      );
    });

    it("one table, no varchar column has no errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.text" },
                name: "not_relevant_column",
              },
            ],
          },
        ],
      };

      types.preferTextToVarchar.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("multiple tables with multiple varchar columns has multiple errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.varchar" },
                name: "bad_column",
              },
            ],
          },
          {
            name: "two_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.text" },
                name: "not_relevant_column",
              },
            ],
          },
          {
            name: "three_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.varchar" },
                name: "bad_column3",
              },
            ],
          },
        ],
      };

      types.preferTextToVarchar.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      assertTextReport(
        mockReporter,
        "schema.one_table.bad_column",
        "varchar",
        'ALTER TABLE "schema"."one_table" ALTER COLUMN "bad_column" TYPE TEXT;',
      );
      assertTextReport(
        mockReporter,
        "schema.three_table.bad_column3",
        "varchar",
        'ALTER TABLE "schema"."three_table" ALTER COLUMN "bad_column3" TYPE TEXT;',
      );
    });
  });

  describe("prefer-timestamptz-to-timestamp", () => {
    it("no tables has no errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = { tables: [] };

      types.preferTimestamptz.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("one table, timetamp columns has errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.timestamp" },
                name: "bad_column",
              },
              {
                type: { kind: "base", fullName: "pg_catalog.timestamp" },
                name: "bad_column2",
              },
            ],
          },
        ],
      };

      types.preferTimestamptz.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "prefer-timestamptz-to-timestamp",
          identifier: "schema.one_table.bad_column",
          message: "Prefer TIMESTAMPTZ to type TIMESTAMP",
          suggestedMigration:
            'ALTER TABLE "schema"."one_table" ALTER COLUMN "bad_column" TYPE TIMESTAMPTZ;',
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "prefer-timestamptz-to-timestamp",
          identifier: "schema.one_table.bad_column2",
          message: "Prefer TIMESTAMPTZ to type TIMESTAMP",
          suggestedMigration:
            'ALTER TABLE "schema"."one_table" ALTER COLUMN "bad_column2" TYPE TIMESTAMPTZ;',
        }),
      );
    });

    it("one table, no varchar column has no errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.text" },
                name: "not_relevant_column",
              },
            ],
          },
        ],
      };

      types.preferTimestamptz.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("multiple tables with multiple varchar columns has multiple errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.timestamp" },
                name: "bad_column",
              },
            ],
          },
          {
            name: "two_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.text" },
                name: "not_relevant_column",
              },
            ],
          },
          {
            name: "three_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.timestamp" },
                name: "bad_column3",
              },
            ],
          },
        ],
      };

      types.preferTimestamptz.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "prefer-timestamptz-to-timestamp",
          identifier: "schema.one_table.bad_column",
          message: "Prefer TIMESTAMPTZ to type TIMESTAMP",
          suggestedMigration:
            'ALTER TABLE "schema"."one_table" ALTER COLUMN "bad_column" TYPE TIMESTAMPTZ;',
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "prefer-timestamptz-to-timestamp",
          identifier: "schema.three_table.bad_column3",
          message: "Prefer TIMESTAMPTZ to type TIMESTAMP",
          suggestedMigration:
            'ALTER TABLE "schema"."three_table" ALTER COLUMN "bad_column3" TYPE TIMESTAMPTZ;',
        }),
      );
    });
  });

  describe("prefer-identity-to-serial", () => {
    it("no tables has no errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = { tables: [] };

      types.preferIdentity.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("one table, serial columns has errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "public",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                name: "bad_column",
                isIdentity: false,
                defaultValue: "nextval('table_name_column_1_seq'::regclass)",
              },
              {
                name: "bad_column2",
                isIdentity: false,
                defaultValue: "nextval('table_name_column_2_seq'::regclass)",
              },
            ],
          },
        ],
      };

      types.preferIdentity.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      assertIdentityReport(
        mockReporter,
        "public.one_table.bad_column",
        `ALTER TABLE "public"."one_table" ALTER "bad_column" DROP DEFAULT;
DROP SEQUENCE "public"."table_name_column_1_seq";
ALTER TABLE "public"."one_table" ALTER "bad_column" ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT setval('"table_name_column_1_seq"', max("bad_column")) FROM "public"."one_table";`,
      );
      assertIdentityReport(
        mockReporter,
        "public.one_table.bad_column2",
        `ALTER TABLE "public"."one_table" ALTER "bad_column2" DROP DEFAULT;
DROP SEQUENCE "public"."table_name_column_2_seq";
ALTER TABLE "public"."one_table" ALTER "bad_column2" ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT setval('"table_name_column_2_seq"', max("bad_column2")) FROM "public"."one_table";`,
      );
    });

    it("one table, no varchar column has no errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "public",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.int4" },
                isIdentity: true,
                name: "not_relevant_column",
              },
            ],
          },
        ],
      };

      types.preferIdentity.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("multiple tables with multiple varchar columns has multiple errors", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "public",
        tables: [
          {
            name: "one_table",
            columns: [
              {
                name: "bad_column",
                isIdentity: false,
                defaultValue: "nextval('table_name_column_1_seq'::regclass)",
              },
            ],
          },
          {
            name: "two_table",
            columns: [
              {
                type: { kind: "base", fullName: "pg_catalog.text" },
                name: "not_relevant_column",
                isIdentity: false,
                defaultValue: null,
              },
            ],
          },
          {
            name: "three_table",
            columns: [
              {
                name: "bad_column3",
                isIdentity: false,
                defaultValue: "nextval('table_name_column_3_seq'::regclass)",
              },
            ],
          },
        ],
      };

      types.preferIdentity.process({
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      assertIdentityReport(
        mockReporter,
        "public.one_table.bad_column",
        `ALTER TABLE "public"."one_table" ALTER "bad_column" DROP DEFAULT;
DROP SEQUENCE "public"."table_name_column_1_seq";
ALTER TABLE "public"."one_table" ALTER "bad_column" ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT setval('"table_name_column_1_seq"', max("bad_column")) FROM "public"."one_table";`,
      );
      assertIdentityReport(
        mockReporter,
        "public.three_table.bad_column3",
        `ALTER TABLE "public"."three_table" ALTER "bad_column3" DROP DEFAULT;
DROP SEQUENCE "public"."table_name_column_3_seq";
ALTER TABLE "public"."three_table" ALTER "bad_column3" ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT setval('"table_name_column_3_seq"', max("bad_column3")) FROM "public"."three_table";`,
      );
    });
  });
});
