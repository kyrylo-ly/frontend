import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <section className="grid gap-6 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-300/20 backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            Razom Pay
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Fast and secure auth flows for your app
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            This frontend now supports OTP and Telegram authentication backed by
            `gateway-service`. Use the login page to test full token lifecycle:
            send code, verify, refresh and logout.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Continue to Login
            </Link>
            <Link
              href="/communities"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Open Communities
            </Link>
          </div>
        </div>
        <div className="grid gap-3">
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">OTP Login</p>
            <p className="mt-1 text-sm text-slate-600">
              Email/phone verification in two quick steps.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Telegram Flow</p>
            <p className="mt-1 text-sm text-slate-600">
              Init, verify and finalize sign-in for Telegram users.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Session Refresh</p>
            <p className="mt-1 text-sm text-slate-600">
              Keeps users signed in with secure refresh-token cookie.
            </p>
          </article>
        </div>
      </section>
      <section className="mt-6 text-sm text-slate-500">
        Built with Next.js App Router and modern Tailwind UI primitives.
      </section>
    </main>
  );
}
