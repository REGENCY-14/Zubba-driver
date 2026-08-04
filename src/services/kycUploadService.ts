import { supabase } from './supabaseClient';
import { env } from '../utils/env';

export type KycDocumentKind = 'ghana-card' | 'drivers-license' | 'vehicle' | 'profile';

function getDocPath(userId: string, kind: KycDocumentKind) {
  return `${userId}/${kind}.jpg`;
}

// Mirrors Zubba/src/services/profileImageService.ts's upload pattern, namespaced
// under a driver-docs bucket/path instead of the customer app's avatar bucket.
export async function uploadKycDocument(
  userId: string,
  kind: KycDocumentKind,
  fileUri: string,
): Promise<string> {
  if (!supabase || !env.supabaseDriverDocsBucket) {
    throw new Error('Supabase storage is not configured.');
  }

  const path = getDocPath(userId, kind);
  const response = await fetch(fileUri);
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('Content-Type') ?? 'image/jpeg';

  const { error: uploadError } = await supabase.storage
    .from(env.supabaseDriverDocsBucket)
    .upload(path, arrayBuffer, { upsert: true, contentType });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(env.supabaseDriverDocsBucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
