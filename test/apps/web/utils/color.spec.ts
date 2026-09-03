import { describe, expect, it } from 'vitest'

import { getTextColor } from '../../../../apps/web/src/lib/utils/color'

describe('color', () => {
  describe('getTextColor', () => {
    it('should return #000 for light colors', () => {
      expect(getTextColor('#ffffff')).toEqual('#000')
      expect(getTextColor('#bada55')).toEqual('#000')
      expect(getTextColor('#aacde3')).toEqual('#000')
      expect(getTextColor('#f39200')).toEqual('#000')
    })
    it('should return #fff for dark colors', () => {
      expect(getTextColor('#000000')).toEqual('#fff')
      expect(getTextColor('#00833e')).toEqual('#fff')
      expect(getTextColor('#d62aa2')).toEqual('#fff')
    })
  })
})
