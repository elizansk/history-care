import { copyFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const distPath = resolve('dist')

await copyFile(resolve(distPath, 'index.html'), resolve(distPath, '404.html'))
await writeFile(resolve(distPath, '.nojekyll'), '')
