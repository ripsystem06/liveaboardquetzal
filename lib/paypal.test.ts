import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAccessToken, createPayPalOrder, capturePayPalOrder } from './paypal'

const fetchMock = vi.fn()

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: () => Promise.resolve(body) } as unknown as Response
}

describe('lib/paypal', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('PAYPAL_CLIENT_ID', 'test-client-id')
    vi.stubEnv('PAYPAL_CLIENT_SECRET', 'test-client-secret')
    vi.stubEnv('PAYPAL_ENV', 'sandbox')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  describe('getAccessToken', () => {
    it('returns the access token and requests it with Basic client credentials', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ access_token: 'A21AA-Token', token_type: 'Bearer', expires_in: 32400 })
      )

      const token = await getAccessToken()

      expect(token).toBe('A21AA-Token')
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe('https://api-m.sandbox.paypal.com/v1/oauth2/token')
      expect(init.method).toBe('POST')
      expect(init.body).toBe('grant_type=client_credentials')
      expect(init.headers.Authorization).toBe(
        `Basic ${btoa('test-client-id:test-client-secret')}`
      )
    })

    it('throws a descriptive error when PayPal credentials are missing', async () => {
      vi.stubEnv('PAYPAL_CLIENT_ID', '')

      await expect(getAccessToken()).rejects.toThrow(/PAYPAL_CLIENT_ID/)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('throws when the OAuth request fails', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'invalid_client' }, false, 401))

      await expect(getAccessToken()).rejects.toThrow(/OAuth/i)
    })
  })

  describe('createPayPalOrder', () => {
    it('creates a CAPTURE order with a two-decimal USD value derived from the whole-dollar amount', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(jsonResponse({ id: 'ORDER-9400' }))

      const order = await createPayPalOrder({ amountUsd: 9400, referenceId: 'res_1' })

      expect(order.id).toBe('ORDER-9400')
      expect(fetchMock).toHaveBeenCalledTimes(2)
      const [url, init] = fetchMock.mock.calls[1]
      expect(url).toBe('https://api-m.sandbox.paypal.com/v2/checkout/orders')
      expect(init.method).toBe('POST')
      expect(init.headers.Authorization).toBe('Bearer tok')
      const body = JSON.parse(init.body)
      expect(body.intent).toBe('CAPTURE')
      expect(body.purchase_units[0].reference_id).toBe('res_1')
      expect(body.purchase_units[0].amount).toEqual({ currency_code: 'USD', value: '9400.00' })
    })

    it('formats a different whole-dollar amount to two decimals (toFixed(2))', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(jsonResponse({ id: 'ORDER-100' }))

      await createPayPalOrder({ amountUsd: 100, referenceId: 'res_2' })

      const body = JSON.parse(fetchMock.mock.calls[1][1].body)
      expect(body.purchase_units[0].amount.value).toBe('100.00')
    })

    it('throws when order creation fails', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(jsonResponse({ error: 'bad' }, false, 422))

      await expect(createPayPalOrder({ amountUsd: 100 })).rejects.toThrow(/create order/i)
    })
  })

  describe('capturePayPalOrder', () => {
    it('returns the capture response when status is COMPLETED', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(jsonResponse({ id: 'ORDER-9400', status: 'COMPLETED' }))

      const result = await capturePayPalOrder('ORDER-9400')

      expect(result.status).toBe('COMPLETED')
      expect(fetchMock).toHaveBeenCalledTimes(2)
      const [url, init] = fetchMock.mock.calls[1]
      expect(url).toBe('https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-9400/capture')
      expect(init.method).toBe('POST')
    })

    it('throws when the captured status is not COMPLETED', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(jsonResponse({ id: 'ORDER-9400', status: 'PENDING' }))

      await expect(capturePayPalOrder('ORDER-9400')).rejects.toThrow(/COMPLETED/)
    })

    it('throws when the capture HTTP request fails', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ access_token: 'tok' }))
        .mockResolvedValueOnce(jsonResponse({ error: 'unprocessable' }, false, 422))

      await expect(capturePayPalOrder('ORDER-9400')).rejects.toThrow()
    })
  })
})
