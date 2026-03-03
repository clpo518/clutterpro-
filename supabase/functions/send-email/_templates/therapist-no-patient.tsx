import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TherapistNoPatientEmailProps {
  therapistName?: string
  therapistCode?: string
  dashboardUrl: string
  sessionLiveUrl: string
}

export function TherapistNoPatientEmail(props: TherapistNoPatientEmailProps) {
  const {
    therapistName = 'Dear SLP',
    therapistCode,
    dashboardUrl,
    sessionLiveUrl,
  } = props

  return (
    <BaseLayout preview="You haven't invited a patient yet — here's how to get started.">
      <Heading style={heading}>A quick reminder to get started 👋</Heading>

      <Text style={paragraph}>Hi {therapistName},</Text>

      <Text style={paragraph}>
        It's been a week since you created your Pro account, and you haven't
        invited a patient yet. No worries — here's a quick reminder to help
        you make the most of the tool.
      </Text>

      <Hr style={divider} />

      <Text style={sectionTitle}>🔗 How to invite a patient?</Text>

      <Text style={paragraph}>
        It's simple: share your <strong>Pro Code</strong> with your patients.
        They enter it during signup and are automatically linked to your account.
        You can then access their stats, their recordings, and leave clinical notes.
      </Text>

      {therapistCode && (
        <Text style={codeBox}>
          Your Pro Code: {therapistCode}
        </Text>
      )}

      {therapistCode && (
        <Text style={codeInstruction}>
          Share this code via text, WhatsApp, or on a prescription.
        </Text>
      )}

      <Button style={button} href={dashboardUrl}>
        Access my dashboard
      </Button>

      <Hr style={divider} />

      <Text style={sectionTitle}>🎯 No patients? The tool is still useful!</Text>

      <Text style={paragraph}>
        Even without a patient signed up, you can already:
      </Text>

      <Section style={featureCardHighlight}>
        <Text style={featureCardTitle}>🔬 In-session rate meter</Text>
        <Text style={featureCardDesc}>
          Measure your patients' speech rate live during consultations.
          Select a target and get an objective SPS measurement in real time.
          No patient account needed.
        </Text>
      </Section>

      <Button style={buttonSecondary} href={sessionLiveUrl}>
        Try the In-Session mode
      </Button>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📚 Test 115+ exercises</Text>
        <Text style={featureCardDesc}>
          Browse the full library and test exercises in "Discovery Mode"
          — your tests don't affect any patient statistics.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📊 See the biofeedback</Text>
        <Text style={featureCardDesc}>
          Familiarize yourself with the rate gauge, Van Zaalen norms,
          and the visual feedback your patients will see during practice.
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={paragraph}>
        If you have any questions about how it works, don't hesitate to
        reach out — I'm available and I reply personally.
      </Text>

      <Text style={signatureText}>Talk soon,</Text>
      <Text style={signatureName}>Clement — Founder of ClutterPro</Text>
      <Text style={signatureEmail}>clement@clutterpro.com</Text>
    </BaseLayout>
  )
}

export default TherapistNoPatientEmail

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

const codeBox = {
  backgroundColor: '#2e3346',
  borderRadius: '18px',
  color: '#5ed4c0',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  lineHeight: '28px',
  padding: '24px',
  margin: '16px 0 8px',
  textAlign: 'center' as const,
}

const codeInstruction = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const divider = {
  borderColor: '#e5dfd6',
  margin: '32px 0',
}

const sectionTitle = {
  color: '#2e3346',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  lineHeight: '28px',
  margin: '0 0 16px',
}

const featureCard = {
  backgroundColor: '#f8f6f3',
  border: '1px solid #e5dfd6',
  borderRadius: '18px',
  padding: '16px 20px',
  marginBottom: '12px',
}

const featureCardHighlight = {
  backgroundColor: '#eef7f5',
  border: '2px solid #3a9e8e',
  borderRadius: '18px',
  padding: '16px 20px',
  marginBottom: '12px',
}

const featureCardTitle = {
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 6px',
}

const featureCardDesc = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#2e3346',
  margin: '0',
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

const buttonSecondary = {
  backgroundColor: '#2e3346',
  borderRadius: '18px',
  color: '#fff',
  display: 'block',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '12px 24px',
  margin: '20px auto',
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
  margin: '0 0 2px',
}

const signatureEmail = {
  color: '#6e7282',
  fontSize: '13px',
  lineHeight: '18px',
  margin: '0 0 16px',
}
