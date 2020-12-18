module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/server',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
  displayName: 'server',
};
