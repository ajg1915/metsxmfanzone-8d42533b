/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light dark" />
    </Head>
    <Preview>Welcome to MetsXMFanZone — Confirm your email</Preview>
    <Body style={body}>
      <Container style={wrapper}>
        <Section style={logoSection}>
          <Img
            src="https://clwghkbtkofacsjeyrtk.supabase.co/storage/v1/object/public/email-assets/metsxmfanzone-logo.png"
            alt="MetsXMFanZone"
            width="85"
            style={{ borderRadius: '12px', margin: '0 auto' }}
          />
          <div style={brandName}>
            <span style={{ color: '#002D72' }}>Mets</span>
            <span style={{ color: '#FF5910' }}>XM</span>
            <span style={{ color: '#ffffff' }}>FanZone</span>
          </div>
        </Section>
        <Section style={card}>
          <Heading style={h1}>Welcome aboard! 🏟️</Heading>
          <Text style={text}>
            Thanks for joining{' '}
            <Link href={siteUrl} style={link}>
              <strong>MetsXMFanZone</strong>
            </Link>
            — your home for everything Mets!
          </Text>
          <Text style={text}>
            Please confirm your email address ({recipient}) to get started:
          </Text>
          <Button style={button} href={confirmationUrl}>
            Confirm My Email
          </Button>
          <Text style={tagline}>Let's Go Mets! 🧡💙</Text>
        </Section>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
        <Text style={copyright}>
          © {new Date().getFullYear()} <span style={{ color: '#FF5910' }}>MetsXMFanZone</span>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const body = { backgroundColor: '#0a0a0a', margin: '0', padding: '0' }
const wrapper = { maxWidth: '380px', margin: '0 auto', padding: '20px 16px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }
const logoSection = { textAlign: 'center' as const, paddingBottom: '16px' }
const brandName = { textAlign: 'center' as const, fontSize: '18px', fontWeight: 'bold' as const, marginTop: '8px' }
const card = {
  backgroundColor: '#1a1a2e',
  borderRadius: '12px',
  border: '1px solid #2a2a3e',
  padding: '24px 20px',
}
const h1 = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '13px',
  color: '#a0a0a0',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const link = { color: '#FF5910', textDecoration: 'none' }
const button = {
  background: 'linear-gradient(135deg, #FF4500, #FF6A33)',
  backgroundColor: '#FF4500',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'block' as const,
  textAlign: 'center' as const,
  margin: '0 auto 16px',
}
const tagline = { fontSize: '13px', fontWeight: 'bold' as const, color: '#FF5910', textAlign: 'center' as const, margin: '0' }
const footer = { fontSize: '10px', color: '#555', textAlign: 'center' as const, margin: '12px 0 0' }
const copyright = { fontSize: '10px', color: '#444', textAlign: 'center' as const, margin: '8px 0 0' }
