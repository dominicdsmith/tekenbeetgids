import type { Auth } from "firebase/auth";

let auth: Auth | undefined;
export async function googleBeheerAuth() {
  if (auth) return auth;
  const response = await fetch("/api/public/google-beheer", { cache: "no-store" });
  if (!response.ok) throw new Error("Google-login niet beschikbaar.");
  const config = await response.json();
  const { initializeApp, getApps } = await import("firebase/app");
  const { getAuth, setPersistence, inMemoryPersistence } = await import("firebase/auth");
  const app = getApps().find(a => a.name === "google-beheer") ?? initializeApp(config, "google-beheer");
  const instance = getAuth(app);
  await setPersistence(instance, inMemoryPersistence);
  auth = instance;
  return instance;
}