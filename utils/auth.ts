async function sendVerificationRequest({identifier, url}: SendVerificationRequestParams) {
  const email = schema.shape.email.parse(identifier);
  const html = await render(<MagicLink url={url} email={email} />);

  const transport = nodemailer.createTransport({
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  });

  await transport.sendMail({
    subject: 'Sign in to People Directory',
    from: 'People Directory <noreply@peopledirectory.org>',
    to: email,
    html,
  });
}
