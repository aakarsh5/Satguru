import { loginAction } from "../actions"

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const showAuthDiagnostics = process.env.NODE_ENV === "development" || process.env.ADMIN_AUTH_DEBUG === "true"
  const errorMessage = showAuthDiagnostics
    ? error === "email-config"
      ? "Development error: ADMIN_EMAIL is missing from this environment."
      : error === "hash-missing"
        ? "Development error: ADMIN_PASSWORD_HASH is missing from this environment."
        : error === "hash-format"
          ? "Development error: ADMIN_PASSWORD_HASH must be scrypt$<32 hexadecimal salt>$<128 hexadecimal digest>."
          : error === "email"
            ? "Diagnostic: the email does not match ADMIN_EMAIL; the password matches."
            : error === "both"
              ? "Diagnostic: neither the email nor the password matches the configured admin credentials."
            : error === "password"
              ? "Diagnostic: the email matches, but the password does not match ADMIN_PASSWORD_HASH."
              : null
    : error
      ? "Unable to sign in. Check your credentials."
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
