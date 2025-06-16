import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "./lib/utils";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);

  // If the env vars are not set, skip middleware check
  if (!hasEnvVars) {
    console.log(`[Middleware] Skipping due to missing env vars.`);
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user }, } = await supabase.auth.getUser();

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/about") &&
    !request.nextUrl.pathname.startsWith("/order") &&
    !request.nextUrl.pathname.startsWith("/location")
  ) {
    console.log(`[Middleware] Redirecting unauthenticated user to login: ${request.nextUrl.pathname}`);
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Check user role if user is authenticated
  if (user) {
    const { data: profile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error(`[Middleware] Error fetching user role: ${error.message}`);
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    // Protect admin routes
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      profile.role !== "admin"
    ) {
      console.log(`[Middleware] Redirecting non-admin from admin route: ${request.nextUrl.pathname}`);
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Protect customer routes
    if (
      request.nextUrl.pathname.startsWith("/customer") &&
      profile.role !== "customer" &&
      profile.role !== "admin"
    ) {
      console.log(`[Middleware] Redirecting non-customer/admin from customer route: ${request.nextUrl.pathname}`);
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }
  return supabaseResponse;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 