import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Heading,
  Img,
} from '@react-email/components'
import React from 'react'

export function NewsletterSlpV1Email() {
  return (
    <Html>
      <Head />
      <Preview>☕ Behind the scenes at ClutterPro — Updates, coffee, and late nights</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>🎙️ ClutterPro</Text>
            <Text style={editionText}>Newsletter #1 — February 2026</Text>
          </Section>

          <Section style={content}>
            {/* Intro */}
            <Heading as="h1" style={h1}>Behind the scenes at ClutterPro ☕</Heading>

            <Text style={text}>
              Hello,
            </Text>

            <Text style={text}>
              First and foremost: <strong>thank you</strong>. Thank you for your feedback via email, text, video calls...
              The enthusiasm around the app means the world to me. Every message from an SLP
              who says "<em>this is exactly what I was missing</em>" gives me the energy to keep going.
            </Text>

            <Hr style={hr} />

            {/* Who am I */}
            <Heading as="h2" style={h2}>Who's behind all this? 👋</Heading>

            <Section style={founderSection}>
              <Img
                src="https://lllzwnffmdicoqqxqmeh.supabase.co/storage/v1/object/public/email-assets/clement-founder.jpg?v=2"
                alt="Clement Pontegnier, founder of ClutterPro"
                width="120"
                height="120"
                style={founderImg}
              />
              <Text style={text}>
                My name is <strong>Clement</strong>, I'm 36 and I live in Annecy, France 🏔️.
                As a former clutterer, I saw my SLP Audrey in 2022 — and I
                realized that between sessions, I had <strong>zero tools</strong> to practice.
              </Text>
            </Section>

            <Text style={text}>
              I first coded a small prototype for myself. Then Audrey tested it with other patients.
              And I thought: "<em>if it helps me, it could help everyone</em>." 😊
            </Text>

            <Text style={text}>
              Result: I spend my evenings and weekends building ClutterPro.
              Just me, my keyboard, and way too much coffee. ☕
            </Text>

            <Hr style={hr} />

            {/* What's new */}
            <Heading as="h2" style={h2}>What's changed in recent weeks 🚀</Heading>

            <Text style={statsLine}>
              <em>(35 coffees, 2 all-nighters, and 1 keyboard on its last legs)</em>
            </Text>

            <Section style={featureCard}>
              <Text style={featureTitle}>👶 Kids Mode — Short sentences illustrated with emojis</Text>
              <Text style={featureDesc}>
                The patient reads or listens to short, fun sentences illustrated with emojis.
                For example: 🐱 + 🎹 = "<em>The cat plays the piano</em>." They say the sentence,
                and we measure their rate in real time. Fun, visual, perfect from age 6. 🎨
              </Text>
            </Section>

            <Section style={featureCard}>
              <Text style={featureTitle}>🧑‍🎓 Teen Mode — Topics they actually care about</Text>
              <Text style={featureDesc}>
                No more boring texts: here, teens talk about <strong>their topics</strong>.
                The big game, first day of high school, convincing parents to go out, ordering
                at a fast-food place, explaining being late to a teacher... Real-life situations that trigger
                spontaneous speech. With automatic calibration to Van Zaalen norms (4.2 SPS child, 5.0 teen/adult).
              </Text>
            </Section>

            <Section style={featureCardHighlight}>
              <Text style={featureTitle}>💬 Dialogue Mode — Free speech, finally measured</Text>
              <Text style={featureDesc}>
                This is <strong>the key tool for transfer</strong>. Your patient speaks freely, no script,
                with real-time visual feedback on their rate. No more "read this text" — time for real life.
                We finally measure spontaneous speech. 🎯
              </Text>
            </Section>

            <Section style={featureCardHighlight}>
              <Text style={featureTitle}>🔬 In-Session Mode — Your pocket rate meter</Text>
              <Text style={featureDesc}>
                Measure your patient's rate <strong>live, during the consultation</strong>.
                Full-screen interface, zero distractions. You choose the duration (1, 2, 5, or 10 min)
                and the data is automatically saved to the patient's account.
                A true clinical measurement instrument. 📊
              </Text>
            </Section>

            <Section style={featureCard}>
              <Text style={featureTitle}>📖 Retelling Mode — Inspired by Van Zaalen</Text>
              <Text style={featureDesc}>
                Know Van Zaalen's wallet story? I created <strong>20 similar stories</strong>.
                The patient listens to a story, then retells it in their own words. The algorithm automatically
                detects whether they were <strong>concise</strong> and whether the <strong>4 key points</strong> are present.
                Yes, all of that happens automatically. 🤯
              </Text>
            </Section>

            <Section style={featureCard}>
              <Text style={featureTitle}>🏠 SLP Dashboard — Test everything, no limits</Text>
              <Text style={featureDesc}>
                From your dashboard, you now have a <strong>complete view of all your patients' exercises</strong>.
                And most importantly: you can test them yourself, as many times as you want.
                Ideal for preparing a session or discovering a new mode. 🧪
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Link href="https://www.clutterpro.com/auth" style={ctaButton}>
                Discover what's new →
              </Link>
            </Section>

            <Hr style={hr} />

            {/* SPS Calculation */}
            <Heading as="h2" style={h2}>Under the hood: new rate calculation 🧮</Heading>

            <Text style={text}>
              We've <strong>completely reworked</strong> the speech rate measurement system.
              Instead of word-by-word feedback (unstable and frustrating), we now work
              in <strong>5-syllable chunks</strong>.
            </Text>

            <Text style={text}>
              In practice: as soon as the patient says 5 syllables, the gauge updates.
              The visual feedback is <strong>stable, responsive, and much more reliable</strong> —
              no more gauges jumping all over the place.
            </Text>

            <Text style={text}>
              If you use Van Zaalen norms, you'll feel right at home.
              Level 4 = 4.0 SPS, Level 5 = 5.0 SPS, etc. Simple and clear.
            </Text>

            <Hr style={hr} />

            {/* CTA - Word of mouth */}
            <Heading as="h2" style={h2}>A little help? 🙏</Heading>

            <Text style={text}>
              If you enjoy the app and know colleagues who might be
              interested, <strong>a word from you would make a huge difference</strong>.
              Word of mouth between SLPs is our best channel. 💛
            </Text>

            <Text style={text}>
              And if you have questions, ideas, or just want to chat:
            </Text>

            <Section style={contactCard}>
              <Text style={contactText}>
                📧 <Link href="mailto:support@clutterpro.com" style={link}>support@clutterpro.com</Link>
              </Text>
              <Text style={contactText}>
                📅 Want a 15-min video call? Just email me, I'm always available.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Closing */}
            <Text style={text}>
              Thank you so much for your trust. This project exists and keeps
              moving forward because of you. You're the first to believe in this tool —
              and that's priceless.
            </Text>

            <Text style={text}>
              Talk soon,
            </Text>

            <Text style={signature}>
              Clement Pontegnier<br />
              <em>Founder of ClutterPro — Former clutterer, still a talker 😄</em><br />
              <em>Annecy, France 🏔️</em>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} ClutterPro. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="https://www.clutterpro.com" style={footerLink}>www.clutterpro.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default NewsletterSlpV1Email

const main = {
  backgroundColor: '#f8f6f3',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '18px',
  overflow: 'hidden' as const,
}

const header = {
  padding: '32px 32px 24px',
  backgroundColor: '#3a9e8e',
  textAlign: 'center' as const,
}

const logoText = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  margin: '0 0 4px',
}

