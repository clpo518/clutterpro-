import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface PatientJoinedEmailProps {
  therapistName?: string
  patientName: string
  patientDetailUrl: string
  referralCode?: string
  patientsCount?: number
}

export function PatientJoinedEmail(props: PatientJoinedEmailProps) {
  const { therapistName = 'Dear SLP', patientName, patientDetailUrl, referralCode, patientsCount } = props

  const referralUrl = referralCode
    ? `https://clutterpro.com/pro?ref=${referralCode}`
    : null;

  return (
    <BaseLayout preview={`${patientName} is now connected to your account.`}>
      <Heading style={heading}>New patient connected ✨</Heading>

      <Text style={paragraph}>Hi {therapistName},</Text>

      <Text style={successBox}>
        🎯 {patientName} has just joined your account using your SLP code.
      </Text>

      <Text style={paragraph}>
        Your patient is now ready to receive personalized exercises and start their practice. You can track their progress in real time from your dashboard.
      </Text>

      <Text style={highlightBox}>
        📋 Next step: Assign them a first exercise suited to their level to kick off their practice on the right foot.
      </Text>

      <Button style={button} href={patientDetailUrl}>
        Assign an exercise
      </Button>

      {referralCode && referralUrl && (
        <Text style={referralBox}>
          👥 Your colleagues could benefit too! Share your referral link and get 1 free month for each signup: {referralUrl}
        </Text>
      )}

      <Text style={signatureText}>Happy collaborating,</Text>
      <Text style={signatureName}>The ClutterPro Team</Text>
    </BaseLayout>
  )
}

export default PatientJoinedEmail

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

const successBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  lineHeight: '26px',
  padding: '20px',
  margin: '24px 0',
}

const highlightBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
}

const referralBox = {
  backgroundColor: '#eef7f5',
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
