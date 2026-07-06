/**
 * NextAuth configuration — PRD §3.1 "Social login (Google, LinkedIn, Facebook)"
 *
 * Provides Google, GitHub, LinkedIn, and Facebook OAuth providers.
 *
 * ENV REQUIRED (set any subset — only configure providers you have keys for):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 *   LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
 *   FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET
 *   NEXTAUTH_SECRET  — random 32+ char string (used to sign JWTs)
 *   NEXTAUTH_URL     — e.g. https://marqaitrainers.vercel.app
 *
 * Routes:
 *   /api/auth/signin       — sign-in page
 *   /api/auth/signout      — sign-out
 *   /api/auth/callback/*   — OAuth callbacks
 *   /api/auth/session      — current session
 *
 * Until NEXTAUTH_SECRET is set, this route returns a 503 with setup instructions.
 */

import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import LinkedInProvider from 'next-auth/providers/linkedin';
import FacebookProvider from 'next-auth/providers/facebook';

const buildOptions = (): NextAuthOptions => {
  const providers: NextAuthOptions['providers'] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: 'select_account' } },
    }));
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }));
  }

  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    providers.push(LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }));
  }

  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    providers.push(FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }));
  }

  return {
    providers: providers.length > 0 ? providers : [{
      id: 'none',
      name: 'OAuth Not Configured',
      type: 'oauth' as const,
      clientId: 'placeholder',
      clientSecret: 'placeholder',
      wellKnown: undefined,
      authorization: { url: '' },
      token: { url: '' },
      userinfo: { url: '' },
      profile: () => ({ id: '0', name: 'none', email: 'none', image: null }),
    }],
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
    pages: {
      signIn: '/?auth=signin',  // route back to home with the auth modal trigger
      error: '/?auth=error',
    },
    callbacks: {
      async jwt({ token, account, profile }) {
        if (account && profile) {
          token.provider = account.provider;
          token.providerAccountId = account.providerAccountId;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as { provider?: string }).provider = token.provider as string | undefined;
        }
        return session;
      },
    },
    debug: false,
  };
};

const handler = NextAuth(buildOptions());

export { handler as GET, handler as POST };
