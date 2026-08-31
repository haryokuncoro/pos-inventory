import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import {ac, admin, user} from "./permissions";

// No baseURL: better-auth falls back to window.location.origin, which is
// correct for the web app and for the desktop app on whichever port its
// bundled server picked. A hardcoded host/port would put the client on a
// different origin from the server and silently break session cookies.
export const authClient = createAuthClient({
    plugins: [adminClient({
        ac,
        roles: {
            admin,
            user,
        }
    })],
})