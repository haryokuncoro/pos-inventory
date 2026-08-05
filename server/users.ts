 "use server"

 import { auth } from "@/lib/auth";

 export async function signIn(email: string, password: string) {
    try { 
        await auth.api.signInEmail({
            body:{
                email,
                password
            }
        })
        return { success: true, message: "Sign-in successful" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Sign-in failed" };
    }
}

 export async function signUp(name: string, email: string, password: string) {
    try {
        await auth.api.signUpEmail({
           body:{
               email,
               password,
               name
           }
        })
        return { success: true, message: "Sign-up successful" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Sign-up failed" };
    }
 }