// src/app/api/auth/[...nextauth]/route.ts

import { authOptions } from "../../../../lib/auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
