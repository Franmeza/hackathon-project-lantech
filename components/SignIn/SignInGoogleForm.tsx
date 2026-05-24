"use client";

import { useFormStatus } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { signInWithGoogleAction } from "@/app/actions/auth";
import { signIn } from "@/lib/ui-tokens";

function GoogleSignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={signIn.googleButton}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Icon name="loader" size="md" className="animate-spin text-gray-500" />
          Connecting…
        </>
      ) : (
        <>
          <Icon name="brand-google" size="md" />
          Continue with Google
        </>
      )}
    </button>
  );
}

export function SignInGoogleForm() {
  return (
    <form action={signInWithGoogleAction}>
      <GoogleSignInButton />
    </form>
  );
}
