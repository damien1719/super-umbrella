declare module 'jose' {
  export function createRemoteJWKSet(url: URL): unknown
  export function jwtVerify(token: string, jwks: unknown, options?: unknown): Promise<{ payload: unknown; protectedHeader: unknown }>
}
