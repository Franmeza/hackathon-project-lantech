function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  openaiApiKey: required("OPENAI_API_KEY"),
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googlePubsubTopic: process.env.GOOGLE_PUBSUB_TOPIC,
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
} as const;
