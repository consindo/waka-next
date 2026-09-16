import { describe, expect, it } from 'vitest'

import { formatTripHeadsign } from '../../../../apps/web/src/lib/utils/formatHeadsign'

describe('formatHeadsign', () => {
  describe('formatTripHeadsign', () => {
    it('should return nothing if nothing is supplied', () => {
      expect(formatTripHeadsign('')).toEqual([])
      expect(formatTripHeadsign()).toEqual([])
    })
    it('should make uppercase headsigns title case', () => {
      expect(formatTripHeadsign('KARANGAHAPE ROAD')).toEqual(['Karangahape Road'])
    })
    it('should split headsigns into parts', () => {
      expect(formatTripHeadsign('Britomart To Karangahape Road via Grafton and Newmarket')).toEqual(
        ['Britomart to Karangahape Road', 'via Grafton & Newmarket ']
      )
    })
  })
})
