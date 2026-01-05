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

interface WelcomeEmailProps {
  firstName: string
  clinicName: string
  loginUrl: string
}

export function WelcomeEmail({ firstName, clinicName, loginUrl }: WelcomeEmailProps) {
  const previewText = `Welcome to Dental SaaS! Your clinic "${clinicName}" is ready.`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>🦷 Welcome to Dental SaaS!</Heading>

          <Text style={paragraph}>Hi {firstName},</Text>

          <Text style={paragraph}>
            Thank you for registering <strong>{clinicName}</strong> with Dental SaaS.
            Your clinic management system is now ready to use!
          </Text>

          <Text style={paragraph}>
            As the clinic owner, you can now:
          </Text>

          <ul style={list}>
            <li>Add doctors and staff members</li>
            <li>Manage patient records</li>
            <li>Schedule appointments</li>
            <li>Track lab works and expenses</li>
            <li>Generate reports and analytics</li>
          </ul>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Go to your clinic dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            If you have any questions, reply to this email or contact our support team.
          </Text>

          <Text style={footer}>
            — The Dental SaaS Team
          </Text>

          <Hr style={hr} />

          <Text style={footerLinks}>
            <Link href={loginUrl} style={link}>
              Go to Dashboard
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
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '580px',
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  margin: '0 0 30px',
  color: '#1a1a1a',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
  margin: '0 0 16px',
}

const list = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
  margin: '0 0 24px',
  paddingLeft: '24px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
}

const footer = {
  fontSize: '14px',
  color: '#8898aa',
  margin: '0 0 8px',
}

const footerLinks = {
  fontSize: '12px',
  color: '#8898aa',
  textAlign: 'center' as const,
  margin: '16px 0 0',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}
