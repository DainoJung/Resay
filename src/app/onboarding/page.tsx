"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth/context";

type Step = 0 | 1 | 2 | 3;

const STORAGE_KEYS = {
  native: "resay-onboarding-native",
  learning: "resay-onboarding-learning",
  name: "resay-onboarding-name",
} as const;

const nativeLanguages = [
  { code: "ko", flag: "\uD83C\uDDF0\uD83C\uDDF7", label: "\uD55C\uAD6D\uC5B4" },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", label: "\u65E5\u672C\u8A9E" },
  { code: "zh", flag: "\uD83C\uDDE8\uD83C\uDDF3", label: "\u4E2D\u6587" },
];

const learningLanguages = [
  { code: "en", flag: "\uD83C\uDDFA\uD83C\uDDF8", label: "English", available: true },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", label: "\u65E5\u672C\u8A9E", available: false },
  { code: "zh", flag: "\uD83C\uDDE8\uD83C\uDDF3", label: "\u4E2D\u6587", available: false },
];

// Bilingual labels
const labels = {
  ko: {
    step1Title: "\uBAA8\uAD6D\uC5B4\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694",
    step1Subtitle: "\uC571\uC744 \uC5B4\uB5A4 \uC5B8\uC5B4\uB85C \uD45C\uC2DC\uD560\uAE4C\uC694?",
    step2Title: "\uBB34\uC5C7\uC744 \uBC30\uC6B0\uACE0 \uC2F6\uC73C\uC138\uC694?",
    step2Subtitle: "\uD53C\uB4DC\uBC31\uC744 \uBC1B\uC744 \uC5B8\uC5B4\uB97C \uC120\uD0DD\uD558\uC138\uC694",
    step2ComingSoon: "\uC9C0\uC6D0 \uC608\uC815",
    step3Title: "\uC774\uB984\uC744 \uC54C\uB824\uC8FC\uC138\uC694",
    step3Subtitle: "\uD648 \uD654\uBA74\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4",
    step3Placeholder: "\uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694",
    step3Next: "\uB2E4\uC74C",
    step4Title: "\uC774\uBA54\uC77C\uB85C \uC2DC\uC791\uD558\uAE30",
    step4Subtitle: "\uB370\uC774\uD130\uB97C \uC548\uC804\uD558\uAC8C \uC800\uC7A5\uD558\uACE0 \uB3D9\uAE30\uD654\uD569\uB2C8\uB2E4",
    step4Placeholder: "\uC774\uBA54\uC77C \uC8FC\uC18C",
    step4Send: "\uC778\uC99D \uCF54\uB4DC \uBC1B\uAE30",
    step4Sending: "\uC804\uC1A1 \uC911...",
    step4SentTitle: "\uC778\uC99D \uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694",
    step4SentDesc: "\uC774\uBA54\uC77C\uB85C \uC804\uC1A1\uB41C 6\uC790\uB9AC \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    step4Verify: "\uD655\uC778",
    step4Verifying: "\uD655\uC778 \uC911...",
    step4Retry: "\uB2E4\uB978 \uC774\uBA54\uC77C\uB85C \uC2DC\uB3C4",
    step4Note: "\uBE44\uBC00\uBC88\uD638 \uC5C6\uC774 \uC774\uBA54\uC77C\uB85C\uB9CC \uB85C\uADF8\uC778\uB429\uB2C8\uB2E4.",
    hasAccount: "\uC774\uBBF8 \uACC4\uC815\uC774 \uC788\uC73C\uC2E0\uAC00\uC694?",
    login: "\uB85C\uADF8\uC778",
  },
  ja: {
    step1Title: "\u6BCD\u8A9E\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
    step1Subtitle: "\u30A2\u30D7\u30EA\u3092\u3069\u306E\u8A00\u8A9E\u3067\u8868\u793A\u3057\u307E\u3059\u304B\uFF1F",
    step2Title: "\u4F55\u3092\u5B66\u3073\u305F\u3044\u3067\u3059\u304B\uFF1F",
    step2Subtitle: "\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3092\u53D7\u3051\u308B\u8A00\u8A9E\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
    step2ComingSoon: "\u5BFE\u5FDC\u4E88\u5B9A",
    step3Title: "\u304A\u540D\u524D\u3092\u6559\u3048\u3066\u304F\u3060\u3055\u3044",
    step3Subtitle: "\u30DB\u30FC\u30E0\u753B\u9762\u306B\u8868\u793A\u3055\u308C\u307E\u3059",
    step3Placeholder: "\u540D\u524D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
    step3Next: "\u6B21\u3078",
    step4Title: "\u30E1\u30FC\u30EB\u3067\u59CB\u3081\u308B",
    step4Subtitle: "\u30C7\u30FC\u30BF\u3092\u5B89\u5168\u306B\u4FDD\u5B58\u30FB\u540C\u671F\u3057\u307E\u3059",
    step4Placeholder: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
    step4Send: "\u8A8D\u8A3C\u30B3\u30FC\u30C9\u3092\u53D7\u3051\u53D6\u308B",
    step4Sending: "\u9001\u4FE1\u4E2D...",
    step4SentTitle: "\u8A8D\u8A3C\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044",
    step4SentDesc: "\u30E1\u30FC\u30EB\u306B\u9001\u4FE1\u3055\u308C\u305F6\u6841\u306E\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    step4Verify: "\u78BA\u8A8D",
    step4Verifying: "\u78BA\u8A8D\u4E2D...",
    step4Retry: "\u5225\u306E\u30E1\u30FC\u30EB\u3067\u8A66\u3059",
    step4Note: "\u30D1\u30B9\u30EF\u30FC\u30C9\u4E0D\u8981\u3067\u30E1\u30FC\u30EB\u3060\u3051\u3067\u30ED\u30B0\u30A4\u30F3\u3067\u304D\u307E\u3059\u3002",
    hasAccount: "\u3059\u3067\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u3067\u3059\u304B\uFF1F",
    login: "\u30ED\u30B0\u30A4\u30F3",
  },
  zh: {
    step1Title: "\u9009\u62E9\u4F60\u7684\u6BCD\u8BED",
    step1Subtitle: "\u5E94\u7528\u5C06\u4EE5\u54EA\u79CD\u8BED\u8A00\u663E\u793A\uFF1F",
    step2Title: "\u4F60\u60F3\u5B66\u4EC0\u4E48\uFF1F",
    step2Subtitle: "\u9009\u62E9\u4F60\u60F3\u83B7\u5F97\u53CD\u9988\u7684\u8BED\u8A00",
    step2ComingSoon: "\u5373\u5C06\u63A8\u51FA",
    step3Title: "\u544A\u8BC9\u6211\u4EEC\u4F60\u7684\u540D\u5B57",
    step3Subtitle: "\u4F1A\u663E\u793A\u5728\u4E3B\u9875\u4E0A",
    step3Placeholder: "\u8BF7\u8F93\u5165\u540D\u5B57",
    step3Next: "\u4E0B\u4E00\u6B65",
    step4Title: "\u7528\u90AE\u7BB1\u5F00\u59CB",
    step4Subtitle: "\u5B89\u5168\u4FDD\u5B58\u548C\u540C\u6B65\u4F60\u7684\u6570\u636E",
    step4Placeholder: "\u90AE\u7BB1\u5730\u5740",
    step4Send: "\u83B7\u53D6\u9A8C\u8BC1\u7801",
    step4Sending: "\u53D1\u9001\u4E2D...",
    step4SentTitle: "\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801",
    step4SentDesc: "\u8BF7\u8F93\u5165\u90AE\u4EF6\u4E2D\u76846\u4F4D\u9A8C\u8BC1\u7801\u3002",
    step4Verify: "\u786E\u8BA4",
    step4Verifying: "\u786E\u8BA4\u4E2D...",
    step4Retry: "\u6362\u4E00\u4E2A\u90AE\u7BB1",
    step4Note: "\u65E0\u9700\u5BC6\u7801\uFF0C\u4EC5\u901A\u8FC7\u90AE\u7BB1\u5373\u53EF\u767B\u5F55\u3002",
    hasAccount: "\u5DF2\u6709\u8D26\u6237\uFF1F",
    login: "\u767B\u5F55",
  },
};


