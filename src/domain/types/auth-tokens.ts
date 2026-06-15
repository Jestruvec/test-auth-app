export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function isTokenExpiringSoon(
  expiresIn: number,
  thresholdSeconds = 300
): boolean {
  return expiresIn <= thresholdSeconds;
}
