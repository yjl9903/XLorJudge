process.env = Object.assign(process.env, { DEFAULT_REDIS: true });

module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  moduleFileExtensions: [
    "ts", "js"
  ],
  moduleNameMapper: {
    "^@config$": "<rootDir>/src/configs/index.ts",
    "^@util$": "<rootDir>/src/util.ts",
  },
  moduleDirectories: [
    "node_modules", "src/types"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: [
    "**/test/**/*.test.(ts|js)"
  ],
  testEnvironment: "node"
};