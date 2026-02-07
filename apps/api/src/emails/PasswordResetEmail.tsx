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
import { t, type Language } from '@dental/shared'

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

interface PasswordResetEmailProps {
  firstName: string
  resetUrl: string
  expiresInMinutes: number
  language?: Language
}

export function PasswordResetEmail({
  firstName,
  resetUrl,
  expiresInMinutes,
  language = 'es',
}: PasswordResetEmailProps) {
  // Escape user-provided values to prevent XSS
  const safeFirstName = escapeHtml(firstName)
  const previewText = t(language, 'email.passwordReset.preview')

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{t(language, 'email.passwordReset.heading')}</Heading>

          <Text style={paragraph}>{t(language, 'email.passwordReset.greeting', { firstName: safeFirstName })}</Text>

          <Text style={paragraph}>{t(language, 'email.passwordReset.message')}</Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              {t(language, 'email.passwordReset.buttonText')}
            </Button>
          </Section>

          <Text style={warningText}>
            {t(language, 'email.passwordReset.expiryWarning', {
              minutes: expiresInMinutes,
            })}
          </Text>

          <Hr style={hr} />

          <Text style={securityText}>{t(language, 'email.passwordReset.securityNotice')}</Text>

          <Text style={footer}>{t(language, 'email.passwordReset.signature')}</Text>

          <Hr style={hr} />

          <Text style={footerLinks}>{t(language, 'email.passwordReset.linkInstructions')}</Text>
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
  backgroundColor: '#9333ea',
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
