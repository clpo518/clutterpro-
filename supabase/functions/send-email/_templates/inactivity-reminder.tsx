import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface InactivityReminderEmailProps {
  userName?: string
  daysSinceLastSession: number
  currentStreak: number
  practiceUrl: string
}

export function InactivityReminderEmail(props: InactivityReminderEmailProps) {
  const { userName = 'Dear user', daysSinceLastSession, currentStreak, practiceUrl } = props
  return (
    <BaseLayout preview={`It's been ${daysSinceLastSession} day${daysSinceLastSession > 1 ? 's' : ''} without practice — get back in 3 minutes.`}>
      <Heading style={heading}>
        It's been {daysSinceLastSession} day{daysSinceLastSession > 1 ? 's' : ''} without practice
      </Heading>

      <Text style={paragraph}>Hi {userName},</Text>

      <Text style={paragraph}>
        Your last session was {daysSinceLastSession} day{daysSinceLastSession > 1 ? 's' : ''} ago.
        Research shows that 5 daily minutes are more effective than one long weekly session — your brain needs repetition to build new habits.
      </Text>

      {currentStreak > 0 && (
        <Text style={paragraph}>
          You have a {currentStreak}-day streak to protect — a 3-minute micro-session is all it takes to keep it going.
        </Text>
      )}

      <Text style={paragraph}>
        Pick up right where you left off: launch an exercise, read a few sentences, and you're done.
      </Text>

      <Button style={button} href={practiceUrl}>
        Resume practice
      </Button>

      <Text style={tip}>
        💡 Tip: Pair your practice with an existing habit — after coffee, during a break, before bed.
      </Text>

      <Text style={signatureName}>The ClutterPro Team</Text>
    </BaseLayout>
  )
}

export default InactivityReminderEmail

const heading = {
  color: '#2e3346',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#2e3346',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const button = {
  backgroundColor: '#3a9e8e',
  borderRadius: '18px',
  color: '#fff',
  display: 'block',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '14px 28px',
  margin: '24px auto',
}

const tip = {
  color: '#6e7282',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '24px 0 0',
}

const signatureName = {
  color: '#3a9e8e',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  margin: '24px 0 0',
}
