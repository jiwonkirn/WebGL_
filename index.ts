import path from 'path'
import { readdir } from 'fs'
import { promisify } from 'util'
import webpack from 'webpack'

import { getConfig } from './webpack.config'

const readDir = promisify(readdir)

const getPath = (filePath: string = '') => path.resolve(__dirname, filePath)

const arg = process.argv[2]
const reg = /\d+\-\d+/

async function findPath(relativePath: string, regExp: RegExp, errorMessage: string) {
  const paths = await readDir(getPath(relativePath), 'utf-8')
  const path = paths.find(d => regExp.test(d))

  if (!path) {
    throw new Error(errorMessage)
  }

  return path
}

async function main() {
  if (!reg.test(arg)) {
    throw new Error(`Argument should be 'number-number' form like '1-2'.`)
  }

  const [dirNum, fileNum] = arg.split('-')
  const dirReg = new RegExp(`^${dirNum}\\..+`)
  const fileReg = new RegExp(`^${fileNum}\\..+\.ts`)

  const dir = await findPath('', dirReg, 'Directory is not exist.')
  const file = await findPath(dir, fileReg, 'File is not exist.')

  const config = getConfig(dir, file)
  const compiler = webpack(config)
  console.log('config', config)

  compiler.run((err, stats) => {
    if (err) return console.error(err.stack || err)
    if (!stats) return console.error('stats are not exist')

    const info = stats.toJson()

    if (stats.hasErrors()) {
      return console.error(info.errors)
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings)
    }

    console.log(
      stats.toString({
        chunks: false,
        colors: true,
      }),
    )
  })
}

main().catch(({ message }) => {
  console.error(message)
  process.exit(1)
})
