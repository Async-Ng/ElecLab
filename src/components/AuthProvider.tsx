'use client';

import { ReactNode } from 'react';
import { AuthProvider as AuthProviderHook } from '@/hooks/useAuth';

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthProviderHook>{children}</AuthProviderHook>;
}