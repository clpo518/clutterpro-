import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface SubscriptionConfirmedEmailProps {
  userName?: string
  planName: string
  isTherapist?: boolean
  dashboardUrl: string
}

export function SubscriptionConfirmedEmail(props: SubscriptionConfirmedEmailProps) {
  const { userName = 'Dear user', planName, isTherapist, dashboardUrl } = props
  return (
    <BaseLayout preview="Your subscription is active! Welcome.">
      <Heading style={heading}>✅ Subscription activated</Heading>

      <Text style={paragraph}>Hi {userName},</Text>

      <Text style={paragraph}>
        Your <strong>{planName}</strong> subscription is now active. Thank you for your trust!
      </Text>

      {isTherapist ? (
        <Text style={highlightBox}>
          🎯 You can now invite your patients and track their progress in real time. Every exercise generates actionable clinical data.
        </Text>
      ) : (
        <Text style={highlightBox}>
          🎯 You now have access to all exercises and detailed progress tracking. Let's go!
        </Text>
      )}

      <Button style={button} href={dashboardUrl}>
        {isTherapist ? "Access my dashboard" : "Start an exercise"}
      </Button>

      <Text style={smallText}>
        Questions? Email us at support@clutterpro.com
      </Text>

      <Text style={signatureText}>At your service,</Text>
      <Text style={signatureName}>The ClutterPro Team</Text>
    </BaseLayout>
  )
}

export default SubscriptionConfirmedEmail

const heading = {
  color: '#3ab58f',
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

const highlightBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
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
