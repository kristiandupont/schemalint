import {preferJsonbToJson, preferTextToVarchar} from "./types";

describe('types', () => {
    describe('prefer-jsonb-to-json', () => {
        it("no tables has no errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {tables: []};

            preferJsonbToJson.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(0);
        });

        it("one table, json columns has errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [
                        {type: "json", name: "bad_column"},
                        {type: "text", name: "not_relavant"},
                        {type: "json", name: "bad_column2"}
                    ]
                }]
            };

            preferJsonbToJson.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(2);
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-jsonb-to-json",
                    identifier: "schema.one_table.bad_column",
                    message: 'Prefer JSONB to JSON types',
                    suggestedMigration: 'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE JSONB;',
                }),
            );
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-jsonb-to-json",
                    identifier: "schema.one_table.bad_column2",
                    message: 'Prefer JSONB to JSON types',
                    suggestedMigration: 'ALTER TABLE "one_table" ALTER COLUMN "bad_column2" TYPE JSONB;',
                }),
            );
        });

        it("one table, no json column has no errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [{type: "varchar", name: "not_relevant_column"}]
                }]
            };

            preferJsonbToJson.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(0);
        });
        it("multiple tables with multiple json columns has multiple errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [{type: "json", name: "bad_column"}]
                }, {
                    name: "two_table",
                    columns: [{type: "varchar", name: "not_relevant_column"}]
                }, {
                    name: "three_table",
                    columns: [{type: "json", name: "bad_column3"}]
                }]
            };

            preferJsonbToJson.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(2);
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-jsonb-to-json",
                    identifier: "schema.one_table.bad_column",
                    message: 'Prefer JSONB to JSON types',
                    suggestedMigration: 'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE JSONB;',
                }),
            );
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-jsonb-to-json",
                    identifier: "schema.three_table.bad_column3",
                    message: 'Prefer JSONB to JSON types',
                    suggestedMigration: 'ALTER TABLE "three_table" ALTER COLUMN "bad_column3" TYPE JSONB;',
                }),
            );
        });
    });
});