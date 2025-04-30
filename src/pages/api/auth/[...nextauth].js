import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const API_BASE_URL = process.env.NEXT_PUBLIC_NODE_API_BASE_URL;

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              token: credentials.token, // optional
            }),
          });

          if (!res.ok) throw new Error("Invalid credentials");

          const user = await res.json();

          // Check if the user has a valid token
          if (!user.token) throw new Error("No token returned");

          // Return the user object with token and other necessary details
          return { ...user };
        } catch (error) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store user data and token in JWT
        token.id = user.user._id;
        token.jwt = user.token;  // Store JWT token
        token.email = user.user.email;
        token.role = user.user.role;
        token.name = user.user.name;  // Optional: user name from backend
        token.isHealthQuestionsAnswered = user.user.isHealthQuestionsAnswered ?? false;
        token.approvalStatus = user.user.approvalStatus ?? "pending";
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Attach token data to the session
        session.user.id = token.id;
        session.user.jwt = token.jwt;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.approvalStatus = token.approvalStatus ?? "pending";
      }
      // console.log(session)
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET,
});
