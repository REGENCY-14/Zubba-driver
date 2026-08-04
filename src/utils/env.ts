import Constants from 'expo-constants';

type AppExtra = {
  apiUrl?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseDriverDocsBucket?: string;
};

function readEnv(key: string, extraKey?: keyof AppExtra): string {
  const fromProcess = process.env[key];
  if (fromProcess) {
    return fromProcess;
  }

  const extra = Constants.expoConfig?.extra as AppExtra | undefined;
  if (extraKey && extra?.[extraKey]) {
    return extra[extraKey]!;
  }

  return '';
}

export const env = {
  apiUrl: readEnv('EXPO_PUBLIC_API_URL', 'apiUrl'),
  supabaseUrl: readEnv('EXPO_PUBLIC_SUPABASE_URL', 'supabaseUrl'),
  supabaseAnonKey: readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'supabaseAnonKey'),
  supabaseDriverDocsBucket: readEnv(
    'EXPO_PUBLIC_SUPABASE_DRIVER_DOCS_BUCKET',
    'supabaseDriverDocsBucket',
  ),
};
