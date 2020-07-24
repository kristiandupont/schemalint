import * as types from "./types";

describe('types', () => {
    describe('prefer-jsonb-to-json', () => {
        it("no tables has no errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {tables: []};

            types.preferJsonbToJson.process({schemaObject: schemaObject, report: mockReporter});

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

            types.preferJsonbToJson.process({schemaObject: schemaObject, report: mockReporter});

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

            types.preferJsonbToJson.process({schemaObject: schemaObject, report: mockReporter});

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

            types.preferJsonbToJson.process({schemaObject: schemaObject, report: mockReporter});

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

    describe('prefer-text-to-varchar', () => {
        it("no tables has no errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {tables: []};

            types.preferTextToVarchar.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(0);
        });

        it("one table, varchar columns has errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [
                        {type: "varchar(10)", name: "bad_column"},
                        {type: "varchar(5)", name: "bad_column2"},
                    ]
                }]
            };

            types.preferTextToVarchar.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(2);
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-text-to-varchar",
                    identifier: "schema.one_table.bad_column",
                    message: "Prefer text to varchar(10) types",
                    suggestedMigration: 'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE TEXT;',
                }),
            );
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-text-to-varchar",
                    identifier: "schema.one_table.bad_column2",
                    message: "Prefer text to varchar(5) types",
                    suggestedMigration: 'ALTER TABLE "one_table" ALTER COLUMN "bad_column2" TYPE TEXT;',
                }),
            );
        });

        it("one table, no varchar column has no errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [{type: "text", name: "not_relevant_column"}]
                }]
            };

            types.preferTextToVarchar.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(0);
        });

        it("multiple tables with multiple varchar columns has multiple errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [{type: "varchar", name: "bad_column"}]
                }, {
                    name: "two_table",
                    columns: [{type: "text", name: "not_relevant_column"}]
                }, {
                    name: "three_table",
                    columns: [{type: "varchar(1)", name: "bad_column3"}]
                }]
            };

            types.preferTextToVarchar.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(2);
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-text-to-varchar",
                    identifier: "schema.one_table.bad_column",
                    message: "Prefer text to varchar types",
                    suggestedMigration: 'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE TEXT;',
                }),
            );
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-text-to-varchar",
                    identifier: "schema.three_table.bad_column3",
                    message: "Prefer text to varchar(1) types",
                    suggestedMigration: 'ALTER TABLE "three_table" ALTER COLUMN "bad_column3" TYPE TEXT;',
                }),
            );
        });
    });

    describe('prefer-timestamptz-to-timestamp', () => {
        it("no tables has no errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {tables: []};

            types.preferTimestamptz.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(0);
        });

        it("one table, timetamp columns has errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [
                        {type: "timestamp", name: "bad_column"},
                        {type: "timestamp", name: "bad_column2"},
                    ]
                }]
            };

            types.preferTimestamptz.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(2);
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-timestamptz-to-timestamp",
                    identifier: "schema.one_table.bad_column",
                    message: "Prefer TIMESTAMPTZ to type TIMESTAMP",
                    suggestedMigration: 'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE TIMESTAMPTZ;',
                }),
            );
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-timestamptz-to-timestamp",
                    identifier: "schema.one_table.bad_column2",
                    message: "Prefer TIMESTAMPTZ to type TIMESTAMP",
                    suggestedMigration: 'ALTER TABLE "one_table" ALTER COLUMN "bad_column2" TYPE TIMESTAMPTZ;',
                }),
            );
        });

        it("one table, no varchar column has no errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [{type: "text", name: "not_relevant_column"}]
                }]
            };

            types.preferTimestamptz.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(0);
        });

        it("multiple tables with multiple varchar columns has multiple errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [{type: "timestamp", name: "bad_column"}]
                }, {
                    name: "two_table",
                    columns: [{type: "text", name: "not_relevant_column"}]
                }, {
                    name: "three_table",
                    columns: [{type: "timestamp", name: "bad_column3"}]
                }]
            };

            types.preferTimestamptz.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(2);
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-timestamptz-to-timestamp",
                    identifier: "schema.one_table.bad_column",
                    message: "Prefer TIMESTAMPTZ to type TIMESTAMP",
                    suggestedMigration: 'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE TIMESTAMPTZ;',
                }),
            );
            expect(mockReporter).toBeCalledWith(
                expect.objectContaining({
                    rule: "prefer-timestamptz-to-timestamp",
                    identifier: "schema.three_table.bad_column3",
                    message: "Prefer TIMESTAMPTZ to type TIMESTAMP",
                    suggestedMigration: 'ALTER TABLE "three_table" ALTER COLUMN "bad_column3" TYPE TIMESTAMPTZ;',
                }),
            );
        });
    });
});