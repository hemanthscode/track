export default {
  testEnvironment: "node",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/tests/**",
    "!src/server.js",
    "!src/docs/**"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/tests/**/*.test.js"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  testTimeout: 10000
};
