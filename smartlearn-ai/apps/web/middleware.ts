import { NextResponse } from 'next/server';
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protect portal routes
  const isPortalRoute = nextUrl.pathname.startsWith('/student') || 
                        nextUrl.pathname.startsWith('/lecturer') || 
                        nextUrl.pathname.startsWith('/researcher') || 
                        nextUrl.pathname.startsWith('/admin') ||
                        nextUrl.pathname.startsWith('/supervisor') ||
                        nextUrl.pathname.startsWith('/ethics') ||
                        nextUrl.pathname.startsWith('/alumni') ||
                        nextUrl.pathname.startsWith('/advisor');

  const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect logged-in users to their respective portals
      const roles = req.auth?.user?.roles || [];
      let dest = "/student";
      
      if (roles.includes("SYSTEM_ADMINISTRATOR") || roles.includes("FACULTY_ADMINISTRATOR")) {
        dest = "/admin";
      } else if (roles.includes("LECTURER")) {
        dest = "/lecturer";
      } else if (roles.includes("RESEARCHER")) {
        dest = "/researcher";
      } else if (roles.includes("ETHICS_COMMITTEE_MEMBER")) {
        dest = "/ethics";
      } else if (roles.includes("ALUMNI")) {
        dest = "/alumni";
      } else if (roles.includes("CAREER_ADVISOR")) {
        dest = "/advisor";
      }
      
      return NextResponse.redirect(new URL(dest, nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && isPortalRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
