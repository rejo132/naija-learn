module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Web: transform import.meta in dependencies (e.g. persist/AsyncStorage ESM) so the
          // browser bundle does not throw "Cannot use 'import.meta' outside a module".
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': ['./src', './'],
          },
        },
      ],
    ],
  };
};