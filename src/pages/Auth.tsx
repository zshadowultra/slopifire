import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { LovableHeart } from "@/components/LovableLogo";
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
    <div className="aurora min-h-dvh bg-black text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
        {/* Status-bar spacing like the phone mock */}
        <div className="h-16 shrink-0" />

        {step === "signIn" ? (
          <>
            <div className="mt-32">
              <LovableHeart size={104} />
            </div>
            <h1 className="mt-10 text-5xl font-extrabold tracking-tight">
              Log in
            </h1>

            <div className="mt-12 flex flex-col gap-4">
              <button
                type="button"
                disabled={isLoading}
                className="flex h-16 w-full items-center gap-4 rounded-full border border-white/15 px-6 text-lg font-semibold text-white/50 transition-colors hover:border-white/30 hover:text-white/70 disabled:opacity-50"
                onClick={() =>
                  setError("Google sign-in is not available in this replica — use email below.")
                }
              >
                <GoogleGlyph />
                <span className="flex-1 text-center pr-7">
                  Continue with Google
                </span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                className="flex h-16 w-full items-center gap-4 rounded-full border border-white/15 px-6 text-lg font-semibold text-white/50 transition-colors hover:border-white/30 hover:text-white/70 disabled:opacity-50"
                onClick={() =>
                  setError("GitHub sign-in is not available in this replica — use email below.")
                }
              >
                <Github className="size-6 shrink-0 fill-current" />
                <span className="flex-1 text-center pr-7">
                  Continue with GitHub
                </span>
              </button>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <span className="h-px flex-1 bg-white/15" />
              <span className="text-sm font-medium text-white/70">OR</span>
              <span className="h-px flex-1 bg-white/15" />
            </div>

            <form onSubmit={handleEmailSubmit} className="mt-6">
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
                className="mt-3 h-16 rounded-full border-white/15 bg-white/5 px-6 text-lg text-white placeholder:text-white/30 focus-visible:border-white/40 focus-visible:ring-0"
              />
              {error && (
                <p className="mt-3 px-2 text-sm text-red-400">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-5 flex h-16 w-full items-center justify-center rounded-full bg-white/40 text-xl font-bold text-black/80 transition-colors hover:bg-white/50 disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="size-6 animate-spin text-black/70" />
                ) : (
                  "Continue"
                )}
              </button>
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
            <div className="mt-24 flex flex-col items-center">
              <LovableHeart size={72} />
              <h1 className="mt-8 text-3xl font-extrabold tracking-tight">
                Check your email
              </h1>
              <p className="mt-3 text-center text-base text-white/60">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-white">{step.email}</span>
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                    void handleOtpSubmit(otp);
                  }
                }}
              >
                <InputOTPGroup className="gap-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-16 w-12 rounded-2xl border-white/15 bg-white/5 text-2xl font-bold text-white"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {error && (
                <p className="text-center text-sm text-red-400">{error}</p>
              )}
              <button
                type="button"
                onClick={() => void handleOtpSubmit(otp)}
                disabled={isLoading || otp.length !== 6}
                className="mt-2 flex h-16 w-full items-center justify-center rounded-full bg-white text-xl font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {isLoading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  "Continue"
                )}
              </button>
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
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