const editionText = {
  fontSize: '13px',
  color: '#c8ebe4',
  margin: '0',
}

const content = {
  padding: '32px',
}

const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 24px',
  lineHeight: '1.3',
}

const h2 = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 12px',
}

const text = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#2e3346',
  margin: '0 0 16px',
}

const statsLine = {
  fontSize: '14px',
  color: '#6e7282',
  margin: '0 0 20px',
  lineHeight: '1.5',
}

const hr = {
  borderColor: '#e5dfd6',
  margin: '28px 0',
}

const founderSection = {
  textAlign: 'center' as const,
  marginBottom: '8px',
}

const founderImg = {
  borderRadius: '50%',
  objectFit: 'cover' as const,
  margin: '0 auto 16px',
  display: 'block' as const,
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

const featureTitle = {
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 6px',
}

const featureDesc = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#2e3346',
  margin: '0',
}

const contactCard = {
  backgroundColor: '#eef7f5',
  border: '1px solid #b5ddd5',
  borderRadius: '18px',
  padding: '16px 20px',
}

const contactText = {
  fontSize: '14px',
  lineHeight: '1.8',
  color: '#2e3346',
  margin: '0',
}

const link = {
  color: '#3a9e8e',
  textDecoration: 'underline',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '28px 0 0',
}

const ctaButton = {
  backgroundColor: '#3a9e8e',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '18px',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}

const signature = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#2e3346',
  margin: '0',
}

const footer = {
  padding: '24px 32px',
  borderTop: '1px solid #e5dfd6',
  backgroundColor: '#f8f6f3',
}

const footerText = {
  color: '#6e7282',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 4px',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#3a9e8e',
  textDecoration: 'underline',
}
