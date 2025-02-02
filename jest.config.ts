/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  globalSetup: "./tests/setup.ts",
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  "collectCoverageFrom": [
    "<rootDir>/**/*.{tsx,ts}",
    "!**/*.{js,d.ts}"
  ],
  "coverageReporters": [
    "lcov",
    "json-summary"
  ]
};

export default config;
