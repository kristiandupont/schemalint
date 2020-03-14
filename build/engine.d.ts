export function processDatabase({ connection, plugins, rules, schemas, ignores, }: {
    connection: any;
    plugins?: any[];
    rules: any;
    schemas: any;
    ignores?: any[];
}): Promise<1 | 0>;
