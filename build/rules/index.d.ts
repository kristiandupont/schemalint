export namespace preferJsonbToJson {
    export const name: string;
    export namespace docs {
        export const description: string;
        export const url: string;
    }
    export function process({ schemaObject, report }: {
        schemaObject: any;
        report: any;
    }): void;
}
export namespace preferTextToVarchar {
    const name_1: string;
    export { name_1 as name };
    export namespace docs_1 {
        const description_1: string;
        export { description_1 as description };
        const url_1: string;
        export { url_1 as url };
    }
    export { docs_1 as docs };
    export function process_1({ schemaObject, report }: {
        schemaObject: any;
        report: any;
    }): void;
    export { process_1 as process };
}
export namespace tableNameCasing {
    const name_2: string;
    export { name_2 as name };
    export namespace docs_2 {
        const description_2: string;
        export { description_2 as description };
        const url_2: string;
        export { url_2 as url };
    }
    export { docs_2 as docs };
    export function process_2({ options, schemaObject, report }: {
        options: any;
        schemaObject: any;
        report: any;
    }): void;
    export { process_2 as process };
}
export namespace columnNameCasing {
    const name_3: string;
    export { name_3 as name };
    export namespace docs_3 {
        const description_3: string;
        export { description_3 as description };
        const url_3: string;
        export { url_3 as url };
    }
    export { docs_3 as docs };
    export function process_3({ options, schemaObject, report }: {
        options: any;
        schemaObject: any;
        report: any;
    }): void;
    export { process_3 as process };
}
