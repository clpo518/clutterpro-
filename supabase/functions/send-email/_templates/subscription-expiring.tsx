import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface SubscriptionExpiringEmailProps {
  userName?: string
  expirationDate: string
  renewUrl: string
}

export function SubscriptionExpiringEmail(props: SubscriptionExpiringEmailProps) {
  const { userName = 'Dear user', expirationDate, renewUrl } = props
  return (
    <BaseLayout preview={`Your subscription expires on ${expirationDate}`}>
      <Heading style={heading}>⏰ Your subscription expires soon</Heading>

      <Text style={paragraph}>Hi {userName},</Text>

      <Text style={paragraph}>
        Your ClutterPro subscription expires on {expirationDate}.
      </Text>

      <Text style={paragraph}>
        To continue enjoying all premium features and maintain your progress, please renew your subscription.
      </Text>

      <Text style={statsBox}>
        📊 Your progress matters! Don't lose your training streak and keep improving your speech rate.
      </Text>

      <Button style={button} href={renewUrl}>
        Renew my subscription
      </Button>

      <Text style={smallText}>
        If your subscription is set to auto-renew, you can ignore this email.
      </Text>
    </BaseLayout>
  )
}

export default SubscriptionExpiringEmail

const heading = {
  color: '#e5a122',
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

const statsBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
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
