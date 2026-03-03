import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TrialExtendedEmailProps {
  userName: string
  newEndDate: string
  isTherapist?: boolean
  therapistCode?: string
  dashboardUrl: string
}

export function TrialExtendedEmail(props: TrialExtendedEmailProps) {
  const { userName = 'Dear user', newEndDate, isTherapist, therapistCode, dashboardUrl } = props

  return (
    <BaseLayout preview={`Great news: your free access has been extended through ${newEndDate}!`}>
      <Heading style={heading}>Your access has been extended 🎉</Heading>

      <Text style={paragraph}>Hi {userName},</Text>

      <Text style={paragraph}>
        Great news! We've extended your free access to ClutterPro.
      </Text>

      <Text style={highlightBox}>
        📅 Your access is now valid <strong>through {newEndDate}</strong>. All features remain available without any interruption.
      </Text>

      {isTherapist && therapistCode && (
        <Text style={proCodeBox}>
          🔑 Your Pro Code: <strong>{therapistCode}</strong><br />
          Share it with your patients so they can join your tracking dashboard.
        </Text>
      )}

      <Text style={paragraph}>
        Take advantage of this period to {isTherapist
          ? "explore the dashboard, invite your patients, and discover the clinical analysis tools."
          : "continue your exercises and build on your progress at your own pace."
        }
      </Text>

      <Button style={button} href={dashboardUrl}>
        {isTherapist ? 'Access my dashboard' : 'Continue my exercises'}
      </Button>

      <Text style={reassuranceBox}>
        💚 No action required on your part. Your access has been automatically extended.
      </Text>

      <Text style={signatureText}>Talk soon,</Text>
      <Text style={signatureName}>The ClutterPro Team</Text>
    </BaseLayout>
  )
}

export default TrialExtendedEmail

const heading = {
  color: '#3a9e8e',
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
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '20px',
  margin: '24px 0',
}

const proCodeBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
}

const reassuranceBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
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
