import { auth, signIn } from "@/auth";
import { Icon } from "@/components/ui/Icon";
import { redirect } from "next/navigation";

async function signInWithGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/" });
}

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Inbox Action Board
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Connect your Gmail to classify incoming emails automatically. Only{" "}
            <span className="font-medium text-gray-700">new emails</span> after
            you sign in are processed — we never import your existing inbox.
          </p>
        </div>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <Icon name="brand-google" size="md" />
            Continue with Google
          </button>
        </form>

        <p className="text-[11px] text-gray-400 mt-5 leading-relaxed text-center">
          Read-only Gmail access. You can also paste messages manually after
          signing in.
        </p>
      </div>
    </main>
  );
}
