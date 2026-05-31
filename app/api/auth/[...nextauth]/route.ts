/**
 * NextAuth.js Route Handler
 * IMPORTANT: Only export GET and POST handlers here.
 * Other exports (auth, signIn, signOut) are in @/lib/auth.config.ts
 */

import { handlers } from '@/lib/auth.config';

export const { GET, POST } = handlers;