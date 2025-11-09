import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Jangan block apapun untuk sementara
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude files yang tidak perlu di-check
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};