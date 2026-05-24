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
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  googleClientId: required("GOOGLE_CLIENT_ID"),
  googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
  nextAuthSecret: required("NEXTAUTH_SECRET"),
  nextAuthUrl: process.env.NEXTAUTH_URL,
  googlePubsubTopic: process.env.GOOGLE_PUBSUB_TOPIC,
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
} as const;
