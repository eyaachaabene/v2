import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth"
import { auth } from "./firebase"

export interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  userType: "farmer" | "buyer" | "expert"
  phone?: string
  location?: string
  createdAt: Date
}

const staticUserProfiles: Record<string, UserProfile> = {}

export const signUp = async (
  email: string,
  password: string,
  profile: Omit<UserProfile, "uid" | "email" | "createdAt">,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Send email verification
    await sendEmailVerification(user)

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      ...profile,
      createdAt: new Date(),
    }

    staticUserProfiles[user.uid] = userProfile

    return { user, profile: userProfile }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    if (staticUserProfiles[uid]) {
      return staticUserProfiles[uid]
    }

    // Create a default profile for existing users
    const user = auth.currentUser
    if (user && user.uid === uid) {
      const defaultProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        firstName: user.email?.split("@")[0] || "User",
        lastName: "",
        userType: "farmer",
        createdAt: new Date(),
      }
      staticUserProfiles[uid] = defaultProfile
      return defaultProfile
    }

    return null
  } catch (error: any) {
    console.error("[v0] Error getting user profile:", error)
    return null
  }
}
