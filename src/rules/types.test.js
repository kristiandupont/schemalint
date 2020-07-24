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
            assertJSONBReport(mockReporter,
                "schema.one_table.bad_column",
                'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE JSONB;'
            );
            assertJSONBReport(mockReporter,
                "schema.one_table.bad_column2",
                'ALTER TABLE "one_table" ALTER COLUMN "bad_column2" TYPE JSONB;'
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
            assertJSONBReport(mockReporter,
                "schema.one_table.bad_column",
                'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE JSONB;'
            );
            assertJSONBReport(mockReporter,
                "schema.three_table.bad_column3",
                'ALTER TABLE "three_table" ALTER COLUMN "bad_column3" TYPE JSONB;',
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
            assertTextReport(mockReporter,
                "schema.one_table.bad_column",
                "varchar(10)",
                'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE TEXT;'
            );
            assertTextReport(mockReporter,
                "schema.one_table.bad_column2",
                "varchar(5)",
                'ALTER TABLE "one_table" ALTER COLUMN "bad_column2" TYPE TEXT;'
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
            assertTextReport(mockReporter,
                "schema.one_table.bad_column",
                "varchar",
                'ALTER TABLE "one_table" ALTER COLUMN "bad_column" TYPE TEXT;'
            );
            assertTextReport(mockReporter,
                "schema.three_table.bad_column3",
                "varchar(1)",
                'ALTER TABLE "three_table" ALTER COLUMN "bad_column3" TYPE TEXT;'
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

    describe('prefer-identity-to-serial', () => {
        it("no tables has no errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {tables: []};

            types.preferIdentity.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(0);
        });

        it("one table, serial columns has errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [
                        {name: "bad_column", rawInfo: {is_identity: "NO"}, defaultValue: "nextval('table_name_column_1_seq'::regclass)"},
                        {name: "bad_column2", rawInfo: {is_identity: "NO"}, defaultValue: "nextval('table_name_column_2_seq'::regclass)"},
                    ]
                }]
            };

            types.preferIdentity.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(2);
            assertIdentityReport(mockReporter,
                "schema.one_table.bad_column",
        `ALTER TABLE "one_table" ALTER "bad_column" DROP DEFAULT;
DROP SEQUENCE "table_name_column_1_seq";
ALTER TABLE "one_table" ALTER "bad_column" ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT setval('"table_name_column_1_seq"', max("bad_column")) FROM "one_table";`
            );
            assertIdentityReport(mockReporter,
                "schema.one_table.bad_column2",
        `ALTER TABLE "one_table" ALTER "bad_column2" DROP DEFAULT;
DROP SEQUENCE "table_name_column_2_seq";
ALTER TABLE "one_table" ALTER "bad_column2" ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT setval('"table_name_column_2_seq"', max("bad_column2")) FROM "one_table";`
            );
        });

        it("one table, no varchar column has no errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns: [{type: "int", name: "not_relevant_column", rawInfo: {is_identity: "YES"}}]
                }]
            };

            types.preferIdentity.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(0);
        });

        it("multiple tables with multiple varchar columns has multiple errors", () => {
            const mockReporter = jest.fn();
            const schemaObject = {
                name: "schema",
                tables: [{
                    name: "one_table",
                    columns : [{name: "bad_column", rawInfo: {is_identity: "NO"}, defaultValue: "nextval('table_name_column_1_seq'::regclass)"}]
                }, {
                    name: "two_table",
                    columns: [{type: "text", name: "not_relevant_column", rawInfo: {is_identity: "NO"}, defaultValue: null}]
                }, {
                    name: "three_table",
                    columns : [{name: "bad_column3", rawInfo: {is_identity: "NO"}, defaultValue: "nextval('table_name_column_3_seq'::regclass)"}]
                }]
            };

            types.preferIdentity.process({schemaObject: schemaObject, report: mockReporter});

            expect(mockReporter).toBeCalledTimes(2);
            assertIdentityReport(mockReporter,
                "schema.one_table.bad_column",
        `ALTER TABLE "one_table" ALTER "bad_column" DROP DEFAULT;
DROP SEQUENCE "table_name_column_1_seq";
ALTER TABLE "one_table" ALTER "bad_column" ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT setval('"table_name_column_1_seq"', max("bad_column")) FROM "one_table";`
            );
            assertIdentityReport(mockReporter,
                "schema.three_table.bad_column3",
        `ALTER TABLE "three_table" ALTER "bad_column3" DROP DEFAULT;
DROP SEQUENCE "table_name_column_3_seq";
ALTER TABLE "three_table" ALTER "bad_column3" ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT setval('"table_name_column_3_seq"', max("bad_column3")) FROM "three_table";`
            );
        });
    });
});