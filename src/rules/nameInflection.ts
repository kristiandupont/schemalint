import type { TableDetails, ViewDetails } from "extract-pg-schema";
import irregularPlurals from "irregular-plurals";
import * as R from "ramda";

import type Rule from "../Rule";

const singulars = R.keys(irregularPlurals);
const plurals = R.values(irregularPlurals);
const trimSeparators = (s: string) => s.replaceAll(/^(-|_)+|(-|_)+$/g, "");

const detectInflection = (word: string) => {
  const words = word
    .split(/(?=[A-Z_-])/)
    .map(trimSeparators)
    .filter(Boolean);

  const lastWord = words.at(-1)?.toLowerCase();
  if (!lastWord) {
    return "unknown";
  }

  if (
    lastWord in irregularPlurals &&
    irregularPlurals.get(lastWord) === lastWord
  ) {
    // Irregular and singular = plural.
    return "unknown";
  }

  if (singulars.includes(lastWord as any)) {
    return "singular";
  }

  if (plurals.includes(lastWord as any)) {
    return "plural";
  }

  // Regular plural words end with s
  const endsWithS = lastWord.at(-1) === "s";

  // ..but some singular ones do as well. Though they typically have two s's (like kiss, address and fortress)
  const doubleS = lastWord.length > 1 && lastWord.at(-2) === "s";

  const isPlural = endsWithS && !doubleS;

  return isPlural ? "plural" : "singular";
};

export const nameInflection: Rule = {
  name: "name-inflection",
  docs: {
    description: "Enforce singluar or plural naming of tables and views",
    url: "https://github.com/kristiandupont/schemalint/tree/master/src/rules#name-inflection",
  },
  process({ options, schemaObject, report }) {
    const expectedPlurality = (options.length > 0 && options[0]) || "singular";
    const validator = ({ name: entityName }: TableDetails | ViewDetails) => {
      const plurality = detectInflection(entityName);
      const matches =
        plurality === expectedPlurality || plurality === "unknown";
      if (!matches) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${entityName}`,
          message: `Expected ${expectedPlurality} names, but '${entityName}' seems to be ${plurality}`,
        });
      }
    };
    schemaObject.tables.forEach(validator);
    schemaObject.views.forEach(validator);
  },
};
