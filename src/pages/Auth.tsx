import { LovableHeart } from "@/components/LovableLogo";
import LightRays from "@/components/LightRays";
import { Button } from "@/components/coss/button";
import { Input } from "@/components/coss/input";
import {
  OTPField,
  OTPFieldInput,
} from "@/components/coss/otp-field";
import { Spinner } from "@/components/coss/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { Github, Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  useDarkMode(true);
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
    } catch (err) {
      console.error("Email sign-in error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (code: string) => {
    if (step === "signIn" || code.length !== 6) return;
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", step.email);
      formData.set("code", code);
      await signIn("email-otp", formData);
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("The verification code you entered is incorrect.");
      setOtp("");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error("Guest login error:", err);
      setError(
        `Failed to sign in as guest: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      {/* LightRays (pulsating) background */}
      <div className="absolute inset-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#FF6B4A"
          raysSpeed={1.4}
          lightSpread={0.9}
          rayLength={2.4}
          pulsating={true}
          fadeDistance={1.2}
          saturation={1.2}
          followMouse={false}
          mouseInfluence={0}
          noiseAmount={0.05}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/70" />

      <div className="isolate-root relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
        <div className="h-14 shrink-0" />

        {step === "signIn" ? (
          <>
            <div className="mt-28">
              <LovableHeart size={96} />
            </div>
            <h1 className="mt-8 font-heading text-5xl font-semibold tracking-tight">
              Log in
            </h1>

            <div className="mt-10 flex flex-col gap-3.5">
              <Button
                type="button"
                variant="outline"
                size="xl"
                loading={false}
                disabled={isLoading}
                className="w-full rounded-full border-white/15 bg-white/5 text-lg text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white/80 dark:bg-white/5"
                onClick={() =>
                  setError(
                    "Google sign-in is not available in this replica — use email below.",
                  )
                }
              >
                <GoogleGlyph />
                <span className="flex-1 text-center">
                  Continue with Google
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xl"
                disabled={isLoading}
                className="w-full rounded-full border-white/15 bg-white/5 text-lg text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white/80 dark:bg-white/5"
                onClick={() =>
                  setError(
                    "GitHub sign-in is not available in this replica — use email below.",
                  )
                }
              >
                <Github className="fill-current" />
                <span className="flex-1 text-center">
                  Continue with GitHub
                </span>
              </Button>
            </div>

            <div className="mt-9 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/15" />
              <span className="text-sm font-medium text-white/70">OR</span>
              <span className="h-px flex-1 bg-white/15" />
            </div>

            <form onSubmit={handleEmailSubmit} className="mt-5">
              <label
                htmlFor="email"
                className="text-lg font-bold text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email"
                autoComplete="email"
                disabled={isLoading}
                className="mt-3 h-16 rounded-full border-white/15 bg-white/5 px-6 text-lg text-white shadow-none placeholder:text-white/30 focus-visible:border-white/40 dark:border-white/15 dark:bg-white/5"
              />
              {error && (
                <p className="mt-3 px-2 text-sm text-red-400">{error}</p>
              )}
              <Button
                type="submit"
                size="xl"
                disabled={isLoading}
                loading={isLoading}
                className="mt-5 h-16 w-full rounded-full bg-white/40 text-xl font-semibold text-black/80 hover:bg-white/50 dark:bg-white/40 dark:text-black/80 dark:hover:bg-white/50"
              >
                {isLoading ? "" : "Continue"}
              </Button>
            </form>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="mt-4 text-center text-sm font-medium text-white/50 underline-offset-4 hover:text-white/80 hover:underline disabled:opacity-50"
            >
              Continue as guest
            </button>
          </>
        ) : (
          <>
            <div className="mt-20 flex flex-col items-center">
              <LovableHeart size={64} />
              <h1 className="mt-7 font-heading text-3xl font-semibold tracking-tight">
                Check your email
              </h1>
              <p className="mt-3 text-center text-base text-white/60">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-white">{step.email}</span>
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center gap-5">
              <OTPField
                length={6}
                value={otp}
                onValueChange={setOtp}
                onValueComplete={(value) => void handleOtpSubmit(value)}
                disabled={isLoading}
                aria-label="Verification code"
                className="w-full justify-between"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <OTPFieldInput
                    key={index}
                    aria-label={index === 0 ? undefined : `Character ${index + 1} of 6`}
                    className="h-16 w-12 rounded-2xl border-white/15 bg-white/5 text-2xl font-semibold text-white shadow-none dark:border-white/15 dark:bg-white/5"
                  />
                ))}
              </OTPField>
              {error && (
                <p className="text-center text-sm text-red-400">{error}</p>
              )}
              <Button
                type="button"
                size="xl"
                disabled={isLoading || otp.length !== 6}
                loading={isLoading}
                className="h-16 w-full rounded-full bg-white font-semibold text-black hover:bg-white/90 dark:bg-white dark:text-black"
              >
                {isLoading ? <Spinner className="text-black" /> : "Continue"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("signIn");
                  setOtp("");
                  setError(null);
                }}
                disabled={isLoading}
                className="text-sm font-medium text-white/50 hover:text-white/80 disabled:opacity-50"
              >
                Use a different email
              </button>
            </div>
          </>
        )}

        <div className="flex-1" />
        <div className="pb-6 pt-8" />
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-black">
          <Loader2 className="size-6 animate-spin text-white/50" />
        </div>
      }
    >
      <Auth {...props} />
    </Suspense>
  );
}
