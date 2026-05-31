/**
 * NextAuth.js configuration
 * Separated from route handler to avoid Next.js App Router issues with non-route exports
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { cookies } from 'next/headers';
import { getApiUrl } from '@/lib/config';
import type { LoginResponse } from '@/types/auth';
import type { Session } from 'next-auth';

export const authOptions: NextAuthConfig = {
  debug: true, // Enable debug logging
  providers: [
    // Primary credentials provider - for email/password login
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('[Authorize-Credentials] Starting authentication for:', credentials?.email);

          const apiUrl = getApiUrl('auth/login');
          console.log('[Authorize-Credentials] Calling backend API:', apiUrl);

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
              rememberMe: true,
            }),
          });

          console.log('[Authorize-Credentials] Backend response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[Authorize-Credentials] Auth failed:', response.status, errorText);
            return null;
          }

          const data: LoginResponse = await response.json();
          console.log('[Authorize-Credentials] Auth successful for user:', data.user.email);

          return {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.firstName} ${data.user.lastName}`,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            businessId: data.user.businessId,
            role: data.user.role,
            emailConfirmed: data.user.emailConfirmed,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error) {
          console.error('[Authorize-Credentials] Exception:', error);
          return null;
        }
      },
    }),
    // Token provider - for establishing session after OTP verification
    CredentialsProvider({
      id: 'token',
      name: 'Token',
      credentials: {
        accessToken: { label: 'Access Token', type: 'text' },
        refreshToken: { label: 'Refresh Token', type: 'text' },
        userId: { label: 'User ID', type: 'text' },
        email: { label: 'Email', type: 'text' },
        firstName: { label: 'First Name', type: 'text' },
        lastName: { label: 'Last Name', type: 'text' },
        businessId: { label: 'Business ID', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        console.log('[Authorize-Token] Establishing session from pre-verified tokens');

        if (!credentials?.accessToken || !credentials?.userId || !credentials?.email) {
          console.error('[Authorize-Token] Missing required credentials');
          return null;
        }

        console.log('[Authorize-Token] Session established for user:', credentials.email);

        return {
          id: credentials.userId as string,
          email: credentials.email as string,
          name: `${credentials.firstName || ''} ${credentials.lastName || ''}`.trim(),
          firstName: credentials.firstName as string,
          lastName: credentials.lastName as string,
          businessId: credentials.businessId as string,
          role: (credentials.role || 'Viewer') as 'Owner' | 'Admin' | 'Manager' | 'Viewer',
          emailConfirmed: true,
          accessToken: credentials.accessToken as string,
          refreshToken: credentials.refreshToken as string,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      authorization: {
        params: {
          tenant: process.env.AZURE_AD_TENANT_ID || 'common',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[SignIn Callback] Called with:', {
        provider: account?.provider,
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile,
        userId: user?.id,
        userEmail: user?.email,
        hasIdToken: !!account?.id_token,
      });
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      console.log('========== JWT CALLBACK INVOKED ==========');
      const userWithToken = user as typeof user & { accessToken?: string; refreshToken?: string; firstName?: string; lastName?: string; businessId?: string; role?: string; emailConfirmed?: boolean };
      console.log('JWT params:', JSON.stringify({ 
        hasUser: !!user, 
        hasAccount: !!account,
        provider: account?.provider,
        trigger,
        userAccessToken: userWithToken?.accessToken ? 'YES' : 'NO',
        existingTokenAccessToken: token?.accessToken ? 'YES' : 'NO'
      }));

      // Credentials sign-in
      if (userWithToken?.accessToken) {
        console.log('[JWT] CREDENTIALS SIGN-IN DETECTED - Copying user data to token');
        token.accessToken = userWithToken.accessToken;
        token.refreshToken = userWithToken.refreshToken;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
        token.user = {
          id: userWithToken.id || '',
          email: userWithToken.email || '',
          firstName: userWithToken.firstName,
          lastName: userWithToken.lastName,
          businessId: userWithToken.businessId,
          role: userWithToken.role,
          emailConfirmed: userWithToken.emailConfirmed,
        };
        console.log('[JWT] Token populated:', { hasAccessToken: !!token.accessToken, businessId: token.user?.businessId });
        return token;
      }
      
      // OAuth - Google
      if (account?.provider === 'google') {
        console.log('[OAuth Google] ===== STARTING GOOGLE OAUTH BACKEND CALL =====');
        const apiUrl = getApiUrl('auth/google/token');
        
        const cookieStore = await cookies();
        const selectedPlan = cookieStore.get('oauthSelectedPlan')?.value;
        
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: account.id_token, selectedPlan }),
          });

          if (response.ok) {
            const data: LoginResponse = await response.json();
            token.accessToken = data.accessToken;
            token.refreshToken = data.refreshToken;
            token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
            token.isNewUser = data.isNewUser ?? false;
            token.user = {
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              businessId: data.user.businessId,
              role: data.user.role,
              emailConfirmed: data.user.emailConfirmed,
            };
            return token;
          } else {
            token.error = 'OAuthBackendError';
            return token;
          }
        } catch (error) {
          console.error('[OAuth Google] Fetch error:', error);
          token.error = 'OAuthBackendError';
          return token;
        }
      }

      // OAuth - Microsoft
      if (account?.provider === 'azure-ad') {
        const apiUrl = getApiUrl('auth/microsoft/token');
        
        const cookieStore = await cookies();
        const selectedPlan = cookieStore.get('oauthSelectedPlan')?.value;
        
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: account.id_token, selectedPlan }),
          });

          if (response.ok) {
            const data: LoginResponse = await response.json();
            token.accessToken = data.accessToken;
            token.refreshToken = data.refreshToken;
            token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
            token.isNewUser = data.isNewUser ?? false;
            token.user = {
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              businessId: data.user.businessId,
              role: data.user.role,
              emailConfirmed: data.user.emailConfirmed,
            };
            return token;
          } else {
            token.error = 'OAuthBackendError';
            return token;
          }
        } catch (error) {
          console.error('[OAuth Microsoft] Fetch error:', error);
          token.error = 'OAuthBackendError';
          return token;
        }
      }

      // Token refresh
      const shouldRefresh = token.accessTokenExpires &&
        Date.now() > (token.accessTokenExpires as number) - 2 * 60 * 1000 &&
        !token.error;

      if (shouldRefresh && token.refreshToken) {
        try {
          const response = await fetch(getApiUrl('auth/refresh'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          });

          if (response.ok) {
            const refreshed = await response.json();
            const { error: _unusedError, ...tokenWithoutError } = token;
            return {
              ...tokenWithoutError,
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken,
              accessTokenExpires: Date.now() + 15 * 60 * 1000,
            };
          } else {
            return { ...token, error: 'RefreshAccessTokenError' };
          }
        } catch (_error) {
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }

      return token;
    },
    async session({ session, token }) {
      console.log('[Session Callback] ===== SESSION CALLBACK START =====');
      
      if (token.error) {
        (session as Session).error = token.error as string;
      }

      if (token.user) {
        (session as Session).user = token.user as Session['user'];
        (session as Session).accessToken = token.accessToken as string;
        (session as Session).refreshToken = token.refreshToken as string;
        (session as Session).accessTokenExpires = token.accessTokenExpires as number;
        (session as Session & { isNewUser?: boolean }).isNewUser = token.isNewUser as boolean | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('[Redirect Callback] url:', url, 'baseUrl:', baseUrl);
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

// Export the NextAuth instance
const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export { handlers, auth, signIn, signOut };
