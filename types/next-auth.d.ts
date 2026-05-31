/**
 * NextAuth type extensions
 * Extends NextAuth types with custom user properties
 */

import type { DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';
import type { UserRole } from './auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      businessId: string;
      role: UserRole;
      emailConfirmed?: boolean;
    };
    accessToken: string;
    refreshToken: string;
    accessTokenExpires?: number;
    error?: string;
    isNewUser?: boolean;
  }

  interface User extends DefaultUser {
    firstName: string;
    lastName: string;
    businessId: string;
    role: UserRole;
    emailConfirmed?: boolean;
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires?: number;
    error?: string;
    isNewUser?: boolean;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      businessId: string;
      role: UserRole;
      emailConfirmed?: boolean;
    };
  }
}