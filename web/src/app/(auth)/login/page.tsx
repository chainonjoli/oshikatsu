import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth";
import { loginAction } from "@/lib/actions/auth";
import { ErrorBanner, SubmitButton } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSessionUser()) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <p className="text-3xl">🩷</p>
        <h1 className="mt-2 text-2xl font-bold">{APP_NAME}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          {APP_TAGLINE}
        </p>
      </div>

      <ErrorBanner message={error} />

      <form action={loginAction} className="space-y-4">
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input type="email" id="email" name="email" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input type="password" id="password" name="password" required autoComplete="current-password" />
        </div>
        <SubmitButton>ログイン</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
        はじめての方は{" "}
        <Link href="/register" className="font-bold" style={{ color: "var(--color-accent)" }}>
          新規登録
        </Link>
      </p>
    </main>
  );
}
