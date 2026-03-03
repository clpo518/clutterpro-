import {
  Button,
  Heading,
  Hr,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface AdminWeeklyDigestProps {
  weekStartDate: string
  weekEndDate: string
  totalUsers: number
  newTherapists: number
  newPatients: number
  activeUsers: number
  totalSessions: number
  sessionsThisWeek: number
  payingCount: number
  canceledCount: number
  trialsExpiringSoon: number
  totalTrials: number
  deepgramCostWeek: number
  deepgramCostMonth: number
  deepgramCostTotal: number
  dashboardUrl: string
}

export function AdminWeeklyDigestEmail(props: AdminWeeklyDigestProps) {
  const {
    weekStartDate,
    weekEndDate,
    totalUsers,
    newTherapists,
    newPatients,
    activeUsers,
    totalSessions,
    sessionsThisWeek,
    payingCount,
    canceledCount,
    trialsExpiringSoon,
    totalTrials,
    deepgramCostWeek,
    deepgramCostMonth,
    deepgramCostTotal,
    dashboardUrl,
  } = props

  const newTotal = newTherapists + newPatients

  return (
    <BaseLayout preview={`Admin digest: +${newTotal} signups, ${sessionsThisWeek} sessions, $${deepgramCostWeek} Deepgram`}>
      <Heading style={heading}>🏠 Admin Weekly Digest</Heading>

      <Text style={dateRange}>Week of {weekStartDate} to {weekEndDate}</Text>

      <Text style={paragraph}>
        Here's the weekly summary for ClutterPro.
      </Text>

      <Text style={sectionTitle}>📥 New signups</Text>
      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{newTotal}</Text>
            <Text style={statLabel}>Total</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{newTherapists}</Text>
            <Text style={statLabel}>SLPs</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{newPatients}</Text>
            <Text style={statLabel}>Patients</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      <Text style={sectionTitle}>📊 Activity</Text>
      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{totalUsers}</Text>
            <Text style={statLabel}>Total users</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{activeUsers}</Text>
            <Text style={statLabel}>Active (7d)</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{sessionsThisWeek}</Text>
            <Text style={statLabel}>Sessions wk</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      <Text style={sectionTitle}>💳 Subscriptions</Text>
      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{payingCount}</Text>
            <Text style={statLabel}>Paying</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{totalTrials}</Text>
            <Text style={statLabel}>On trial</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{trialsExpiringSoon}</Text>
            <Text style={statLabel}>Expire &lt;7d</Text>
          </Column>
        </Row>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{canceledCount}</Text>
            <Text style={statLabel}>Canceled</Text>
          </Column>
          <Column style={{ ...statCell, backgroundColor: 'transparent' }} />
          <Column style={{ ...statCell, backgroundColor: 'transparent' }} />
        </Row>
      </Section>

      <Hr style={divider} />

      <Text style={sectionTitle}>💰 Deepgram Costs</Text>
      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>${deepgramCostWeek}</Text>
            <Text style={statLabel}>This wk</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>${deepgramCostMonth}</Text>
            <Text style={statLabel}>This mo</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>${deepgramCostTotal}</Text>
            <Text style={statLabel}>Total</Text>
          </Column>
        </Row>
      </Section>

      <Button style={button} href={dashboardUrl}>
        View full dashboard
      </Button>

      <Text style={footNote}>
        This email is sent automatically every Sunday evening.
      </Text>
    </BaseLayout>
  )
}

export default AdminWeeklyDigestEmail

const heading = {
  color: '#3a9e8e',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0 0 8px',
  padding: '0',
  textAlign: 'center' as const,
}

const dateRange = {
  color: '#6e7282',
  fontSize: '14px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#2e3346',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 18px',
}

const sectionTitle = {
  color: '#2e3346',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  margin: '16px 0 8px',
}

const statsSection = {
  margin: '8px 0',
}

const statCell = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  padding: '12px 8px',
  textAlign: 'center' as const,
  border: '3px solid #ffffff',
}

const statNumber = {
  color: '#3a9e8e',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0',
  lineHeight: '1.2',
}

const statLabel = {
  color: '#6e7282',
  fontSize: '10px',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
}

const divider = {
  borderColor: '#e5dfd6',
  margin: '16px 0',
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

const footNote = {
  color: '#6e7282',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
  fontStyle: 'italic' as const,
}
