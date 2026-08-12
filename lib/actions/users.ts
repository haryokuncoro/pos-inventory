"use server"

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { user, InsertUser } from "@/db/schema";
import { eq } from "drizzle-orm"; 


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


type CreateUserInput = {
    name: string;
    email: string;
    password: string;
};
 
 type UpdateUserInput = Partial<
   Omit<InsertUser, "id" | "createdAt" | "updatedAt">
 >;

 export async function getAllUsers() {
    try {
        const users = await db.select().from(user);
        return users;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch users");
    }
}

export async function getUserById(id: string) {
    try {
        const userRecord = await db.select().from(user).where(eq(user.id, id));
        return userRecord;
    } catch (error) {
        console.error(error);
        throw new Error(`Failed to fetch user with id ${id}`);
    }
}


export async function createUser(
    userData: CreateUserInput
) {
  try {
        await auth.api.signUpEmail({
            body: {
                name: userData.name,
                email: userData.email,
                password: userData.password,
            },
        });

        const [createdUser] = await db
            .select()
            .from(user)
            .where(eq(user.email, userData.email));

    return createdUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function updateUser(id: string, userData: UpdateUserInput) {
    try {
        const [updatedUser] = await db.update(user).set(userData).where(eq(user.id, id)).returning();
        return updatedUser;
    } catch (error) {
        console.error(error);
        throw new Error(`Failed to update user with id ${id}`);
    }
}

export async function deleteUser(id: string) {
    try {
        await db.delete(user).where(eq(user.id, id));
    } catch (error) {
        console.error(error);
        throw new Error(`Failed to delete user with id ${id}`);
    }
}