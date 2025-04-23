import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { useUser } from "./context/UserContext";

const protectedRoutes = [
  {
    pathPrefix: "/admin",
    requiredRoles: ["admin", "user", "pharmacyAdmin", "pharmacyEmployee", "specialist", "consultant"],
  },
  {
    pathPrefix: "/admin/products",
    requiredRoles: ["admin", "pharmacyAdmin", "pharmacyEmployee"],
  },
  {
    pathPrefix: "/admin/orders",
    requiredRoles: ["admin", "pharmacyAdmin", "pharmacyEmployee", "user"],
  },
  {
    pathPrefix: "/admin/medical-tourism",
    requiredRoles: ["admin", "consultant"],
  },
  {
    pathPrefix: "/superuser",
    requiredRoles: ["superuser", "admin"],
  },
];

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

//   console.log(token)
  

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/unauthorized"
  ) {
    return NextResponse.next();
  }

  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.pathPrefix)) {
      // Role-based access check
      if (!token || !route.requiredRoles.includes(token?.role)) {
        const url = req.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      // Extra restriction for normal users under /admin*
      if (
        token.role === "user" &&
        pathname.startsWith("/admin") &&
        !token.isHealthQuestionsAnswered
      ) {
        const url = req.nextUrl.clone();
        url.pathname = "/health-questions"; // or redirect to "/health-questionnaire"
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}
