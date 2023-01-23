import { Schema } from 'extract-pg-schema';

export type Reporter = (p: {
  rule: string;
  identifier: string;
  message: string;
  suggestedMigration?: string;
}) => void;

type Rule = {
  name: string;
  docs: {
    description: string;
    url?: string;
  };
  process: (p: {
    options: any;
    schemaObject: Schema;
    report: Reporter;
  }) => void;
};

export default Rule;
