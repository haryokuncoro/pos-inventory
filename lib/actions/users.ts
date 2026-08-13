"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { withErrorHandling } from "@/lib/helper";
import { userSchema } from "@/lib/validations/user";

const USER_PATH = "/dashboard/users";

type CreateUserInput = z.infer<typeof userSchema>;
type UpdateUserInput = Partial<z.infer<typeof userSchema>>;

export async function signIn(email: string, password: string) {
  try {
    await auth.api.signInEmail({ body: { email, password } });
    return { success: true, message: "Sign-in successful" };
  } catch (error) {
    console.error("Sign-in failed:", error);
    return { success: false, message: "Sign-in failed" };
  }
}

export async function signUp(name: string, email: string, password: string) {
  try {
    await auth.api.signUpEmail({ body: { email, password, name } });
    return { success: true, message: "Sign-up successful" };
  } catch (error) {
    console.error("Sign-up failed:", error);
    return { success: false, message: "Sign-up failed" };
  }
}

export async function checkPermission(permissions: Record<string, string[]>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return false;

    const hasPermission = await auth.api.userHasPermission({
      body: { userId: session.user.id, permissions },
    });
    return hasPermission.success;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}

export async function getAllUsers() {
  return withErrorHandling("fetching users", () => db.select().from(user));
}

export async function getUserById(id: string) {
  return withErrorHandling(`fetching user with id ${id}`, async () => {
    const [result] = await db.select().from(user).where(eq(user.id, id));
    return result ?? null;
  });
}

export async function createUser(input: CreateUserInput) {
  return withErrorHandling("creating user", async () => {
    const userData = userSchema.parse(input);

    const created = await auth.api.createUser({
      body: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      },
    });

    revalidatePath(USER_PATH);
    return created.user;
  });
}

export async function updateUser(id: string, input: UpdateUserInput) {
  return withErrorHandling(`updating user with id ${id}`, async () => {
    const userData = userSchema.partial().parse(input);

    const [updatedUser] = await db
      .update(user)
      .set(userData)
      .where(eq(user.id, id))
      .returning();

    revalidatePath(USER_PATH);
    return updatedUser;
  });
}

export async function deleteUser(id: string) {
  return withErrorHandling(`deleting user with id ${id}`, async () => {
    await db.delete(user).where(eq(user.id, id));
    revalidatePath(USER_PATH);
  });
}