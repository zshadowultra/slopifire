import { LovableHeart } from "@/components/LovableLogo";
import LightRays from "@/components/LightRays";
import { Button } from "@/components/coss/button";
import { Switch } from "@/components/coss/switch";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { motion } from "framer-motion";
import { Bell, Loader2 } from "lucide-react";
import { MicroButton } from "@/components/micro";
import { Suspense, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router";

type Slide = 0 | 1;

function StylePreview({ theme }: { theme: "light" | "dark" }) {
  const light = theme === "light";
  return (
    <div
      className={
        light
          ? "flex h-full w-full overflow-hidden rounded-[14px] bg-[#F2F1EC]"
          : "flex h-full w-full overflow-hidden rounded-[14px] bg-[#232323]"
      }
    >
      <div className="flex w-1/2 flex-col gap-2 p-3">
        <LovableHeart size={16} />
        <div
          className={
            light
              ? "mt-1 h-3 w-4/5 rounded bg-[#E3E1D9]"
              : "mt-1 h-3 w-4/5 rounded bg-white/10"
          }
        />
        <div
          className={
            light
              ? "h-3 w-3/5 rounded bg-[#E3E1D9]"
              : "h-3 w-3/5 rounded bg-white/10"
          }
        />
        <div
          className={
            light
              ? "h-3 w-4/6 rounded bg-[#E3E1D9]"
              : "h-3 w-4/6 rounded bg-white/10"
          }
        />
      </div>
      <div
        className={
          light
            ? "m-2 w-1/2 rounded-lg bg-[#EDEBE3]"
            : "m-2 w-1/2 rounded-lg bg-[#2C2C2C]"
        }
      />
    </div>
  );
}

function OnboardingInner() {
  useDarkMode(true);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const completeOnboarding = useMutation(api.onboarding.completeOnboarding);
  const [slide, setSlide] = useState<Slide>(0);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user && user.onboardingComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, user, navigate]);

  const finish = async (chosen: "light" | "dark") => {
    setSaving(true);
    try {
      await completeOnboarding({ themeChoice: chosen });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#FF6B4A"
          raysSpeed={1.2}
          lightSpread={1.0}
          rayLength={2.6}
          pulsating={true}
          fadeDistance={1.25}
          saturation={1.1}
          followMouse={false}
          mouseInfluence={0}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/60" />

      <div className="isolate-root relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
        {slide === 1 && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => void finish(theme)}
              className="rounded-full bg-white/10 px-5 py-3 text-base font-medium text-white/90 backdrop-blur hover:bg-white/15"
            >
              Ask me later
            </button>
          </div>
        )}

        {slide === 0 ? (
          <>
            <div className="mt-16 flex flex-col items-center">
              <LovableHeart size={88} />
              <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight">
                Pick your style
              </h1>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-5">
              {(["light", "dark"] as const).map((t) => (
                <MicroButton key={t}>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTheme(t)}
                    className="group flex flex-col items-center gap-3 rounded-2xl"
                  >
                    <div
                      className={
                        "h-48 w-full overflow-hidden rounded-2xl border-2 transition-all " +
                        (theme === t
                          ? "border-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
                          : "border-white/10 group-hover:border-white/30")
                      }
                    >
                      <StylePreview theme={t} />
                    </div>
                    <span className="text-xl font-semibold capitalize">
                      {t}
                    </span>
                  </motion.button>
                </MicroButton>
              ))}
            </div>

            <MicroButton>
              <Button
                type="button"
                size="xl"
                disabled={saving}
                loading={saving}
                className="mt-10 h-16 w-full rounded-full bg-white font-semibold text-black hover:bg-white/90 dark:bg-white dark:text-black"
                onClick={() => setSlide(1)}
              >
                {saving ? "" : "Next"}
              </Button>
            </MicroButton>
          </>
        ) : (
          <>
            <div className="mt-14 flex flex-col items-center">
              <LovableHeart size={72} />
              <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance">
                A few quick permissions
              </h1>
              <p className="mt-3 text-center text-lg text-white/60">
                Choose what you&apos;d like to enable.
              </p>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <div className="flex items-start gap-4">
                <Bell className="mt-1 size-6 shrink-0 text-white" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">Notifications</p>
                  <p className="mt-1 text-base text-white/60">
                    Get notified when work is complete
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3">                  <MicroButton>
                    <Button
                      type="button"
                      variant="secondary"
                      size="xl"
                      className="h-14 flex-1 rounded-full bg-white/10 text-base font-semibold text-white hover:bg-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                      onClick={() => void finish(theme)}
                    >
                      Skip
                    </Button>
                  </MicroButton>
                  <MicroButton>
                    <Button
                      type="button"
                      size="xl"
                      className="h-14 flex-1 rounded-full bg-blue-600 text-base font-semibold text-white shadow-none hover:bg-blue-500 dark:bg-blue-600 dark:text-white"
                      onClick={() => {
                        try {
                          void Notification.requestPermission?.();
                        } catch {
                          /* unsupported */
                        }
                        void finish(theme);
                      }}
                    >
                      Enable
                    </Button>
                  </MicroButton>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <div className="min-w-0">
                <p className="text-lg font-semibold">Email updates</p>
                <p className="mt-1 text-base text-white/60">
                  Tips and product news
                </p>
              </div>
              <Switch defaultChecked className="data-unchecked:bg-white/15" />
            </div>
          </>
        )}

        <div className="mt-auto flex items-center justify-center gap-3 pb-8 pt-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={
                "h-2 rounded-full transition-all " +
                (i === slide
                  ? "w-7 bg-white"
                  : "w-2 bg-white/30")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-black">
          <Loader2 className="size-6 animate-spin text-white/50" />
        </div>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
