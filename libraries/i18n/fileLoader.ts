import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { Translations } from './translator'

export class I18nFileLoader {
  constructor(private baseDir: string) {}

  load(): Translations {
    const translations: Translations = {}

    // list dirs
    const dirs = readdirSync(this.baseDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dir) => dir.name)

    // list files in dir
    dirs.forEach((dir) => {
      translations[dir] = {}

      const files = readdirSync(path.join(this.baseDir, dir), { withFileTypes: true })

      files.forEach((file) => {
        const keyValues = JSON.parse(readFileSync(path.join(this.baseDir, dir, file.name), 'utf-8'))

        for (const key of Object.keys(keyValues)) {
          translations[dir][key] = keyValues[key]
        }
      })
    })

    return translations
  }
}
