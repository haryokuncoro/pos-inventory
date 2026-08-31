import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; 
import { schema } from "@/db/schema";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin } from "better-auth/plugins"
import {ac, admin, user} from "./permissions";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/**
 * The offline desktop build ships without OAuth credentials, so the provider is
 * disabled rather than left half-configured with undefined credentials.
 */
export const isGoogleAuthEnabled = Boolean(
    googleClientId && googleClientSecret,
);

export const auth = betterAuth({
    emailAndPassword:{
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: googleClientId ?? "",
            clientSecret: googleClientSecret ?? "",
            enabled: isGoogleAuthEnabled,
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg", 
        schema,
    }),
    plugins: [nextCookies(), adminPlugin({
        ac,
        roles: {
            admin,
            user,
        }
    })]
});