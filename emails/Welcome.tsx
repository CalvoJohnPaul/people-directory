import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface WelcomeProps {
  name: string;
  redirectUrl: string;
}

export default function Welcome(props: WelcomeProps) {
  const {name, redirectUrl} = Object.assign(
    {name: 'John', redirectUrl: 'https://dummy.com/login'},
    props,
  );

  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
      }}
    >
      <Html>
        <Head />
        <Preview>Thanks for creating your People Directory account</Preview>
        <Body className="mx-auto bg-neutral-100 px-4 py-10 font-sans">
          <Container className="mx-auto max-w-140 border border-neutral-200 bg-white px-0 py-6">
            <Section className="px-2 text-center">
              <Text className="m-0 font-semibold text-neutral-900 text-xl">Welcome aboard</Text>
              <Text className="mt-1 mb-0 text-neutral-600">
                Hi <strong>{name}</strong>, thank you for creating your People Directory account.
              </Text>
              <Text className="m-0 text-neutral-600 text-sm">
                You can now browse people you know, update your profile, and complete profile
                verification for full access.
              </Text>
            </Section>

            <Section className="mt-8 px-2 text-center">
              <Button
                href={redirectUrl}
                className="bg-neutral-900 px-4 py-3 font-semibold text-sm text-white"
              >
                Open People Directory
              </Button>
            </Section>
            <Section className="mt-4 px-2 text-center">
              <Text className="mt-0 text-neutral-600 text-sm">
                If the button does not work,{' '}
                <Link
                  href={redirectUrl}
                  className="text-blue-700 text-sm underline underline-offset-2"
                >
                  click here
                </Link>{' '}
                to open your account.
              </Text>
            </Section>

            <Hr className="mt-6 mb-0 border-neutral-200" />

            <Section className="mt-6 px-2 text-center">
              <Text className="m-0 text-neutral-500 text-xs leading-5">
                If you did not create this account, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
