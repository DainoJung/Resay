"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth/context";

type Step = 0 | 1 | 2 | 3;

const nativeLanguages = [
  { code: "ko", flag: "\uD83C\uDDF0\uD83C\uDDF7", label: "\uD55C\uAD6D\uC5B4" },
  { code: "ja", flag: "\uD83C\uDDEF\uD83C\uDDF5", label: "\u65E5\u672C\u8A9E" },
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
    step4Title: "Resay\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4!",
    step4Desc1: "\uC601\uC5B4 \uD1B5\uD654\uB97C \uB179\uC74C\uD558\uBA74",
    step4Desc2: "AI\uAC00 \uC790\uC5F0\uC2A4\uB7EC\uC6B4 \uD45C\uD604\uC73C\uB85C \uBC14\uAFD4\uC8FC\uACE0",
    step4Desc3: "\uB098\uC5D0\uAC8C \uB531 \uB9DE\uB294 \uD45C\uD604\uC744 \uCD94\uCC9C\uD574 \uC90D\uB2C8\uB2E4.",
    step4Start: "\uC2DC\uC791\uD558\uAE30",
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
    step4Title: "Resay\u3078\u3088\u3046\u3053\u305D\uFF01",
    step4Desc1: "\u82F1\u8A9E\u306E\u4F1A\u8A71\u3092\u9332\u97F3\u3059\u308B\u3068",
    step4Desc2: "AI\u304C\u81EA\u7136\u306A\u8868\u73FE\u306B\u76F4\u3057\u3066\u304F\u308C\u3066",
    step4Desc3: "\u3042\u306A\u305F\u306B\u3074\u3063\u305F\u308A\u306E\u8868\u73FE\u3092\u304A\u3059\u3059\u3081\u3057\u307E\u3059\u3002",
    step4Start: "\u59CB\u3081\u308B",
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [nativeLang, setNativeLang] = useState<string>("");
  const [learningLang, setLearningLang] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  const lang = (nativeLang === "ja" ? "ja" : "ko") as "ko" | "ja";
  const t = labels[lang];

  const goTo = useCallback((nextStep: Step) => {
    setDirection(nextStep > step ? "forward" : "backward");
    setStep(nextStep);
  }, [step]);

  const handleNativeSelect = (code: string) => {
    setNativeLang(code);
    setTimeout(() => goTo(1), 200);
  };

  const handleLearningSelect = (code: string) => {
    setLearningLang(code);
    setTimeout(() => goTo(2), 200);
  };

  const handleNameNext = () => {
    if (displayName.trim()) {
      goTo(3);
    }
  };

  const handleComplete = async () => {
    if (saving || !user) return;
    setSaving(true);

    await supabase
      .from("profiles")
      .update({
        native_language: nativeLang || "ko",
        learning_language: learningLang || "en",
        display_name: displayName.trim() || null,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    await refreshProfile();
    router.replace("/");
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
      {step > 0 && (
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
        {/* Step 1: Native Language */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 ${slideClass(0)}`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {nativeLang ? t.step1Title : "\uBAA8\uAD6D\uC5B4\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694"}
          </h1>
          <p className="text-gray-500 text-sm mb-10 text-center">
            {nativeLang ? t.step1Subtitle : "\uC571\uC744 \uC5B4\uB5A4 \uC5B8\uC5B4\uB85C \uD45C\uC2DC\uD560\uAE4C\uC694?"}
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
        </div>

        {/* Step 2: Learning Language */}
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

        {/* Step 3: Display Name */}
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

        {/* Step 4: App Introduction */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-8 ${slideClass(3)}`}>
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t.step4Title}</h1>
          <div className="text-center text-gray-500 text-sm space-y-1 mb-10">
            <p>{t.step4Desc1}</p>
            <p>{t.step4Desc2}</p>
            <p>{t.step4Desc3}</p>
          </div>
          <div className="w-full max-w-xs">
            <button
              onClick={handleComplete}
              disabled={saving}
              className="w-full rounded-2xl bg-blue-500 py-4 text-white font-semibold text-base transition-all hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              ) : (
                t.step4Start
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
