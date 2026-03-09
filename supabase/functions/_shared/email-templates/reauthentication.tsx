/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your MetsXMFanZone verification code</Preview>
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
        <Heading style={h1}>Confirm your identity</Heading>
        <Text style={text}>Use the code below to verify it's you:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#FF4500',
  margin: '0 0 30px',
  textAlign: 'center' as const,
  letterSpacing: '4px',
}
const footer = { fontSize: '11px', color: '#999999', margin: '20px 0 0', textAlign: 'center' as const }
