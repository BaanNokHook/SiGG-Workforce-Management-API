import format from 'string-format'
import { I18nFileLoader } from './fileLoader'

export const LANGUAGE = {
  TH: 'th',
  EN: 'en',
}

export interface ITranslatorOptions {
  baseDir: string
  fallbackLanguage: string
}

export type Translation = Record<string, string>
export type Translations = Record<string, Translation>

export class Translator {
  private translations: Translations = {}

  constructor(private options: ITranslatorOptions) {}

  load() {
    if (this.options.baseDir) {
      this.translations = new I18nFileLoader(this.options.baseDir).load()
    }
  }

  private getTranslate(lang: string, i18nKey: string) {
    const translation = this.getTranslation(lang)

    const translated = translation[i18nKey]

    if (translated) {
      return translated
    }

    return this.getTranslation(this.options.fallbackLanguage)[i18nKey]
  }

  translate(lang: string, i18nKey: string, data?: any) {
    const translated = this.getTranslate(lang, i18nKey)
    if (translated && data) {
      const mapped: any = {}
      Object.keys(data).map((key) => {
        mapped[key] = !data[key] ? '' : data[key]
      })

      const formatted = format(translated, mapped)
      return formatted
    }

    return translated
  }

  getTranslation(lang: string) {
    return this.translations[lang] || this.translations[this.options.fallbackLanguage] || {}
  }
}
