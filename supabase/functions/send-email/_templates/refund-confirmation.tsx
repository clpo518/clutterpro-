import {
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface RefundConfirmationEmailProps {
  userName?: string
  refundAmount: string
}

export function RefundConfirmationEmail(props: RefundConfirmationEmailProps) {
  const { userName = 'Dear user', refundAmount } = props
  return (
    <BaseLayout preview="Confirmation of your refund">
      <Heading style={heading}>💳 Refund confirmed</Heading>

      <Text style={paragraph}>Hi {userName},</Text>

      <Text style={paragraph}>
        We confirm that your refund of {refundAmount} has been processed successfully.
      </Text>

      <Text style={infoBox}>
        💡 Note: The refund will appear on your bank statement within 5 to 10 business days depending on your bank.
      </Text>

      <Text style={paragraph}>
        Your premium access has been deactivated. Your progress data remains saved if you'd like to come back later.
      </Text>

      <Text style={paragraph}>
        We hope to see you again on ClutterPro. If you have any questions, email us at support@clutterpro.com
      </Text>

      <Text style={paragraph}>Thank you for using ClutterPro. 🙏</Text>
    </BaseLayout>
  )
}

export default RefundConfirmationEmail

const heading = {
  color: '#2e3346',
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

const infoBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}
