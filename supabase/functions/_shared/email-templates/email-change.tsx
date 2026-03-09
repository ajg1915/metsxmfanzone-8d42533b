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
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change — MetsXMFanZone</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={logoContainer}>
          <Img
            src="https://clwghkbtkofacsjeyrtk.supabase.co/storage/v1/object/public/email-assets/metsxmfanzone-logo.png"
            alt="MetsXMFanZone"
            width="85"
            height="85"
            style={logo}
          />
        </div>
        <div style={brandHeader}>
          <span style={brandBlue}>Mets</span>
          <span style={brandOrange}>XM</span>
          <span style={brandDark}>FanZone</span>
        </div>
        <Heading style={h1}>Confirm your email change</Heading>
        <Text style={text}>
          You requested to change your MetsXMFanZone email from{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm Email Change
        </Button>
        <Text style={footer}>
          If you didn't request this change, please secure your account immediately.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '420px', margin: '0 auto' }
const logoContainer = { textAlign: 'center' as const, marginBottom: '8px' }
const logo = { borderRadius: '16px' }
const brandHeader = { textAlign: 'center' as const, fontSize: '20px', fontWeight: 'bold' as const, marginBottom: '24px' }
const brandBlue = { color: '#002D72' }
const brandOrange = { color: '#FF4500' }
const brandDark = { color: '#1a1a2e' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#002D72',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const link = { color: '#FF4500', textDecoration: 'underline' }
const button = {
  backgroundColor: '#FF4500',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '10px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'block' as const,
  textAlign: 'center' as const,
  margin: '0 auto 20px',
}
const footer = { fontSize: '11px', color: '#999999', margin: '20px 0 0', textAlign: 'center' as const }
