const BrotliPlugin = require(`brotli-webpack-plugin`);
const CompressionPlugin = require(`compression-webpack-plugin`);
const webpack = require("webpack");

module.exports = {
  plugins: [
    new BrotliPlugin({
      asset: '[fileWithoutExt].[ext].br',
      test: /\.(js|html|svg|txt|eot|otf|ttf|gif)$/
    }),
    new CompressionPlugin({
      test: /\.(js|html|svg|txt|eot|otf|ttf|gif)$/,
      filename(info) {
        let opFile = info.path.split('.'),
          opFileType = opFile.pop(),
          opFileName = opFile.join('.');
        return `${opFileName}.${opFileType}.gzip`;
      }
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
}
