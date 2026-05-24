import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { BrandMark } from "@/components/ui/BrandMark";
import { signIn } from "@/lib/ui-tokens";

export function SignInBrand() {
  return (
    <div className={signIn.heroBrandWrap}>
      <BrandMark iconClassName="text-white" />
      <div className={signIn.heroBrandText}>
        <span className={signIn.heroBrandName}>{APP_NAME}</span>
        <span className={signIn.heroBrandTagline}>{APP_TAGLINE}</span>
      </div>
    </div>
  );
}
