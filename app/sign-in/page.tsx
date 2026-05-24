import { auth } from "@/auth";
import { Icon } from "@/components/ui/Icon";
import { SignInBrand } from "@/components/SignIn/SignInBrand";
import { SignInGoogleForm } from "@/components/SignIn/SignInGoogleForm";
import { SIGN_IN_FEATURES, SIGN_IN_TRUST_BADGES } from "@/lib/sign-in-content";
import { signIn, surfaces } from "@/lib/ui-tokens";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className={signIn.shell}>
      <section
        className={signIn.heroShell + " " + signIn.heroPanel}
        aria-label="Smart Inbox overview"
      >
        <div className={signIn.heroGrid} />
        <div className={signIn.heroGlow} />

        <SignInBrand />

        <div className={signIn.heroContent}>
          <div className={signIn.heroBadge}>
            <span className={signIn.heroBadgeDot} />
            Powered by GPT-5-mini
          </div>

          <h1 className={signIn.heroTitle}>
            Your inbox,
            <br />
            <span className={signIn.heroGradientText}>finally organized.</span>
          </h1>
          <p className={signIn.heroDescription}>
            Connect Gmail and every incoming email is automatically triaged —
            action items, invoices, subscriptions, and FYI updates — so you
            never miss what matters.
          </p>

          <div className={signIn.heroFeatureGrid}>
            {SIGN_IN_FEATURES.map((feature) => (
              <div key={feature.title} className={signIn.heroFeatureCard}>
                <Icon
                  name={feature.icon}
                  size="md"
                  className={signIn.heroFeatureIcon}
                />
                <div>
                  <p className={signIn.heroFeatureTitle}>{feature.title}</p>
                  <p className={signIn.heroFeatureDesc}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className={signIn.heroFooter}>
          Only emails received after sign-in are processed.
        </p>
      </section>

      <section
        className={signIn.loginShell + " " + surfaces.page}
        aria-label="Sign in"
      >
        <div className={signIn.loginPanel}>
          <div className="w-full max-w-[360px]">
            <div className={signIn.loginCard}>
              <div className={signIn.loginCardBody}>
                <h2 className={signIn.loginCardTitle}>Get started</h2>
                <p className={signIn.loginCardSubtitle}>
                  Sign in with Google to connect your inbox. Takes under a minute.
                </p>

                <SignInGoogleForm />
              </div>

              <div className={signIn.loginTrustFooter}>
                <div className={signIn.loginTrustGrid}>
                  {SIGN_IN_TRUST_BADGES.map((item) => (
                    <div key={item.label} className={signIn.loginTrustItem}>
                      <Icon name={item.icon} size="md" className="text-gray-400" />
                      <span className={signIn.loginTrustLabel}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className={signIn.loginLegal}>
              By continuing you agree to connect Gmail. Disconnect anytime from
              your Google account settings.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
