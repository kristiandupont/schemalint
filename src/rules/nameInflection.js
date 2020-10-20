const R = require('ramda');
const irregularPlurals = require('irregular-plurals/irregular-plurals.json');

const singulars = R.keys(irregularPlurals);
const plurals = R.values(irregularPlurals);
const trimSeparators = (s) => s.replace(/^(\-|_)+|(\-|_)+$/g, '');

const detectInflection = (word) => {
  const words = word
    .split(/(?=[A-Z\-_])/)
    .map(trimSeparators)
    .filter(Boolean);

  const lastWord = words[words.length - 1].toLowerCase();

  if (lastWord in irregularPlurals && irregularPlurals[lastWord] === lastWord) {
    // Irregular and singular = plural.
    return 'unknown';
  }

  if (R.includes(singulars, lastWord)) {
    return 'singular';
  }

  if (R.includes(plurals, lastWord)) {
    return 'plural';
  }

  // Regular plural words end with s
  const endsWithS = lastWord[lastWord.length - 1] === 's';

  // ..but some singular ones do as well. Though they typically have two s's (like kiss, address and fortress)
  const doubleS = lastWord.length > 1 && lastWord[lastWord.length - 2] === 's';

  const isPlural = endsWithS && !doubleS;

  return isPlural ? 'plural' : 'singular';
};

export const nameInflection = {
  name: 'name-inflection',
  docs: {
    description: 'Enforce singluar or plural naming of tables and views',
    url:
      'https://github.com/kristiandupont/schemalint/tree/master/src/rules#name-inflection',
  },
  process({ options, schemaObject, report }) {
    const expectedPlurality = (options.length && options[0]) || 'singular';
    const validator = (entityType) => ({ name: entityName }) => {
      const plurality = detectInflection(entityName);
      const matches =
        plurality === expectedPlurality || plurality === 'unknown';
      if (!matches) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${entityName}`,
          message: `Expected ${expectedPlurality} names, but '${entityName}' seems to be ${plurality}`,
        });
      }
    };
    schemaObject.tables.forEach(validator('table'));
    schemaObject.views.forEach(validator('view'));
  },
};
