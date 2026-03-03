import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface B2CTrialExpiringEmailProps {
  patientName?: string
  daysRemaining: number
  subscribeUrl: string
}

export function B2CTrialExpiringEmail(props: B2CTrialExpiringEmailProps) {
  const { patientName = 'Dear user', daysRemaining, subscribeUrl } = props

  return (
    <BaseLayout preview={`Your free trial ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`}>
      <Heading style={heading}>
        ⏰ Only {daysRemaining} day{daysRemaining > 1 ? 's' : ''} left in your trial
      </Heading>

      <Text style={paragraph}>Hi {patientName},</Text>

      <Text style={paragraph}>
        Your 7-day free trial on ClutterPro is coming to an end.
        {daysRemaining <= 1
          ? " This is your last day to enjoy all features."
          : ` You have ${daysRemaining} days left to keep practicing without interruption.`
        }
      </Text>

      <Text style={benefitsBox}>
        ✅ What you keep with a subscription: Full exercise library (60+ exercises), real-time rate measurement, progress charts, and the ability to link an SLP at any time.
      </Text>

      <Text style={priceBox}>
        ☕ Only $9/month — less than two coffees — to continue your journey toward smoother speech.
      </Text>

      <Button style={button} href={subscribeUrl}>
        Continue for $9/month
      </Button>

      <Text style={reassuranceText}>
        💚 Your progress data is preserved. By subscribing, you pick up right where you left off.
      </Text>

      <Text style={alternativeText}>
        💡 Have an SLP? Ask them for their Pro Code and add it in your Settings to switch to a free access included in their subscription.
      </Text>

      <Text style={signatureText}>By your side,</Text>
      <Text style={signatureName}>The ClutterPro Team</Text>
    </BaseLayout>
  )
}

export default B2CTrialExpiringEmail

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

const benefitsBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}

const priceBox = {
  backgroundColor: '#f9efe5',
  borderRadius: '18px',
  borderLeft: '4px solid #e5a122',
  color: '#92400e',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  lineHeight: '24px',
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

const reassuranceText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const alternativeText = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
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