export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [nativeLang, setNativeLang] = useState<string>("");
  const [learningLang, setLearningLang] = useState<string>("");
  const [displayName, setDisplayName] = useState("");

  // Email step state
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);

  const lang = (nativeLang === "ja" ? "ja" : nativeLang === "zh" ? "zh" : "ko") as "ko" | "ja" | "zh";
  const t = labels[lang];

  // Redirect logged-in users to home
  useEffect(() => {
    if (user && profile?.onboarding_completed) {
      router.replace("/");
    }
  }, [user, profile, router]);

  const goTo = useCallback((nextStep: Step) => {
    setDirection(nextStep > step ? "forward" : "backward");
    setStep(nextStep);
  }, [step]);

  const handleNativeSelect = (code: string) => {
    setNativeLang(code);
    localStorage.setItem(STORAGE_KEYS.native, code);
    setTimeout(() => goTo(1), 200);
  };

  const handleLearningSelect = (code: string) => {
    setLearningLang(code);
    localStorage.setItem(STORAGE_KEYS.learning, code);
    setTimeout(() => goTo(2), 200);
  };

  const handleNameNext = () => {
    if (displayName.trim()) {
      localStorage.setItem(STORAGE_KEYS.name, displayName.trim());
      goTo(3);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || emailLoading) return;

    setEmailLoading(true);
    setEmailError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    });

    setEmailLoading(false);

    if (authError) {
      setEmailError(authError.message);
      return;
    }

    setEmailSent(true);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otpVerifying) return;

    setOtpVerifying(true);
    setEmailError("");

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });

    if (verifyError) {
      setOtpVerifying(false);
      setEmailError(verifyError.message);
      return;
    }

    // Sync onboarding data to profile
    if (data.user) {
      await supabase
        .from("profiles")
        .update({
          native_language: localStorage.getItem(STORAGE_KEYS.native) || "ko",
          learning_language: localStorage.getItem(STORAGE_KEYS.learning) || "en",
          display_name: localStorage.getItem(STORAGE_KEYS.name) || "",
          onboarding_completed: true,
        })
        .eq("id", data.user.id);

      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    }

    setOtpVerifying(false);
    window.location.href = "/";
  };

  const slideClass = (targetStep: Step) => {
    if (step === targetStep) return "onboarding-step-active";
    if (direction === "forward") {
      return targetStep < step ? "onboarding-step-exit-left" : "onboarding-step-enter-right";
    }
    return targetStep > step ? "onboarding-step-exit-right" : "onboarding-step-enter-left";
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-10 h-1 bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / 4) * 100}%` }}
        />
      </div>

      {/* Back button */}
      {step > 0 && !emailSent && (
        <button
          onClick={() => goTo((step - 1) as Step)}
          className="fixed top-4 left-4 z-20 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className="relative min-h-screen">
        {/* Step 0: Native Language */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 ${slideClass(0)}`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {nativeLang ? t.step1Title : "Select your language"}
          </h1>
          <p className="text-gray-500 text-sm mb-10 text-center">
            {nativeLang ? t.step1Subtitle : "Which language would you like to use?"}
          </p>
          <div className="w-full max-w-xs space-y-3">
            {nativeLanguages.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => handleNativeSelect(code)}
                className={`w-full rounded-2xl border-2 px-6 py-5 text-left transition-all ${
                  nativeLang === code
                    ? "border-blue-500 bg-blue-50 scale-[0.98]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-2xl mr-3">{flag}</span>
                <span className="text-lg font-medium text-gray-900">{label}</span>
              </button>
            ))}
          </div>
          {/* "Already have an account?" link */}
          <div className="mt-12 text-center">
            <span className="text-sm text-gray-400">{nativeLang ? t.hasAccount : "Already have an account?"} </span>
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              {nativeLang ? t.login : "Log in"}
            </button>
          </div>
        </div>

        {/* Step 1: Learning Language */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 ${slideClass(1)}`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t.step2Title}</h1>
          <p className="text-gray-500 text-sm mb-10 text-center">{t.step2Subtitle}</p>
          <div className="w-full max-w-xs space-y-3">
            {learningLanguages.map(({ code, flag, label, available }) => (
              <button
                key={code}
                onClick={() => available && handleLearningSelect(code)}
                disabled={!available}
                className={`w-full rounded-2xl border-2 px-6 py-5 text-left transition-all ${
                  learningLang === code
                    ? "border-blue-500 bg-blue-50 scale-[0.98]"
                    : available
                    ? "border-gray-200 bg-white hover:border-gray-300"
                    : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{flag}</span>
                  <span className={`text-lg font-medium flex-1 ${available ? "text-gray-900" : "text-gray-400"}`}>
                    {label}
                  </span>
                  {!available && (
                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
                      {t.step2ComingSoon}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Display Name */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 ${slideClass(2)}`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t.step3Title}</h1>
          <p className="text-gray-500 text-sm mb-10 text-center">{t.step3Subtitle}</p>
          <div className="w-full max-w-xs space-y-4">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
              placeholder={t.step3Placeholder}
              autoFocus={step === 2}
              className="w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-5 text-lg text-gray-900 placeholder-gray-300 outline-none focus:border-blue-500 transition-colors text-center"
            />
            <button
              onClick={handleNameNext}
              disabled={!displayName.trim()}
              className="w-full rounded-2xl bg-blue-500 py-4 text-white font-semibold text-base transition-all hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t.step3Next}
            </button>
          </div>
        </div>

        {/* Step 3: Email + OTP Verification */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 ${slideClass(3)}`}>
          {emailSent ? (
            <div className="w-full max-w-sm text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.step4SentTitle}</h1>
              <p className="text-gray-500 text-sm mb-2">
                <span className="font-medium text-gray-700">{email}</span>
              </p>
              <p className="text-gray-500 text-sm mb-6">{t.step4SentDesc}</p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-5 text-2xl text-gray-900 placeholder-gray-300 outline-none focus:border-blue-500 transition-colors text-center tracking-[0.5em] font-mono"
                />
                {emailError && (
                  <p className="text-red-500 text-sm px-1 text-center">{emailError}</p>
                )}
                <button
                  type="submit"
                  disabled={otpVerifying || otp.length < 6}
                  className="w-full rounded-2xl bg-blue-500 py-4 text-white font-semibold text-base transition-all hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {otpVerifying ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t.step4Verifying}
                    </span>
                  ) : (
                    t.step4Verify
                  )}
                </button>
              </form>

              <button
                onClick={() => { setEmailSent(false); setEmail(""); setOtp(""); setEmailError(""); }}
                className="mt-8 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                {t.step4Retry}
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t.step4Title}</h1>
              <p className="text-gray-500 text-sm mb-10 text-center">{t.step4Subtitle}</p>
              <form onSubmit={handleEmailSubmit} className="w-full max-w-xs space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.step4Placeholder}
                  autoFocus={step === 3}
                  required
                  className="w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-5 text-lg text-gray-900 placeholder-gray-300 outline-none focus:border-blue-500 transition-colors text-center"
                />
                {emailError && (
                  <p className="text-red-500 text-sm px-1 text-center">{emailError}</p>
                )}
                <button
                  type="submit"
                  disabled={emailLoading || !email.trim()}
                  className="w-full rounded-2xl bg-blue-500 py-4 text-white font-semibold text-base transition-all hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {emailLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t.step4Sending}
                    </span>
                  ) : (
                    t.step4Send
                  )}
                </button>
              </form>
              <p className="mt-6 text-center text-xs text-gray-400 max-w-xs">
                {t.step4Note}
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
