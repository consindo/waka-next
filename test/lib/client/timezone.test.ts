import { describe, expect, it } from 'vitest'

import { convertFromTimezone } from '@lib/client/timezone'

describe('timezone', () => {
  describe('convertFromTimezone', () => {
    it('should return a date in another timezone as UTC', () => {
      expect(
        convertFromTimezone('Pacific/Auckland', '2013-02-28T19:00:00.000').toISOString()
      ).toEqual('2013-02-28T06:00:00.000Z')
      expect(
        convertFromTimezone('Australia/Sydney', '2013-02-28T19:00:00.000').toISOString()
      ).toEqual('2013-02-28T08:00:00.000Z')
      expect(
        convertFromTimezone('America/Panama', '2013-02-28T19:00:00.000').toISOString()
      ).toEqual('2013-03-01T00:00:00.000Z')

      expect(
        convertFromTimezone('Pacific/Auckland', '2013-02-28T19:00:00.000Z').toISOString()
      ).toEqual('2013-02-28T06:00:00.000Z')
    })
  })
})
