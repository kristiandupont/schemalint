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
