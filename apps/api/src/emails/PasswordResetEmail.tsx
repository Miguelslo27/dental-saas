import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PasswordResetEmailProps {
  firstName: string
  resetUrl: string
  expiresInMinutes: number
}

export function PasswordResetEmail({
  firstName,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailProps) {
  const previewText = 'Reset your Dental SaaS password'

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>🔐 Password Reset Request</Heading>

          <Text style={paragraph}>Hi {firstName},</Text>

          <Text style={paragraph}>
            We received a request to reset your password for your Dental SaaS
            administrator account. Click the button below to set a new password:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>

          <Text style={warningText}>
            ⏱️ This link will expire in <strong>{expiresInMinutes} minutes</strong>.
          </Text>

          <Hr style={hr} />

          <Text style={securityText}>
            🔒 <strong>Security Notice:</strong> If you didn't request this password
            reset, you can safely ignore this email. Your password will remain
            unchanged.
          </Text>

          <Text style={footer}>
            — The Dental SaaS Team
          </Text>

          <Hr style={hr} />

          <Text style={footerLinks}>
            If the button doesn't work, copy and paste this link into your browser:
          </Text>
          <Text style={linkText}>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
}

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1a1a1a',
  textAlign: 'center' as const,
  padding: '17px 0 0',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#3c4149',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const warningText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '16px 0',
}

const securityText = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#6b7280',
  backgroundColor: '#fef3c7',
  padding: '12px 16px',
  borderRadius: '6px',
  margin: '24px 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#6b7280',
  margin: '16px 0',
}

const footerLinks = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#9ca3af',
  margin: '0',
}

const linkText = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#9ca3af',
  margin: '4px 0 0',
  wordBreak: 'break-all' as const,
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}
