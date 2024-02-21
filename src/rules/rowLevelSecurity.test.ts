import type { Schema } from "extract-pg-schema";
import { describe, expect, it, test, vi } from "vitest";

import type DeepPartial from "../tests/DeepPartial";
import { rowLevelSecurity } from "./rowLevelSecurity";

describe("rowLevelSecurity", () => {
  describe("no tables", () => {
    it("should pass when no tables exist", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        tables: [],
        views: [],
      };

      rowLevelSecurity.process({
        options: [{}],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });
  });

  describe("option is not provided", () => {
    test.each([
      {
        enforced: false,
      },
      {
        enforced: true,
      },
    ])(
      "should pass when row-level security is enabled: {enforced: $enforced}",
      ({ enforced }) => {
        const mockReporter = vi.fn();
        const schemaObject: DeepPartial<Schema> = {
          name: "schema",
          tables: [
            {
              name: "test",
              isRowLevelSecurityEnabled: true,
              isRowLevelSecurityEnforced: enforced,
            },
          ],
        };

        rowLevelSecurity.process({
          options: [],
          schemaObject: schemaObject as Schema,
          report: mockReporter,
        });

        expect(mockReporter).toBeCalledTimes(0);
      },
    );

    test.each([
      {
        enforced: false,
      },
      {
        enforced: true,
      },
    ])(
      "should report when row-level security is disabled: {enforced: $enforced}",
      ({ enforced }) => {
        const mockReporter = vi.fn();
        const schemaObject: DeepPartial<Schema> = {
          name: "schema",
          tables: [
            {
              name: "test",
              isRowLevelSecurityEnabled: false,
              isRowLevelSecurityEnforced: enforced,
            },
          ],
        };

        rowLevelSecurity.process({
          options: [],
          schemaObject: schemaObject as Schema,
          report: mockReporter,
        });

        expect(mockReporter).toBeCalledTimes(1);
        expect(mockReporter).toBeCalledWith(
          expect.objectContaining({
            rule: "row-level-security",
            identifier: `schema.test`,
            message: `Row-level security is disabled`,
            suggestedMigration: `ALTER TABLE "schema"."test" ENABLE ROW LEVEL SECURITY;`,
          }),
        );
      },
    );
  });

  describe("option is {enforced: true}", () => {
    it("should pass when row-level security is enabled and enforced", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            isRowLevelSecurityEnabled: true,
            isRowLevelSecurityEnforced: true,
          },
        ],
      };

      rowLevelSecurity.process({
        options: [{ enforced: true }],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(0);
    });

    it("should report when row-level security is disabled and not enforced", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            isRowLevelSecurityEnabled: false,
            isRowLevelSecurityEnforced: false,
          },
        ],
      };

      rowLevelSecurity.process({
        options: [{ enforced: true }],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "row-level-security",
          identifier: `schema.test`,
          message: `Row-level security is disabled`,
          suggestedMigration: `ALTER TABLE "schema"."test" ENABLE ROW LEVEL SECURITY;`,
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "row-level-security",
          identifier: `schema.test`,
          message: `Row-level security is not enforced`,
          suggestedMigration: `ALTER TABLE "schema"."test" FORCE ROW LEVEL SECURITY;`,
        }),
      );
    });

    it("should report when row-level security is enforced but disabled", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            isRowLevelSecurityEnabled: false,
            isRowLevelSecurityEnforced: true,
          },
        ],
      };

      rowLevelSecurity.process({
        options: [{ enforced: true }],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "row-level-security",
          identifier: `schema.test`,
          message: `Row-level security is disabled`,
          suggestedMigration: `ALTER TABLE "schema"."test" ENABLE ROW LEVEL SECURITY;`,
        }),
      );
    });

    it("should report when row-level security is enabled but not enforced", () => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "test",
            isRowLevelSecurityEnabled: true,
            isRowLevelSecurityEnforced: false,
          },
        ],
      };

      rowLevelSecurity.process({
        options: [{ enforced: true }],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      expect(mockReporter).toBeCalledTimes(1);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "row-level-security",
          identifier: `schema.test`,
          message: `Row-level security is not enforced`,
          suggestedMigration: `ALTER TABLE "schema"."test" FORCE ROW LEVEL SECURITY;`,
        }),
      );
    });
  });
});
