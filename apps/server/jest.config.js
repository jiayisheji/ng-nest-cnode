module.exports = {
  name: 'server',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/server',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
};
