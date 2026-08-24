'use client'

/**
 * Client-side Stripe confirm helper.
 *
 * Loads Stripe.js exactly once and confirms a PaymentIntent using the
 * `clientSecret` returned by `POST /api/stripe/create-payment-intent`. The app
 * never collects or handles raw card details: `redirect: 'always'` sends the
 * customer to Stripe's hosted confirmation page, then back to `returnUrl`.
 *
 * The server-side webhook remains the authoritative validation source — this
 * helper only starts the payment; it never marks anything paid.
 */

interface ConfirmPaymentResult {
  error?: { message?: string }
}

interface StripeInstance {
  confirmPayment: (options: {
    clientSecret: string
    confirmParams: { return_url: string }
    redirect: 'always'
  }) => Promise<ConfirmPaymentResult>
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance
  }
}

const STRIPE_JS_URL = 'https://js.stripe.com/v3/'

let stripePromise: Promise<StripeInstance | null> | null = null

function loadStripe(publishableKey: string): Promise<StripeInstance | null> {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (!publishableKey) return Promise.resolve(null)

  if (window.Stripe) return Promise.resolve(window.Stripe(publishableKey))

  if (!stripePromise) {
    stripePromise = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = STRIPE_JS_URL
      script.async = true
      script.onload = () => resolve(window.Stripe ? window.Stripe(publishableKey) : null)
      script.onerror = () => resolve(null)
      document.head.appendChild(script)
    })
  }
  return stripePromise
}

/**
 * Confirms a Stripe PaymentIntent using the hosted confirmation page.
 * Returns an error message on failure, or `null` when the confirmation was
 * handed off to Stripe (the customer is redirected).
 */
export async function confirmCardPayment(
  clientSecret: string,
  returnUrl: string,
): Promise<string | null> {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) return 'Stripe is not configured'

  const stripe = await loadStripe(publishableKey)
  if (!stripe) return 'Stripe could not be loaded'

  const result = await stripe.confirmPayment({
    clientSecret,
    confirmParams: { return_url: returnUrl },
    redirect: 'always',
  })
  return result.error?.message ?? null
}
