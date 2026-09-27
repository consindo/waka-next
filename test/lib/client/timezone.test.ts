import { describe, expect, it } from 'vitest'

import { convertFromGtfsDateToISOTimestamp, convertFromTimezone } from '@lib/client/timezone'

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

  describe('convertFromGtfsDateToISOTimestamp', () => {
    it('should convert a normal date to an ISO timestamp', () => {
      expect(
        convertFromGtfsDateToISOTimestamp('2026-09-27', '0:00:00', 'Pacific/Auckland')
      ).toEqual('2026-09-26T12:00:00.000Z')
    })
    it('should handle daylight savings conversions on the same day', () => {
      expect(
        convertFromGtfsDateToISOTimestamp('2026-09-27', '12:00:00', 'Pacific/Auckland')
      ).toEqual('2026-09-26T23:00:00.000Z')
    })
    it('should handle more than 24 hours in a day', () => {
      expect(
        convertFromGtfsDateToISOTimestamp('2026-09-27', '36:22:22', 'Pacific/Auckland')
      ).toEqual('2026-09-27T23:22:22.000Z')
    })
  })
})
