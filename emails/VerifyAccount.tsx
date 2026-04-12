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

interface VerifyAccountProps {
  url: string;
  emailAddress: string;
}

export default function VerifyAccount(props: VerifyAccountProps) {
  const {url, emailAddress} = Object.assign(
    {
      url: 'https://dummy.com/verify?token=abc123',
      emailAddress: 'johndoe@dummy.org',
    },
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
        <Preview>Verify your People's Directory account</Preview>
        <Body className="mx-auto bg-gray-100 px-4 py-10 font-sans">
          <Container className="mx-auto max-w-140 border border-gray-200 bg-white px-0 py-6">
            <Section className="px-2 text-center">
              <Text className="m-0 font-semibold text-gray-900 text-xl">Verify your account</Text>
              <Text className="mt-1 mb-0 text-gray-600">
                We received a request to verify the account for <strong>{emailAddress}</strong>.
              </Text>
            </Section>

            <Section className="mt-8 px-2 text-center">
              <Button href={url} className="bg-gray-900 px-4 py-3 font-semibold text-sm text-white">
                Verify account
              </Button>
            </Section>

            <Section className="mt-8 px-2 text-center">
              <Text className="m-0 text-gray-600 text-sm">
                This verification link expires in <strong>30</strong> minutes and can only be used
                once.
              </Text>
              <Text className="mt-1 text-gray-600 text-sm">
                If the button does not work,{' '}
                <Link href={url} className="text-blue-700 text-sm underline underline-offset-2">
                  click here
                </Link>{' '}
                to verify your account.
              </Text>
            </Section>

            <Hr className="mt-6 mb-0 border-gray-200" />

            <Section className="mt-6 px-2 text-center">
              <Text className="m-0 text-gray-500 text-xs leading-5">
                If you did not create an account, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
