import { getRegions } from '../../../apps/web/src/lib/storage'
import { afterEach, describe, expect, it, vi } from 'vitest'

const browserGetter = vi.fn()
vi.mock('$app/environment', () => ({
  get browser() {
    return browserGetter()
  },
}))

vi.stubGlobal('navigator', { connection: { saveData: false } })

const fakeRegion = {
  region: 'sample-region',
  etag: '1234',
  bounds: [[3, 2], [1, 0]],
  url: 'example.com'
}

describe('Storage', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  describe('getRegions', () => {
    it('should load regions if they are located in the region', async () => {
      browserGetter.mockReturnValue(true)
      const loadRegion = vi.fn()
      const result = await getRegions(vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          regions: [fakeRegion], 
          userLocation: {
            latitude: 1,
            longitude: 2,
          }
        })
      }), loadRegion)
      expect(loadRegion).toBeCalledTimes(1)
      expect(result).toEqual([fakeRegion])
    })
  })
  it('should return from cache on subsequent runs', async () => {
    const fetchMock = vi.fn()
    const result = await getRegions(fetchMock)
    expect(fetchMock).toBeCalledTimes(0)
    expect(result).toEqual([fakeRegion])
  })
})
