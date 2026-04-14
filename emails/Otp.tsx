import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface OtpProps {
  code: string;
  emailAddress: string;
}

export default function Otp(props: OtpProps) {
  const {code, emailAddress} = Object.assign(
    {
      code: '000000',
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
        <Preview>Your People Directory OTP code is ready</Preview>
        <Body className="mx-auto bg-neutral-100 px-4 py-10 font-sans">
          <Container className="mx-auto max-w-140 border border-neutral-200 bg-white px-0 py-6">
            <Section className="px-2 text-center">
              <Text className="m-0 font-semibold text-neutral-900 text-xl">
                Verify your sign-in
              </Text>
              <Text className="mt-1 mb-0 text-neutral-600">
                We received a request to sign in as <strong>{emailAddress}</strong>.
              </Text>
            </Section>
            <Section className="mt-8 px-2 text-center">
              <Text className="m-0 text-neutral-600 text-sm">Your one-time passcode:</Text>
              <Text className="mt-2 mb-0 font-bold text-4xl text-neutral-900 tracking-widest">
                {code}
              </Text>
            </Section>
            <Section className="mt-8 px-2 text-center">
              <Text className="m-0 text-neutral-600 text-sm">
                This code expires in <strong>10</strong> minutes and can only be used once.
              </Text>
            </Section>
            <Hr className="mt-6 mb-0 border-neutral-200" />
            <Section className="mt-6 px-2 text-center">
              <Text className="m-0 text-neutral-500 text-xs leading-5">
                If you did not request this email, you can safely ignore it.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
