import { loginAction } from "../actions"

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const errorMessage =
    error === "email"
      ? "This email does not match the configured admin account. The password was not checked."
      : error === "password"
        ? "The email matches, but the password is incorrect."
        : error === "configuration"
          ? "Admin sign-in is not configured correctly. Check the deployment environment variables."
          : null

  return (
    <main className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="text-2xl font-semibold">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Use the configured catalog administrator account.</p>
      {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}
      <form action={loginAction} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">Email<input name="email" type="email" required className="mt-1 h-10 w-full rounded-md border px-3" /></label>
        <label className="block text-sm font-medium">Password<input name="password" type="password" required className="mt-1 h-10 w-full rounded-md border px-3" /></label>
        <button className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Sign in</button>
      </form>
    </main>
  )
}
