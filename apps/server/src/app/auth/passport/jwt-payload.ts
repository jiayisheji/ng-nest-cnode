export interface JwtPayload {
  /** jwt所面向的用户 */
  sub: string;
  /** jwt签发时间 */
  iat?: number;
  /** jwt的过期时间 这个时间必须要大于签发的时间 */
  exp?: number;
  /** jwt的唯一身份标识，主要用来作为一次性的 token 放攻击 */
  jti?: string;
}
