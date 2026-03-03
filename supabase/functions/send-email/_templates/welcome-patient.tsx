import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface WelcomePatientEmailProps {
  patientName?: string
  therapistName?: string
  appUrl: string
  isSolo?: boolean
  referralCode?: string
}

export function WelcomePatientEmail(props: WelcomePatientEmailProps) {
  const { patientName = 'Dear patient', therapistName, appUrl, isSolo, referralCode } = props
  const referralLink = referralCode ? `https://www.clutterpro.com/auth?tab=signup&ref=${referralCode}` : null
  return (
    <BaseLayout preview="It all starts with one first breath.">
      <Heading style={heading}>Welcome home 🌟</Heading>

      <Text style={paragraph}>Hi {patientName},</Text>

      <Text style={paragraph}>
        You've taken the first step, and that already means a lot. Taking care of your speech takes courage, and we're honored to support you on this journey.
      </Text>

      {therapistName && (
        <Text style={paragraph}>
          {therapistName} has invited you to join ClutterPro. Together, you'll make progress at your own pace, with total peace of mind.
        </Text>
      )}

      {isSolo && (
        <Text style={soloBox}>
          🚀 You've activated a <strong>7-day free trial</strong>. Enjoy all features without limits during this period. If you have an SLP, you can add their Pro Code in Settings at any time.
        </Text>
      )}

      <Text style={reassuranceBox}>
        💚 You're in a safe space. No judgment, no pressure here. Every exercise is designed to help you find your own tempo — the one that feels right for you.
      </Text>

      <Text style={highlightParagraph}>
        Your speech, your pace. That's our philosophy. Progress will come naturally, session after session, at your own rhythm.
      </Text>

      <Button style={button} href={appUrl}>
        Start my first session
      </Button>

      <Text style={tipBox}>
        🎧 Tip: Find a quiet spot for your first session. 5 minutes is all you need to get started.
      </Text>

      {isSolo && referralLink && (
        <Text style={referralBox}>
          🎁 <strong>Spread the word!</strong> Share your invite link with a friend. If they subscribe after their free trial, you both get <strong>1 free month</strong>.<br /><br />
          Your link: <a href={referralLink} style={{ color: '#3a9e8e' }}>{referralLink}</a>
        </Text>
      )}

      <Text style={signatureText}>By your side,</Text>
      <Text style={signatureName}>The ClutterPro Team</Text>
    </BaseLayout>
  )
}

export default WelcomePatientEmail

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

const highlightParagraph = {
  color: '#2e3346',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  lineHeight: '26px',
  margin: '0 0 18px',
}

const reassuranceBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
}

const tipBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}

const soloBox = {
  backgroundColor: '#f9efe5',
  borderRadius: '18px',
  borderLeft: '4px solid #e5a122',
  color: '#92400e',
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

const referralBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px 20px',
  margin: '24px 0',
}
