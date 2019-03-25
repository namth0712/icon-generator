const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      // Use compiled pica files from /dist folder
      pica: 'pica/dist/pica.js',
    },
  },
};
