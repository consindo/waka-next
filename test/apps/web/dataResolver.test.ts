import { describe, it, expect, vi, afterEach } from 'vitest'
import { browser } from '$app/environment'
import { isClientReady } from '../../../apps/web/src/lib/storage'
import { resolveData } from '../../../apps/web/src/lib/dataResolver'

const browserGetter = vi.fn()
vi.mock('$app/environment', () => ({
  get browser() {
    return browserGetter()
  },
}))
vi.mock('@lib/client', () => ({}))
vi.mock('../../../apps/web/src/lib/storage', () => ({
  isClientReady: vi.fn(),
  getClient: vi.fn(),
  waitForClient: true,
}))

describe('DataResolver', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  describe('resolveData', () => {
    it('should return data from the client if running in the browser and available', async () => {
      browserGetter.mockReturnValue(true)
      expect(browser).toEqual(true)
      isClientReady.mockReturnValue(true)

      const data = await resolveData('', () => 'clientData', vi.fn())
      expect(data).toEqual({ provider: 'client', data: 'clientData' })
    })

    it('should return data from the server if running on server', async () => {
      browserGetter.mockReturnValue(false)
      isClientReady.mockReturnValue(false)

      const data = await resolveData(
        '',
        vi.fn(),
        vi.fn(() => ({ ok: true, json: () => 'serverData' }))
      )
      expect(data).toEqual({ provider: 'server', data: 'serverData' })
    })

    it('should return data from the server if on client but is not ready', async () => {
      browserGetter.mockReturnValue(true)
      isClientReady.mockReturnValue(false)

      const data = await resolveData(
        '',
        vi.fn(),
        vi.fn(() => ({ ok: true, json: () => 'serverData' }))
      )
      expect(data).toEqual({ provider: 'server', data: 'serverData' })
    })

    it('should return empty data if the server encounters an error ', async () => {
      browserGetter.mockReturnValue(false)
      isClientReady.mockReturnValue(false)

      const data = await resolveData(
        '',
        vi.fn(),
        vi.fn(() => ({ ok: false }))
      )
      expect(data).toEqual({ provider: 'static-server', data: null })
    })

    it('should wait for the client if the server gets an error and is running in the browser', async () => {
      browserGetter.mockReturnValue(true)
      isClientReady.mockReturnValue(false)

      const data = await resolveData(
        '',
        () => 'clientData',
        vi.fn(() => ({ ok: false }))
      )
      expect(data).toEqual({ provider: 'static-client', data: 'clientData' })
    })
  })
})
