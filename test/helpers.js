global.assertReport = (mockReporter, expectedRule, expectedIdentifier, expectedMessage, expectedSuggestedMigration) => {
  expect(mockReporter).toBeCalledWith(
    expect.objectContaining({
      rule: expectedRule,
      identifier: expectedIdentifier,
      message: expectedMessage,
      suggestedMigration: expectedSuggestedMigration,
    }),
  );
};
global.assertJSONBReport = (mockReporter, expectedIdentifier, expectedSuggestedMigration) => {
  assertReport(mockReporter,
    "prefer-jsonb-to-json",
    expectedIdentifier,
    'Prefer JSONB to JSON types',
    expectedSuggestedMigration);
};
global.assertTextReport = (mockReporter, expectedIdentifier, expectedColumnType, expectedSuggestedMigration) => {
  assertReport(mockReporter,
    "prefer-text-to-varchar",
    expectedIdentifier,
    `Prefer text to ${expectedColumnType} types`,
    expectedSuggestedMigration);
};
global.assertIdentityReport = (mockReporter, expectedIdentifier, expectedSuggestedMigration) => {
  assertReport(mockReporter,
    "prefer-identity-to-serial",
    expectedIdentifier,
    "Prefer IDENTITY to type SERIAL",
    expectedSuggestedMigration);
};
