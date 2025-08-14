export { default } from "next-auth/middleware";

// Protect any route that starts with /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
