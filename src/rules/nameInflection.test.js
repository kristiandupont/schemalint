import { describe, expect, it, test, vi } from 'vitest';

import { nameInflection } from './nameInflection';

describe('nameInflection', () => {
  it('no tables or views passed no errors', () => {
    const mockReporter = vi.fn();

    nameInflection.process({
      options: [],
      schemaObject: {
        tables: [],
        views: [],
      },
      report: mockReporter,
    });

    expect(mockReporter).toBeCalledTimes(0);
  });

  test.each`
    type          | param         | actual1        | actual 2      | expected1      | expected2
    ${`default`}  | ${null}       | ${`one_wives`} | ${`two_jims`} | ${`one_wife`}  | ${`two_jim`}
    ${`singular`} | ${`singular`} | ${`one_wives`} | ${`two_jims`} | ${`one_wife`}  | ${`two_jim`}
    ${`plural`}   | ${`plural`}   | ${`one_wife`}  | ${`two_jim`}  | ${`one_wives`} | ${`two_jims`}
  `(
    '$type : param of $param applies to table names and requires $expected',
    ({ param, actual1, actual2, _expected1, _expected2 }) => {
      const mockReporter = vi.fn();

      nameInflection.process({
        options: [param],
        schemaObject: {
          name: 'schema',
          tables: [
            { name: `${actual1}`, columns: [] },
            { name: `${actual2}`, columns: [] },
          ],
          views: [],
        },
        report: mockReporter,
      });

      if (param == null) {
        param = 'singular';
      }
      const opposite = param === 'singular' ? 'plural' : 'singular';

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: 'name-inflection',
          identifier: `schema.${actual1}`,
          message: `Expected ${param} names, but '${actual1}' seems to be ${opposite}`,
        })
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: 'name-inflection',
          identifier: `schema.${actual2}`,
          message: `Expected ${param} names, but '${actual2}' seems to be ${opposite}`,
        })
      );
    }
  );
  test.each`
    type          | param         | actual1        | actual 2      | expected1      | expected2
    ${`default`}  | ${null}       | ${`one_wives`} | ${`two_jims`} | ${`one_wife`}  | ${`two_jim`}
    ${`singular`} | ${`singular`} | ${`one_wives`} | ${`two_jims`} | ${`one_wife`}  | ${`two_jim`}
    ${`plural`}   | ${`plural`}   | ${`one_wife`}  | ${`two_jim`}  | ${`one_wives`} | ${`two_jims`}
  `(
    '$type : param of $param applies to view names and requires $expected',
    ({ param, actual1, actual2, _expected1, _expected2 }) => {
      const mockReporter = vi.fn();

      nameInflection.process({
        options: [param],
        schemaObject: {
          name: 'schema',
          views: [
            { name: `${actual1}`, columns: [] },
            { name: `${actual2}`, columns: [] },
          ],
          tables: [],
        },
        report: mockReporter,
      });

      if (param == null) {
        param = 'singular';
      }
      const opposite = param === 'singular' ? 'plural' : 'singular';

      expect(mockReporter).toBeCalledTimes(2);
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: 'name-inflection',
          identifier: `schema.${actual1}`,
          message: `Expected ${param} names, but '${actual1}' seems to be ${opposite}`,
        })
      );
      expect(mockReporter).toBeCalledWith(
        expect.objectContaining({
          rule: 'name-inflection',
          identifier: `schema.${actual2}`,
          message: `Expected ${param} names, but '${actual2}' seems to be ${opposite}`,
        })
      );
    }
  );
});
