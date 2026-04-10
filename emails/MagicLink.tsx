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

interface MagicLinkProps {
  url: string;
  email: string;
}

export default function MagicLink(props: MagicLinkProps) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
      }}
    >
      <Html>
        <Head />
        <Preview>Your People's Directory sign-in link is ready</Preview>
        <Body className="mx-auto bg-gray-100 px-4 py-10 font-sans">
          <Container className="mx-auto max-w-140 border border-gray-200 bg-white px-0 py-6">
            <Section className="px-2 text-center">
              <Text className="m-0 font-semibold text-gray-900 text-xl">
                Sign in to People Directory
              </Text>
              <Text className="mt-1 mb-0 text-gray-600">
                We received a request to sign in as <strong>{props.email}</strong>.
              </Text>
            </Section>

            <Section className="mt-8 px-2 text-center">
              <Button
                href={props.url}
                className="bg-gray-900 px-4 py-3 font-semibold text-sm text-white"
              >
                Sign in with magic link
              </Button>
            </Section>

            <Section className="mt-8 px-2 text-center">
              <Text className="m-0 text-gray-600 text-sm">
                This link expires in 10 minutes and can only be used once.
              </Text>
              <Text className="mt-1 text-gray-600 text-sm">
                If the button does not work,{' '}
                <Link
                  href={props.url}
                  className="text-blue-700 text-sm underline underline-offset-2"
                >
                  click here
                </Link>{' '}
                to sign in.
              </Text>
            </Section>

            <Hr className="mt-6 mb-0 border-gray-200" />

            <Section className="mt-6 px-2 text-center">
              <Text className="m-0 text-gray-500 text-xs leading-5">
                If you did not request this email, you can safely ignore it.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
