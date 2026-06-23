import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting map (IP -> timestamps array)
const rateLimitMap = new Map<string, number[]>();
const LIMIT = 60; // 60 requests
const WINDOW = 60 * 1000; // 1 minute in milliseconds

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return false;
  }

  const timestamps = rateLimitMap.get(ip) || [];
  // Filter out expired timestamps
  const validTimestamps = timestamps.filter(time => now - time < WINDOW);
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);

  return validTimestamps.length > LIMIT;
}

export default withAuth(
  function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    
    // Apply rate limiting to all /api routes
    if (path.startsWith('/api')) {
      const ip = req.headers.get('x-forwarded-for') || (req as any).ip || 'anonymous';
      if (isRateLimited(ip)) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Too many requests. Please try again in a minute.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
