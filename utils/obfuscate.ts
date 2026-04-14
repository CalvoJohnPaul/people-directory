export function obfuscateEmail(email: string): string {
  const [username, domain] = email.split('@');
  return username.length <= 5
    ? `${username.charAt(1)}***${username.charAt(-1)}@${domain}`
    : `${username.slice(0, 3)}*****${username.slice(-2)}@${domain}`;
}

export function obfuscateMobileNumber(mobileNumber: string): string {
  return `${mobileNumber.slice(0, 5)}*****${mobileNumber.slice(-2)}`;
}
