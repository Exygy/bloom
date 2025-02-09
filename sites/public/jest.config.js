/*eslint no-undef: "error"*/
/*eslint-env node*/

process.env.TZ = "UTC"

module.exports = {
  testRegex: ["/*.test.tsx$", "/*.test.ts$"],
  collectCoverageFrom: ["**/*.ts", "**/*.tsx"],
  coveragePathIgnorePatterns: [
    "cypress",
    "types",
    "__tests__",
    "next-env.d.ts",
    "sentry.client.config.ts",
    "sentry.server.config.ts",
    "sentry.edge.config.ts",
  ],
  coverageReporters: ["lcov", "text"],
  coverageDirectory: "test-coverage",
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
      isolatedModules: true,
    },
  },
  transform: {
    "^.+\\.[t|j]sx?$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/?!(@bloom-housing/ui-components)"],
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["../public/.jest/setup-tests.js"],
  moduleNameMapper: {
    "\\.(scss|css|less)$": "identity-obj-proxy",
    "\\.module\\.scss$": "identity-obj-proxy",
  },
}
