import { loginAdmin } from "@/app/admin/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-100 px-4 text-zinc-900">
      <form
        action={loginAdmin}
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6"
      >
        <h1 className="text-xl font-semibold">Staff login</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Shared password for the door tablet and guest list.
        </p>
        <label className="mt-6 block text-sm">
          Password
          <input
            type="password"
            name="password"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        {error ? (
          <p className="mt-3 text-sm text-red-600">Wrong password.</p>
        ) : null}
        <SubmitButton
          pendingLabel="Checking…"
          className="mt-4 w-full rounded-md bg-zinc-900 py-2 text-sm text-white"
        >
          Unlock
        </SubmitButton>
      </form>
    </div>
  );
}
