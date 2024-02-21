import type { Schema } from "extract-pg-schema";
import { describe, expect, it, test, vi } from "vitest";

import type DeepPartial from "../tests/DeepPartial";
import { nameInflection } from "./nameInflection";

describe("nameInflection", () => {
  it("no tables or views passed no errors", () => {
    const mockReporter = vi.fn();
    const schemaObject: DeepPartial<Schema> = {
      tables: [],
      views: [],
    };

    nameInflection.process({
      options: [],
      schemaObject: schemaObject as Schema,
      report: mockReporter,
    });

    expect(mockReporter).toBeCalledTimes(0);
  });

  const testCases = [
    {
      type: "default",
      param: null,
      actual1: "one_wives",
      actual2: "two_jims",
      expected1: "one_wife",
      expected2: "two_jim",
    },
    {
      type: "singular",
      param: "singular",
      actual1: "one_wives",
      actual2: "two_jims",
      expected1: "one_wife",
      expected2: "two_jim",
    },
    {
      type: "plural",
      param: "plural",
      actual1: "one_wife",
      actual2: "two_jim",
      expected1: "one_wives",
      expected2: "two_jims",
    },
  ];
  test.each(testCases)(
    "$type : param of $param applies to table names and requires $expected1 and $expected2",
    ({ param, actual1, actual2 }) => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          { name: `${actual1}`, columns: [] },
          { name: `${actual2}`, columns: [] },
        ],
        views: [],
      };

      nameInflection.process({
        options: [param],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      if (param == null) {
        param = "singular";
      }
      const opposite = param === "singular" ? "plural" : "singular";

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-inflection",
          identifier: `schema.${actual1}`,
          message: `Expected ${param} names, but '${actual1}' seems to be ${opposite}`,
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-inflection",
          identifier: `schema.${actual2}`,
          message: `Expected ${param} names, but '${actual2}' seems to be ${opposite}`,
        }),
      );
    },
  );
  test.each(testCases)(
    "$type : param of $param applies to view names and requires $expected1 and $expected2",
    ({ param, actual1, actual2 }) => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        views: [
          { name: `${actual1}`, columns: [] },
          { name: `${actual2}`, columns: [] },
        ],
        tables: [],
      };

      nameInflection.process({
        options: [param],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      if (param == null) {
        param = "singular";
      }
      const opposite = param === "singular" ? "plural" : "singular";

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-inflection",
          identifier: `schema.${actual1}`,
          message: `Expected ${param} names, but '${actual1}' seems to be ${opposite}`,
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-inflection",
          identifier: `schema.${actual2}`,
          message: `Expected ${param} names, but '${actual2}' seems to be ${opposite}`,
        }),
      );
    },
  );
});
