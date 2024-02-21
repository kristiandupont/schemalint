import type { Schema } from "extract-pg-schema";

export type Issue = {
  rule: string;
  identifier: string;
  message: string;
  suggestedMigration?: string;
};

export type Reporter = (p: Issue) => void;

type Rule = {
  name: string;
  docs: {
    description: string;
    url?: string;
  };
  process: (p: {
    options?: any;
    schemaObject: Schema;
    report: Reporter;
  }) => void;
};

export default Rule;
