export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshOwner {
  userId: string | null;
  platformAdminId: string | null;
}
