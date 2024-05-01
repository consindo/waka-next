export const replaceSecrets = (secrets: Record<string, string>, config: string) => {
  Object.keys(secrets).forEach((secretKey) => {
    const secret = secrets[secretKey]
    config = config.split(`SECRET.${secretKey}`).join(secret)
  })
  return config
}
