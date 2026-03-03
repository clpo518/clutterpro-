import { Button, Heading, Text } from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface PatientArchivedEmailProps {
  patientName: string
  therapistName: string
  contactEmail?: string
}

export function PatientArchivedEmail({
  patientName,
  therapistName,
  contactEmail,
}: PatientArchivedEmailProps) {
  return (
    <BaseLayout preview="Your follow-up has been paused">
      <Heading style={heading}>
        {patientName}, your follow-up is paused
      </Heading>

      <Text style={paragraph}>
        Hi {patientName},
      </Text>

      <Text style={paragraph}>
        We're letting you know that your follow-up with {therapistName} has been paused.
        This means you no longer have access to exercises and your training history for the time being.
      </Text>

      <Text style={paragraph}>
        Don't worry, your data is preserved! Your progress and statistics
        remain saved and will be available as soon as your follow-up is reactivated.
      </Text>

      <Text style={subheading}>
        How to resume your practice?
      </Text>

      <Text style={paragraph}>
        If you'd like to continue practicing and enjoy all exercises,
        simply contact your SLP {therapistName} to have them reactivate your access.
      </Text>

      {contactEmail && (
        <Button style={button} href={`mailto:${contactEmail}`}>
          Contact my SLP
        </Button>
      )}

      <Text style={paragraph}>
        Questions? Email us at support@clutterpro.com, we're here to help.
      </Text>

      <Text style={signoff}>
        See you soon,
      </Text>
      <Text style={signatureName}>
        The ClutterPro Team
      </Text>
    </BaseLayout>
  )
}

export default PatientArchivedEmail

const heading = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const subheading = {
  fontSize: '18px',
  fontWeight: '600' as const,
  color: '#2e3346',
  marginTop: '24px',
  marginBottom: '12px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#2e3346',
  marginBottom: '16px',
}

const button = {
  backgroundColor: '#3a9e8e',
  borderRadius: '18px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 28px',
  marginTop: '24px',
  marginBottom: '24px',
}

const signoff = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#6e7282',
  margin: '32px 0 4px',
}

const signatureName = {
  fontSize: '14px',
  fontWeight: 'bold' as const,
  color: '#3a9e8e',
  margin: '0',
}
