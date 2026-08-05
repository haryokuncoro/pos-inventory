 "use server"

 import { auth } from "@/lib/auth";

 export async function signIn() {
     await auth.api.signInEmail({
        body:{
            email: "test@mail.com",
            password: "test1234"
        }
     })
 }

 export async function signUp() {
     await auth.api.signUpEmail({
        body:{
            email: "test@mail.com",
            password: "test1234",
            name : "Test User"
        }
     })
 }