import TsConfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import nodeExternals from 'webpack-node-externals'
import webpack, { Configuration } from 'webpack'

import path from 'path'

const getPath = (filePath: string = '') => path.resolve(__dirname, filePath)

const paths = {
  appRoot: getPath('.'),
  tsConfigPath: getPath('./tsconfig.json'),
}

const tsReg = /\.(ts|tsx)$/

export function getConfig(dir, file): Configuration {
  return {
    entry: getPath(`${dir}/${file}`),
    target: 'node',
    node: {
      __dirname: false,
      __filename: false,
    },
    externals: [nodeExternals()],
    output: {
      path: getPath(dir),
      filename: file.replace(/\.ts/, '.js'),
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      plugins: [new TsConfigPathsPlugin({ configFile: paths.tsConfigPath })],
    },
    module: {
      rules: [
        {
          test: tsReg,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: paths.tsConfigPath,
              },
            },
          ],
          exclude: [/node_modules/],
        },
      ],
    },
    plugins: [new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ko/)],
    mode: 'development',
  }
}
