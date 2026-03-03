import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface FirstWinEmailProps {
  userName?: string
  dashboardUrl: string
}

export function FirstWinEmail(props: FirstWinEmailProps) {
  const { userName = 'Dear user', dashboardUrl } = props
  return (
    <BaseLayout preview="You just took the hardest step.">
      <Heading style={heading}>Way to go! First step complete 🏆</Heading>

      <Text style={paragraph}>Hi {userName},</Text>

      <Text style={celebrationBox}>
        🎉 You just finished your first exercise! That's the hardest step, and you did it.
      </Text>

      <Text style={paragraph}>
        Many people hesitate, postpone, or wait for "the right moment." Not you. You took action, and that's what makes all the difference.
      </Text>

      <Text style={scienceBox}>
        🧠 Did you know? Neuroplasticity works through repetition. Each session strengthens new neural pathways that help you master your speech rate. The key is consistency — even 5 minutes a day.
      </Text>

      <Text style={highlightParagraph}>
        Your next goal: 3 consecutive days. Small, achievable, transformative.
      </Text>

      <Button style={button} href={dashboardUrl}>
        View my progress
      </Button>

      <Text style={tipBox}>
        💡 Tip: Set a daily reminder at a fixed time. Habit is your best ally.
      </Text>

      <Text style={signatureText}>Proud of you,</Text>
      <Text style={signatureName}>The ClutterPro Team</Text>
    </BaseLayout>
  )
}

export default FirstWinEmail

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

const celebrationBox = {
  backgroundColor: '#f9efe5',
  borderRadius: '18px',
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  lineHeight: '26px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const scienceBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  color: '#2a6b62',
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
