import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface WelcomeTherapistEmailProps {
  therapistName?: string
  therapistCode?: string
  referralCode?: string
  dashboardUrl: string
}

export function WelcomeTherapistEmail(props: WelcomeTherapistEmailProps) {
  const { therapistName = 'Dear SLP', therapistCode, referralCode, dashboardUrl } = props

  const referralUrl = referralCode
    ? `https://clutterpro.com/pro?ref=${referralCode}`
    : 'https://clutterpro.com/pro';

  return (
    <BaseLayout preview="Your Pro account is ready — invite your first patient.">
      <Heading style={heading}>Welcome to ClutterPro for SLPs 🎯</Heading>

      <Text style={paragraph}>Hi {therapistName},</Text>

      <Text style={paragraph}>
        Your account is active. Here's everything you need to get started:
      </Text>

      {therapistCode && (
        <Text style={codeBox}>
          Your Pro Code: {therapistCode}
        </Text>
      )}

      {therapistCode && (
        <Text style={codeInstruction}>
          Share this code with your patients to get started. They'll get full access at no cost.
        </Text>
      )}

      <Button style={button} href={dashboardUrl}>
        Invite my first patient
      </Button>

      <Text style={trialBox}>
        🎁 30-day free trial — access to all Pro features.
      </Text>

      <Hr style={divider} />

      <Text style={sectionTitle}>What you can do</Text>

      <Section style={featureCardHighlight}>
        <Text style={featureCardTitle}>🔬 In-session rate meter</Text>
        <Text style={featureCardDesc}>
          Measure your patient's speech rate live during consultations. Full-screen interface, zero distractions. A true clinical measurement tool.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📊 Real-time visual feedback</Text>
        <Text style={featureCardDesc}>
          Your patients see their syllable rate in real time, with Van Zaalen norms as reference.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>🔥 Patients practice between sessions</Text>
        <Text style={featureCardDesc}>
          Streaks, daily goals, badges: gamification motivates your patients to practice regularly, even between appointments.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📚 115+ varied exercises</Text>
        <Text style={featureCardDesc}>
          Reading, breathing, articulation, dialogue, retelling, kid-friendly rebus puzzles... A complete library for every profile.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📄 One-click PDF reports</Text>
        <Text style={featureCardDesc}>
          Generate detailed clinical reports with rate trends, progress curves, and session notes.
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={testimonialBox}>
        💬 "Well designed and easy to use. This is truly the tool I was missing to objectively measure speech rate." — SLP
      </Text>

      {referralCode && (
        <>
          <Hr style={divider} />
          <Text style={referralBox}>
            👥 Referral: Share with your colleagues and each get 1 free month! Code: {referralCode} — {referralUrl}
          </Text>
        </>
      )}

      <Text style={paragraph}>
        Questions? Email us at support@clutterpro.com
      </Text>

      <Text style={signatureText}>At your service,</Text>
      <Text style={signatureName}>The ClutterPro Team</Text>
    </BaseLayout>
  )
}

export default WelcomeTherapistEmail

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

const trialBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '14px',
  lineHeight: '22px',
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
