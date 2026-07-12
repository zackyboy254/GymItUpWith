export const dynamic = 'force-dynamic';

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { supabaseAdmin } from '@/lib/supabase';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (error) {
          console.error('Auth error', error);
          return null;
        }
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', data.user?.id)
          .single();
        if (!profile) return null;
        return {
          id: data.user?.id,
          email: data.user?.email,
          role: profile.role,
        } as any;
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  }),
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token.role) session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) token.role = (user as any).role;
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/admin/login' },
};

export const { GET, POST } = NextAuth(authOptions);
