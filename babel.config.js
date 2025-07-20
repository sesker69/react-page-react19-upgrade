module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic', // Use the new React 19 JSX transform
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
};
