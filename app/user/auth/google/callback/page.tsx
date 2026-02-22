'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { setUserSession } from '@/lib/auth';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const error = searchParams.get('error');

    if (error) {
      router.push('/user/login?error=google_auth_failed');
      return;
    }

    if (token && userId) {
      setUserSession(token, {
          _id: userId,
          id: userId,
          nama_user: name ? decodeURIComponent(name) : '',
          email_user: email ? decodeURIComponent(email) : '',
          authProvider: 'google',
        });

      window.location.href = '/user/home';
    } else {
      router.push('/user/login?error=missing_data');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memproses login dengan Google...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
