import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold">Razom Pay Frontend</h1>
      <p className="text-zinc-600">
        Auth flow scaffolding is ready for gateway endpoints.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Open Login
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
