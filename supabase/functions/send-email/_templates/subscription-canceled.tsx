import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface SubscriptionCanceledEmailProps {
  userName?: string
  resubscribeUrl: string
}

export function SubscriptionCanceledEmail(props: SubscriptionCanceledEmailProps) {
  const { userName = 'Dear user', resubscribeUrl } = props
  return (
    <BaseLayout preview="Your subscription has been paused. Your data is preserved.">
      <Heading style={heading}>Your subscription is paused</Heading>

      <Text style={paragraph}>Hi {userName},</Text>

      <Text style={paragraph}>
        We confirm that your ClutterPro subscription has been canceled. We respect your decision and thank you for being part of our community.
      </Text>

      <Text style={dataBox}>
        💾 Good news: Your progress data remains saved for 6 months. You can pick up right where you left off if you change your mind.
      </Text>

      <Text style={paragraph}>
        If you'd like to resubscribe someday, your account will be waiting with your full history intact.
      </Text>

      <Button style={button} href={resubscribeUrl}>
        Resubscribe
      </Button>

      <Text style={surveyBox}>
        📝 One last thing: To help us improve, could you tell us in one sentence what you felt was missing?
      </Text>

      <Text style={paragraph}>
        Your feedback means a lot. Email us at support@clutterpro.com
      </Text>

      <Text style={paragraph}>
        Thank you for the time you spent with us, and best of luck on your journey.
      </Text>

      <Text style={signatureText}>With gratitude,</Text>
      <Text style={signatureName}>The ClutterPro Team</Text>
    </BaseLayout>
  )
}

export default SubscriptionCanceledEmail

const heading = {
  color: '#2e3346',
  fontSize: '26px',
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

const dataBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
}

const surveyBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
}

const button = {
  backgroundColor: '#6e7282',
  borderRadius: '18px',
  color: '#fff',
  display: 'block',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '12px 24px',
  margin: '28px auto',
}

const signatureText = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 4px',
}

const signatureName = {
  color: '#3a9e8e',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  lineHeight: '20px',
  margin: '0 0 16px',
}
