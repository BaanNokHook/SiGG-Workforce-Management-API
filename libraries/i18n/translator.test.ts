import path from 'path'
import { Translator } from './translator'

describe('Translator', () => {
  describe('File Loader', () => {
    const translator = new Translator({
      fallbackLanguage: 'en',
      baseDir: path.join(__dirname, '__mocks__/i18n/'),
    })

    translator.load()

    it('should load translations successfully', () => {
      expect(translator.getTranslation('th')).toEqual({
        key1: 'val1_th',
        key_a: 'valA_th: {value}',
        key_b: 'valB_th: {value1} {value2}',
      })
      expect(translator.getTranslation('en')).toEqual({
        key1: 'val1_en',
        key2: 'val2_en',
        key_a: 'valA_en: {value}',
        key_b: 'valB_en: {valueA} - {valueB}',
        key_c: 'valC_en: {valueA} - {valueB}',
      })
      expect(translator.getTranslation('jp')).toEqual({
        key1: 'val1_en',
        key2: 'val2_en',
        key_a: 'valA_en: {value}',
        key_b: 'valB_en: {valueA} - {valueB}',
        key_c: 'valC_en: {valueA} - {valueB}',
      })
    })

    it('should translate successfully', () => {
      expect(translator.translate('en', 'key1')).toBe('val1_en')
      expect(translator.translate('th', 'key1')).toBe('val1_th')
      expect(translator.translate('th', 'key2')).toBe('val2_en')
      expect(translator.translate('jp', 'key1')).toBe('val1_en')
      expect(translator.translate('jp', 'key2')).toBe('val2_en')
    })

    it('should translate key with template correctly', () => {
      expect(translator.translate('en', 'key_a', { value: 'val' })).toBe('valA_en: val')
      expect(translator.translate('th', 'key_a', { value: 'val' })).toBe('valA_th: val')
      expect(translator.translate('en', 'key_b', { valueA: 'val1', valueB: 'val2' })).toBe(
        'valB_en: val1 - val2',
      )
      expect(translator.translate('th', 'key_b', { value1: 'val1', value2: 'val2' })).toBe(
        'valB_th: val1 val2',
      )
      expect(translator.translate('th', 'key_c', { valueA: 'val1', valueB: 'val2' })).toBe(
        'valC_en: val1 - val2',
      )
      expect(translator.translate('th', 'key_c', { valueA: undefined, valueB: 'val2' })).toBe(
        'valC_en:  - val2',
      )
      expect(
        translator.translate('th', 'invalid_key', { valueA: undefined, valueB: 'val2' }),
      ).toBeUndefined()
    })
  })
})
