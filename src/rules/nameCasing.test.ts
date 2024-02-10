import { Schema } from "extract-pg-schema";
import { describe, expect, it, test, vi } from "vitest";

import DeepPartial from "../tests/DeepPartial";
import { nameCasing } from "./nameCasing";

describe("nameCasing", () => {
  it("no tables or views passed no errors", () => {
    const mockReporter = vi.fn();
    const schemaObject: DeepPartial<Schema> = {
      tables: [],
      views: [],
    };

    nameCasing.process({
      options: [],
      schemaObject: schemaObject as Schema,
      report: mockReporter,
    });

    expect(mockReporter).toBeCalledTimes(0);
  });
  test.each`
    type             | param       | expected1                        | expected2
    ${`default`}     | ${null}     | ${`th_is_is_no_sn_a_k_e_ca_s_e`} | ${`neit_he_r_is_this`}
    ${`snake-case`}  | ${`snake`}  | ${`th_is_is_no_sn_a_k_e_ca_s_e`} | ${`neit_he_r_is_this`}
    ${`dash case`}   | ${`dash`}   | ${`th-is-is-no-sn-a-k-e-ca-s-e`} | ${`neit-he-r-is-this`}
    ${`camel case`}  | ${`camel`}  | ${`thIsIsNoSnAKECaSE`}           | ${`neitHeRIsThis`}
    ${`pascal case`} | ${`pascal`} | ${`ThIsIsNoSnAKECaSE`}           | ${`NeitHeRIsThis`}
  `(
    "$type : param of $param applies to table names and requires $expected",
    ({ _type, param, expected1, expected2 }) => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          { name: "Th-IsIsNoSnA_kECaSE", columns: [] },
          { name: "neit_he-rIsThis", columns: [] },
        ],
        views: [],
      };

      nameCasing.process({
        options: [param],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      if (param == null) {
        param = "snake";
      }

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-casing",
          identifier: "schema.Th-IsIsNoSnA_kECaSE",
          message: `The table Th-IsIsNoSnA_kECaSE seems to be mixed-cased rather than ${param}-cased.`,
          suggestedMigration: `ALTER TABLE "Th-IsIsNoSnA_kECaSE" RENAME TO "${expected1}";`,
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-casing",
          identifier: "schema.neit_he-rIsThis",
          message: `The table neit_he-rIsThis seems to be mixed-cased rather than ${param}-cased.`,
          suggestedMigration: `ALTER TABLE "neit_he-rIsThis" RENAME TO "${expected2}";`,
        }),
      );
    },
  );

  test.each`
    type             | param       | expected1                        | expected2
    ${`default`}     | ${null}     | ${`th_is_is_no_sn_a_k_e_ca_s_e`} | ${`neit_he_r_is_this`}
    ${`snake-case`}  | ${`snake`}  | ${`th_is_is_no_sn_a_k_e_ca_s_e`} | ${`neit_he_r_is_this`}
    ${`dash case`}   | ${`dash`}   | ${`th-is-is-no-sn-a-k-e-ca-s-e`} | ${`neit-he-r-is-this`}
    ${`camel case`}  | ${`camel`}  | ${`thIsIsNoSnAKECaSE`}           | ${`neitHeRIsThis`}
    ${`pascal case`} | ${`pascal`} | ${`ThIsIsNoSnAKECaSE`}           | ${`NeitHeRIsThis`}
  `(
    "$type : param of $param applies to view names and requires $expected",
    ({ _type, param, expected1, expected2 }) => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [],
        views: [
          { name: "Th-IsIsNoSnA_kECaSE", columns: [] },
          { name: "neit_he-rIsThis", columns: [] },
        ],
      };

      nameCasing.process({
        options: [param],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      if (param == null) {
        param = "snake";
      }

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-casing",
          identifier: "schema.Th-IsIsNoSnA_kECaSE",
          message: `The view Th-IsIsNoSnA_kECaSE seems to be mixed-cased rather than ${param}-cased.`,
          suggestedMigration: `ALTER VIEW "Th-IsIsNoSnA_kECaSE" RENAME TO "${expected1}";`,
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-casing",
          identifier: "schema.neit_he-rIsThis",
          message: `The view neit_he-rIsThis seems to be mixed-cased rather than ${param}-cased.`,
          suggestedMigration: `ALTER VIEW "neit_he-rIsThis" RENAME TO "${expected2}";`,
        }),
      );
    },
  );

  test.each`
    type             | param       | expected1                        | expected2
    ${`default`}     | ${null}     | ${`th_is_is_no_sn_a_k_e_ca_s_e`} | ${`neit_he_r_is_this`}
    ${`snake-case`}  | ${`snake`}  | ${`th_is_is_no_sn_a_k_e_ca_s_e`} | ${`neit_he_r_is_this`}
    ${`dash case`}   | ${`dash`}   | ${`th-is-is-no-sn-a-k-e-ca-s-e`} | ${`neit-he-r-is-this`}
    ${`camel case`}  | ${`camel`}  | ${`thIsIsNoSnAKECaSE`}           | ${`neitHeRIsThis`}
    ${`pascal case`} | ${`pascal`} | ${`ThIsIsNoSnAKECaSE`}           | ${`NeitHeRIsThis`}
  `(
    "$type : param of $param applies to view names and requires $expected",
    ({ _type, param, expected1, expected2 }) => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [
          {
            name: "one_table",
            columns: [{ name: "Th-IsIsNoSnA_kECaSE" }, { name: "snake_case" }],
          },
          {
            name: "two_table",
            columns: [{ name: "neit_he-rIsThis" }, { name: "snake_case" }],
          },
        ],
        views: [],
      };

      nameCasing.process({
        options: [param],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      if (param == null) {
        param = "snake";
      }

      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-casing",
          identifier: "schema.one_table.Th-IsIsNoSnA_kECaSE",
          message: `The column Th-IsIsNoSnA_kECaSE on the table one_table seems to be mixed-cased rather than ${param}-cased.`,
          suggestedMigration: `ALTER TABLE "one_table" RENAME COLUMN "Th-IsIsNoSnA_kECaSE" TO "${expected1}";`,
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-casing",
          identifier: "schema.two_table.neit_he-rIsThis",
          message: `The column neit_he-rIsThis on the table two_table seems to be mixed-cased rather than ${param}-cased.`,
          suggestedMigration: `ALTER TABLE "two_table" RENAME COLUMN "neit_he-rIsThis" TO "${expected2}";`,
        }),
      );
    },
  );

  test.each`
    type             | param       | expected1                        | expected2
    ${`default`}     | ${null}     | ${`th_is_is_no_sn_a_k_e_ca_s_e`} | ${`neit_he_r_is_this`}
    ${`snake-case`}  | ${`snake`}  | ${`th_is_is_no_sn_a_k_e_ca_s_e`} | ${`neit_he_r_is_this`}
    ${`dash case`}   | ${`dash`}   | ${`th-is-is-no-sn-a-k-e-ca-s-e`} | ${`neit-he-r-is-this`}
    ${`camel case`}  | ${`camel`}  | ${`thIsIsNoSnAKECaSE`}           | ${`neitHeRIsThis`}
    ${`pascal case`} | ${`pascal`} | ${`ThIsIsNoSnAKECaSE`}           | ${`NeitHeRIsThis`}
  `(
    "$type : param of $param applies to view names and requires $expected",
    ({ _type, param, expected1, expected2 }) => {
      const mockReporter = vi.fn();
      const schemaObject: DeepPartial<Schema> = {
        name: "schema",
        tables: [],
        views: [
          {
            name: "one_view",
            columns: [{ name: "Th-IsIsNoSnA_kECaSE" }, { name: "snake_case" }],
          },
          {
            name: "two_view",
            columns: [{ name: "neit_he-rIsThis" }, { name: "snake_case" }],
          },
        ],
      };

      nameCasing.process({
        options: [param],
        schemaObject: schemaObject as Schema,
        report: mockReporter,
      });

      if (param == null) {
        param = "snake";
      }

      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-casing",
          identifier: "schema.one_view.Th-IsIsNoSnA_kECaSE",
          message: `The column Th-IsIsNoSnA_kECaSE on the view one_view seems to be mixed-cased rather than ${param}-cased.`,
          suggestedMigration: `ALTER VIEW "one_view" RENAME COLUMN "Th-IsIsNoSnA_kECaSE" TO "${expected1}";`,
        }),
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: "name-casing",
          identifier: "schema.two_view.neit_he-rIsThis",
          message: `The column neit_he-rIsThis on the view two_view seems to be mixed-cased rather than ${param}-cased.`,
          suggestedMigration: `ALTER VIEW "two_view" RENAME COLUMN "neit_he-rIsThis" TO "${expected2}";`,
        }),
      );
    },
  );
});
