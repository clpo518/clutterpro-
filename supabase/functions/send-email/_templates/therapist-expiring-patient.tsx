import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TherapistExpiringPatientEmailProps {
  patientName?: string
  therapistName?: string
  daysRemaining: number
}

export function TherapistExpiringPatientEmail(props: TherapistExpiringPatientEmailProps) {
  const { patientName = 'Hi there', therapistName = 'your SLP', daysRemaining } = props

  return (
    <BaseLayout preview={`Your access to ClutterPro is at stake`}>
      <Heading style={heading}>
        ⚠️ Your access ends in {daysRemaining} day{daysRemaining > 1 ? 's' : ''}
      </Heading>

      <Text style={paragraph}>Hi {patientName},</Text>

      <Text style={paragraph}>
        {therapistName}'s ClutterPro subscription expires in {daysRemaining} day{daysRemaining > 1 ? 's' : ''}.
      </Text>

      <Text style={warningBox}>
        🔒 Without renewal, you'll lose access to your exercises, session history, and progress tracking. All your data will be preserved but inaccessible.
      </Text>

      <Text style={paragraph}>
        <strong>What can you do?</strong>
      </Text>

      <Text style={actionBox}>
        📞 Contact {therapistName} to let them know. A simple message is enough:
      </Text>

      <Text style={scriptBox}>
        "Hi, I just received a message from ClutterPro saying my access is about to expire. Would it be possible to renew your subscription so I can continue my exercises? Thank you!"
      </Text>

      <Text style={reassuranceBox}>
        💾 Rest assured: Your data (sessions, progress, exercises) is saved and will be immediately accessible as soon as your SLP renews their subscription.
      </Text>

      <Text style={paragraph}>
        <strong>Want to continue on your own?</strong>
      </Text>

      <Text style={paragraph}>
        You can also switch to <strong>Solo Mode</strong> and continue your exercises independently, with a 7-day free trial. Simply go to your Settings and choose "Switch to solo mode."
      </Text>

      <Button style={autonomeButton} href="https://www.clutterpro.com/settings">
        Continue in Solo Mode →
      </Button>

      <Text style={smallText}>
        This message is sent automatically to help you continue your progress. Questions? Email us at support@clutterpro.com.
      </Text>
    </BaseLayout>
  )
}

export default TherapistExpiringPatientEmail

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

const actionBox = {
  color: '#2e3346',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const scriptBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '15px',
  fontStyle: 'italic' as const,
  lineHeight: '24px',
  padding: '16px 20px',
  margin: '12px 0 24px',
}

const reassuranceBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '16px',
  margin: '24px 0',
}

const autonomeButton = {
  backgroundColor: '#3a9e8e',
  borderRadius: '18px',
  color: '#ffffff',
  display: 'inline-block' as const,
  fontSize: '16px',
  fontWeight: 'bold' as const,
  padding: '14px 28px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  margin: '8px 0 24px',
}

const smallText = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
}
