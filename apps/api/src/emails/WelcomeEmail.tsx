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

interface WelcomeEmailProps {
  firstName: string
  clinicName: string
  loginUrl: string
  language?: Language
}

export function WelcomeEmail({ firstName, clinicName, loginUrl, language = 'es' }: WelcomeEmailProps) {
  const previewText = t(language, 'email.welcome.preview', { clinicName })

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{t(language, 'email.welcome.heading')}</Heading>

          <Text style={paragraph}>{t(language, 'email.welcome.greeting', { firstName })}</Text>

          <Text
            style={paragraph}
            dangerouslySetInnerHTML={{
              __html: t(language, 'email.welcome.thankYou', { clinicName }),
            }}
          />

          <Text style={paragraph}>{t(language, 'email.welcome.asOwner')}</Text>

          <ul style={list}>
            <li>{t(language, 'email.welcome.addStaff')}</li>
            <li>{t(language, 'email.welcome.managePatients')}</li>
            <li>{t(language, 'email.welcome.scheduleAppointments')}</li>
            <li>{t(language, 'email.welcome.trackLabworks')}</li>
            <li>{t(language, 'email.welcome.generateReports')}</li>
          </ul>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              {t(language, 'email.welcome.buttonText')}
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>{t(language, 'email.welcome.questions')}</Text>

          <Text style={footer}>{t(language, 'email.welcome.signature')}</Text>

          <Hr style={hr} />

          <Text style={footerLinks}>
            <Link href={loginUrl} style={link}>
              {t(language, 'email.welcome.dashboardLink')}
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
