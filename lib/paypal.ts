// Server-side PayPal REST integration (raw fetch + OAuth client-credentials).
// This module MUST only run on the server: it reads PAYPAL_CLIENT_SECRET,
// which is never exposed to the client bundle.
//
// The amount sent to PayPal is derived server-side from a whole-dollar Int
// (`amountUsd.toFixed(2)`); client-supplied amounts are never trusted.

const SANDBOX_API = 'https://api-m.sandbox.paypal.com'
const LIVE_API = 'https://api-m.paypal.com'

function paypalApiBase(): string {
  return process.env.PAYPAL_ENV === 'live' ? LIVE_API : SANDBOX_API
}

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      'PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set to use PayPal payments'
    )
  }
  return { clientId, clientSecret }
}

interface PayPalAccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface PayPalCreateOrderResponse {
  id: string
}

export interface PayPalCaptureOrderResponse {
  id: string
  status: string
  [key: string]: unknown
}

export interface PayPalCreateOrderInput {
  /** Whole-dollar amount (Int), converted to a two-decimal string server-side. */
  amountUsd: number
  referenceId?: string
}

/**
 * Exchanges the server-only client id/secret for an OAuth access token.
 * Uses Basic auth (base64 id:secret) with grant_type=client_credentials.
 */
export async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials()
  const auth = btoa(`${clientId}:${clientSecret}`)

  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`PayPal OAuth failed with status ${response.status}`)
  }

  const data = (await response.json()) as PayPalAccessTokenResponse
  return data.access_token
}

/**
 * Creates a CAPTURE-intent PayPal order for a server-derived amount.
 * The amount is sent as a two-decimal USD string (`amountUsd.toFixed(2)`).
 */
export async function createPayPalOrder(
  input: PayPalCreateOrderInput
): Promise<PayPalCreateOrderResponse> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: input.referenceId ?? 'default',
          amount: {
            currency_code: 'USD',
            value: input.amountUsd.toFixed(2),
          },
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`PayPal create order failed with status ${response.status}`)
  }

  return (await response.json()) as PayPalCreateOrderResponse
}

/**
 * Captures an approved PayPal order and verifies it reached COMPLETED.
 * Throws on HTTP failure or when the returned status is not "COMPLETED".
 */
export async function capturePayPalOrder(
  orderId: string
): Promise<PayPalCaptureOrderResponse> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${paypalApiBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`PayPal capture failed with status ${response.status}`)
  }

  const data = (await response.json()) as PayPalCaptureOrderResponse
  if (data.status !== 'COMPLETED') {
    throw new Error(`PayPal capture not COMPLETED (status: ${data.status})`)
  }

  return data
}
