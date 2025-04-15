/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    moduleDirectories: ['node_modules', 'src'],
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
    },
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1',
      },
    coverageDirectory: '../coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/test/',
        '/src/common/',
        '/src/main.ts/',
        '/src/user/infrastructure/repositories/',
        '/src/auth/infrastructure/repositories/',
      ],
};