import { z } from 'zod'

// Environment configuration for dLocal
const dLocalConfigSchema = z.object({
  DLOCAL_API_URL: z.string().url().optional(),
  DLOCAL_X_LOGIN: z.string().optional(),
  DLOCAL_X_TRANS_KEY: z.string().optional(),
  DLOCAL_SECRET_KEY: z.string().optional(),
})

const config = dLocalConfigSchema.safeParse(process.env)

export const dLocalConfig = config.success ? config.data : {}

/**
 * Check if dLocal is configured
 */
export function isDLocalConfigured(): boolean {
  return !!(
    dLocalConfig.DLOCAL_API_URL &&
    dLocalConfig.DLOCAL_X_LOGIN &&
    dLocalConfig.DLOCAL_X_TRANS_KEY &&
    dLocalConfig.DLOCAL_SECRET_KEY
  )
}

/**
 * dLocal API integration service
 *
 * This service handles all communication with dLocal payment gateway.
 * Configure the following environment variables to enable:
 *
 * - DLOCAL_API_URL: https://sandbox.dlocal.com (or https://api.dlocal.com for production)
 * - DLOCAL_X_LOGIN: Your X-Login API key
 * - DLOCAL_X_TRANS_KEY: Your transaction key
 * - DLOCAL_SECRET_KEY: Your secret key for signing requests
 *
 * @see https://docs.dlocal.com/
 */
export const DLocalService = {
  /**
   * Create a payment for subscription upgrade
   * @returns Payment URL for redirect or null if dLocal is not configured
   */
  async createPayment(_options: {
    amount: number
    currency: string
    orderId: string
    description: string
    payerEmail: string
    payerName: string
    successUrl: string
    failureUrl: string
    notificationUrl: string
  }): Promise<{ paymentUrl: string; paymentId: string } | null> {
    if (!isDLocalConfigured()) {
      console.warn('dLocal is not configured. Payment creation skipped.')
      return null
    }

    // TODO: Implement actual dLocal API call
    // Reference: https://docs.dlocal.com/reference/payments
    //
    // const response = await fetch(`${dLocalConfig.DLOCAL_API_URL}/payments`, {
    //   method: 'POST',
    //   headers: {
    //     'X-Login': dLocalConfig.DLOCAL_X_LOGIN!,
    //     'X-Trans-Key': dLocalConfig.DLOCAL_X_TRANS_KEY!,
    //     'Authorization': generateSignature(payload),
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     amount: options.amount,
    //     currency: options.currency,
    //     order_id: options.orderId,
    //     description: options.description,
    //     payer: {
    //       email: options.payerEmail,
    //       name: options.payerName,
    //     },
    //     success_url: options.successUrl,
    //     failure_url: options.failureUrl,
    //     notification_url: options.notificationUrl,
    //   }),
    // })

    return null
  },

  /**
   * Verify IPN (Instant Payment Notification) signature
   */
  verifyWebhookSignature(
    _payload: string,
    _signature: string
  ): boolean {
    if (!isDLocalConfigured()) {
      return false
    }

    // TODO: Implement signature verification
    // Reference: https://docs.dlocal.com/reference/signature
    //
    // const crypto = require('crypto')
    // const expectedSignature = crypto
    //   .createHmac('sha256', dLocalConfig.DLOCAL_SECRET_KEY!)
    //   .update(payload)
    //   .digest('hex')
    // return signature === expectedSignature

    return false
  },

  /**
   * Get payment status
   */
  async getPaymentStatus(_paymentId: string): Promise<{
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
    amount: number
    currency: string
  } | null> {
    if (!isDLocalConfigured()) {
      return null
    }

    // TODO: Implement actual dLocal API call
    // Reference: https://docs.dlocal.com/reference/retrieve-a-payment

    return null
  },

  /**
   * Tokenize a card for recurring payments
   * @returns Card token ID or null
   */
  async tokenizeCard(_options: {
    cardNumber: string
    expirationMonth: string
    expirationYear: string
    cvv: string
    holderName: string
    payerEmail: string
  }): Promise<string | null> {
    if (!isDLocalConfigured()) {
      return null
    }

    // TODO: Implement card tokenization
    // This is typically done on the frontend with dLocal.js
    // The backend receives the token and stores it

    return null
  },

  /**
   * Charge a saved card (for recurring subscriptions)
   */
  async chargeCard(_options: {
    cardToken: string
    amount: number
    currency: string
    orderId: string
    description: string
    payerEmail: string
  }): Promise<{
    paymentId: string
    status: string
  } | null> {
    if (!isDLocalConfigured()) {
      console.warn('dLocal is not configured. Card charge skipped.')
      return null
    }

    // TODO: Implement card charge for recurring payments
    // Reference: https://docs.dlocal.com/reference/card-payments

    return null
  },

  /**
   * Refund a payment
   */
  async refundPayment(
    _paymentId: string,
    _amount?: number
  ): Promise<{ refundId: string; status: string } | null> {
    if (!isDLocalConfigured()) {
      return null
    }

    // TODO: Implement refund
    // Reference: https://docs.dlocal.com/reference/refund-a-payment

    return null
  },
}
