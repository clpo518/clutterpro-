import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface PaymentFailedEmailProps {
  userName?: string
  updatePaymentUrl: string
}

export function PaymentFailedEmail(props: PaymentFailedEmailProps) {
  const { userName = 'Dear user', updatePaymentUrl } = props
  return (
    <BaseLayout preview="Action required: your payment has failed">
      <Heading style={heading}>⚠️ Your payment has failed</Heading>

      <Text style={paragraph}>Hi {userName},</Text>

      <Text style={paragraph}>
        We were unable to process your latest payment for your ClutterPro subscription.
      </Text>

      <Text style={paragraph}>
        To continue enjoying all premium features, please update your payment information.
      </Text>

      <Button style={button} href={updatePaymentUrl}>
        Update my payment method
      </Button>

      <Text style={smallText}>
        If you believe this is an error, contact us at support@clutterpro.com
      </Text>
    </BaseLayout>
  )
}

export default PaymentFailedEmail

const heading = {
  color: '#cd4540',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#2e3346',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 18px',
}

const button = {
  backgroundColor: '#3a9e8e',
  borderRadius: '18px',
  color: '#fff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '14px 28px',
  margin: '28px auto',
}

const smallText = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
}
