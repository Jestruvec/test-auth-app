export const maskEmail = (email: string): string => {
  if (!email) return "";

  const [localPart, domain] = email.split("@");
  if (!domain) return email;

  const visibleChars = Math.min(1, localPart.length);
  const masked = localPart.slice(0, visibleChars) + "***";

  return `${masked}@${domain}`;
};
