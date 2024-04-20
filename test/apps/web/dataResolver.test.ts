import { browser } from '$app/environment'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { resolveData } from '../../../apps/web/src/lib/dataResolver'
import { isClientReady, waitForClient } from '../../../apps/web/src/lib/storage'

const prefix = 'sample-region'
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
  waitForClient: vi.fn(),
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

      const data = await resolveData(prefix, '', () => 'clientData', vi.fn())
      expect(data).toEqual({ provider: 'client', data: 'clientData' })
    })

    it('should catch client not found errors', async () => {
      browserGetter.mockReturnValue(true)
      expect(browser).toEqual(true)
      isClientReady.mockReturnValue(true)

      const data = await resolveData(
        prefix,
        '',
        () => {
          const err = new Error()
          err.code = 'NOT_FOUND'
          throw err
        },
        vi.fn()
      )
      expect(data).toEqual({ provider: 'client', error: 'NOT_FOUND', data: null })

      const data2 = await resolveData(
        prefix,
        '',
        () => {
          const err = new Error()
          err.code = 'REGION_NOT_FOUND'
          throw err
        },
        vi.fn()
      )
      expect(data2).toEqual({ provider: 'client', error: 'REGION_NOT_FOUND', data: null })
    })

    it('should throw client exceptions', async () => {
      browserGetter.mockReturnValue(true)
      expect(browser).toEqual(true)
      isClientReady.mockReturnValue(true)

      const data = resolveData(
        prefix,
        '',
        () => {
          const err = new Error()
          err.code = 'Unhandled Exception'
          throw err
        },
        vi.fn()
      )
      await expect(() => data).rejects.toThrowError()
    })

    it('should return data from the server if running on server', async () => {
      browserGetter.mockReturnValue(false)
      isClientReady.mockReturnValue(false)

      const data = await resolveData(
        prefix,
        '',
        vi.fn(),
        vi.fn(() => ({
          ok: true,
          json: () => 'serverData',
          headers: { get: () => 'application/json' },
        }))
      )
      expect(data).toEqual({ provider: 'server', data: 'serverData' })
    })

    it('should return data from the server if on client but is not ready', async () => {
      browserGetter.mockReturnValue(true)
      isClientReady.mockReturnValue(false)

      const data = await resolveData(
        prefix,
        '',
        vi.fn(),
        vi.fn(() => ({
          ok: true,
          json: () => 'serverData',
          headers: { get: () => 'application/json' },
        }))
      )
      expect(data).toEqual({ provider: 'server', data: 'serverData' })
    })

    it('should return a 404 if the server encounters a 404 ', async () => {
      browserGetter.mockReturnValue(false)
      isClientReady.mockReturnValue(false)

      const data = await resolveData(
        prefix,
        '',
        vi.fn(),
        vi.fn(() => ({ ok: false, status: 404 }))
      )
      expect(data).toEqual({ provider: 'server', error: 'NOT_FOUND', data: null })
    })

    it('should return empty data if the server encounters an error ', async () => {
      browserGetter.mockReturnValue(false)
      isClientReady.mockReturnValue(false)

      const data = await resolveData(
        prefix,
        '',
        vi.fn(),
        vi.fn(() => ({ ok: false }))
      )
      expect(data).toEqual({ provider: 'static-server', data: null })
    })

    it('should wait for the client if the server gets an error and is running in the browser', async () => {
      browserGetter.mockReturnValue(true)
      isClientReady.mockReturnValue(false)
      waitForClient.mockReturnValue(true)

      const data = await resolveData(
        prefix,
        '',
        () => 'clientData',
        vi.fn(() => ({ ok: false }))
      )
      expect(data).toEqual({ provider: 'static-client', data: 'clientData' })
    })

    it('should return an error if the server and the client data gets an error running in the browser', async () => {
      browserGetter.mockReturnValue(true)
      isClientReady.mockReturnValue(false)
      waitForClient.mockImplementation(() => {
        throw new Error()
      })

      const data = await resolveData(
        prefix,
        '',
        vi.fn(),
        vi.fn(() => ({ ok: false }))
      )
      expect(data).toEqual({ provider: 'static-error', data: null })
    })
  })
})
