import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signInWithGoogleAction } from "@/app/actions/auth";

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant triage",
    desc: "Every new email is read and classified in seconds.",
  },
  {
    icon: "🧾",
    title: "Invoice tracking",
    desc: "Bills and payment requests surface automatically.",
  },
  {
    icon: "🔒",
    title: "Read-only access",
    desc: "We never store your emails or send on your behalf.",
  },
  {
    icon: "✦",
    title: "GPT-5-mini powered",
    desc: "Draft replies and action items extracted with context.",
  },
];

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex">
      {/* ── Left panel: dark branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[54%] bg-[#0B0C0E] p-12 relative overflow-hidden">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Gradient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">
            Inbox AI
          </span>
        </div>

        {/* Main copy */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/10 text-white/50 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Powered by GPT-5-mini
          </div>

          <h1 className="text-[46px] font-bold text-white leading-[1.07] tracking-tight mb-6">
            Your inbox,
            <br />
            <span
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              finally organised.
            </span>
          </h1>
          <p className="text-[15px] text-white/45 leading-relaxed max-w-md mb-10">
            Connect Gmail and every incoming email is automatically triaged —
            action items, invoices, subscriptions, and FYI updates — so you
            never miss what matters.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.07]"
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-[13px] font-medium text-white/80 leading-tight">
                    {f.title}
                  </p>
                  <p className="text-[12px] text-white/35 mt-0.5 leading-snug">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative text-[11px] text-white/20">
          Only emails received after sign-in are processed. Read-only Gmail
          scope.
        </p>
      </div>

      {/* ── Right panel: sign-in form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-8 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-[15px]">
            Inbox AI
          </span>
        </div>

        <div className="w-full max-w-[360px]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-[22px] font-bold text-gray-900 tracking-tight mb-1">
                Get started
              </h2>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-7">
                Sign in with Google to connect your inbox. Takes under a
                minute.
              </p>

              <form action={signInWithGoogleAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 text-[13px] font-semibold px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.99]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </form>
            </div>

            {/* Trust badges */}
            <div className="border-t border-gray-100 px-8 py-4 bg-gray-50/60">
              <div className="flex items-center justify-between">
                {[
                  { icon: "🔒", label: "Read-only" },
                  { icon: "✉️", label: "New only" },
                  { icon: "🗑️", label: "No storage" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-5 leading-relaxed">
            By continuing you agree to read-only Gmail access. You can
            disconnect at any time from your Google account settings.
          </p>
        </div>
      </div>
    </main>
  );
}
