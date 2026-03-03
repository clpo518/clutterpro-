import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TrialExpiringEmailProps {
  therapistName?: string
  daysRemaining: number
  patientsCount: number
  subscribeUrl: string
  referralCode?: string
}

export function TrialExpiringEmail(props: TrialExpiringEmailProps) {
  const { therapistName = 'Dear SLP', daysRemaining, patientsCount, subscribeUrl, referralCode } = props

  const referralUrl = referralCode
    ? `https://clutterpro.com/pro?ref=${referralCode}`
    : null;

  return (
    <BaseLayout preview={`Your trial ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`}>
      <Heading style={heading}>
        ⏰ Your trial ends in {daysRemaining} day{daysRemaining > 1 ? 's' : ''}
      </Heading>

      <Text style={paragraph}>Hi {therapistName},</Text>

      <Text style={paragraph}>
        Your free trial of ClutterPro for SLPs expires in {daysRemaining} day{daysRemaining > 1 ? 's' : ''}.
      </Text>

      {patientsCount > 0 && (
        <Text style={warningBox}>
          ⚠️ Important: You currently have {patientsCount} active patient{patientsCount > 1 ? 's' : ''}. Without a subscription, you won't be able to access their data or assign exercises.
        </Text>
      )}

      <Text style={benefitsBox}>
        ✨ With ClutterPro for SLPs: Unlimited patient tracking, advanced clinical metrics, PDF report generation, personalized exercise assignments, and priority support.
      </Text>

      <Text style={testimonialBox}>
        💬 "Well designed and easy to use. This is truly the tool I was missing to objectively measure speech rate." — SLP
      </Text>

      <Button style={button} href={subscribeUrl}>
        Subscribe now
      </Button>

      {referralCode && referralUrl && (
        <Text style={referralBox}>
          💡 Referral tip: Recommend ClutterPro to a colleague and both get 1 free month! Simply share this link: {referralUrl} — Your code: {referralCode}
        </Text>
      )}

      <Text style={smallText}>
        Questions about our plans? Email us at support@clutterpro.com — we'd be happy to help.
      </Text>
    </BaseLayout>
  )
}

export default TrialExpiringEmail

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

const warningBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '18px',
  borderLeft: '4px solid #cd4540',
  color: '#b91c1c',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}

const benefitsBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '16px',
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

const smallText = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
}

const testimonialBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '15px',
  fontStyle: 'italic' as const,
  lineHeight: '24px',
  padding: '16px 20px',
  margin: '24px 0',
}
