import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { controleerMigratieBeheer } from './firebase-migratie';

export const backupEnHerstel = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ bevestigd: z.literal(true), kostenBevestigd: z.literal(true) }).strict().parse(input))
  .handler(async ({ context }) => {
    const { data: admin, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    controleerMigratieBeheer(admin, error);
    setResponseHeader('Cache-Control', 'no-store');
    const { maakBackupEnHerstelproef } = await import('./google-herstel.server');
    return maakBackupEnHerstelproef();
  });