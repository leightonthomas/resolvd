module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/lib/"],
  testMatch: [
    "**/__tests__/**/*.test.ts?(x)",
  ],
};
