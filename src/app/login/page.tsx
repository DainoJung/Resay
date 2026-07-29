"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError("");

    // 코드(OTP) 방식에서 링크 방식으로 바꿨다.
    // 통합 허브는 이메일 템플릿이 프로젝트당 하나뿐이라 같은 프로젝트를 쓰는
    // 다른 앱(링크 방식)과 방식을 맞춰야 한다.
    //
    // emailRedirectTo 는 현재 오리진에서 계산한다. 도메인이 바뀌어도 그대로 동작하지만,
    // 이 값이 허브의 Redirect URLs 허용 목록에 없으면 Supabase 가 이를 버리고
    // Site URL 로 폴백해 엉뚱한 앱으로 착지한다.
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setStep("sent");
  };

  if (step === "sent") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            메일함을 확인해 주세요
          </h1>
          <p className="text-gray-500 text-sm mb-2">
            <span className="font-medium text-gray-700">{email}</span>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            로그인 링크를 보냈습니다. 메일의 링크를 누르면 바로 로그인됩니다.
          </p>

          {error && (
            <p className="text-red-500 text-sm px-1 mb-4">{error}</p>
          )}

          <button
            onClick={() => { setStep("email"); setError(""); }}
            className="mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            다른 이메일로 로그인
          </button>

          <p className="mt-3 text-xs text-gray-300">
            메일이 오지 않았다면 스팸함을 확인해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resay</h1>
          <p className="text-gray-500 text-sm">
            영어 회화를 녹음하고 AI 피드백을 받아보세요
          </p>
        </div>

        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              autoFocus
              required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors text-base"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-2xl bg-blue-500 py-4 text-white font-semibold text-base transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                전송 중...
              </span>
            ) : (
              "로그인 링크 받기"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          이메일로 전송되는 링크를 누르면 로그인됩니다.
          <br />
          비밀번호가 필요 없어요.
        </p>
      </div>
    </div>
  );
}
