import { createAuthClient } from "better-auth/client"
import { multiSessionClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: "http://localhost:8000/api/auth",
  plugins: [
    multiSessionClient()
  ]
})


authClient.updateUser({
  name: "hitesh",
  image: "abc"
},{
  onSuccess({data}) {
    return data;
  },
})

authClient.getSession({},{
  onSuccess({data}) {
    return data;
  },
  onError({error}) {
    return
  },
})


// Usage examples:
// 
// List all device sessions
// const { data, error } = await authClient.multiSession.listDeviceSessions();
//
// Set active session
// const { data, error } = await authClient.multiSession.setActive({
//   sessionToken: "some-session-token"
// });
//
// Revoke a session
// const { data, error } = await authClient.multiSession.revoke({
//   sessionToken: "some-session-token"
// });
//
// Sign out and revoke all sessions
// await authClient.signOut();
