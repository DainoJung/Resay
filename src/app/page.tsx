"use client";

import { useState } from "react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Feedback } from "@/types";
import RecordButton from "@/components/RecordButton";
import RecordingStatus from "@/components/RecordingStatus";
import FeedbackList from "@/components/FeedbackList";
import FeedbackSkeleton from "@/components/FeedbackSkeleton";
import EmptyState from "@/components/EmptyState";

type Status = "idle" | "recording" | "transcribing" | "analyzing" | "done" | "error";

export default function Home() {
  const { isRecording, duration, startRecording, stopRecording, error: recorderError } =
    useAudioRecorder();

  const [status, setStatus] = useState<Status>("idle");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    setFeedbacks([]);
    setTranscript("");
    setStatus("recording");
    await startRecording();
  };

  const handleStop = async () => {
    const blob = await stopRecording();
    if (!blob) {
      setStatus("idle");
      return;
    }

    try {
      // Step 1: Transcribe
      setStatus("transcribing");
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeData = await transcribeRes.json();
      if (!transcribeRes.ok) {
        throw new Error(transcribeData.error || "음성 변환 실패");
      }

      setTranscript(transcribeData.transcript);

      // Step 2: Get feedback
      setStatus("analyzing");
      const feedbackRes = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcribeData.transcript,
          audioUrl: transcribeData.audioUrl,
        }),
      });

      const feedbackData = await feedbackRes.json();
      if (!feedbackRes.ok) {
        throw new Error(feedbackData.error || "피드백 생성 실패");
      }

      setFeedbacks(feedbackData.feedbacks);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setStatus("error");
    }
  };

  const isProcessing = status === "transcribing" || status === "analyzing";
  const displayError = recorderError || error;

  const statusMessage: Record<string, string> = {
    transcribing: "음성을 텍스트로 변환 중...",
    analyzing: "AI가 피드백을 생성하는 중...",
  };

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-24 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Resay</h1>
      <p className="text-sm text-gray-400 mb-8">영어를 더 자연스럽게</p>

      {/* Record section */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <RecordButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onStart={handleStart}
          onStop={handleStop}
        />
        <RecordingStatus isRecording={isRecording} duration={duration} />
        {isProcessing && (
          <p className="text-sm text-gray-500 animate-pulse">
            {statusMessage[status]}
          </p>
        )}
      </div>

      {/* Error */}
      {displayError && (
        <div className="w-full max-w-md bg-red-50 text-red-700 text-sm rounded-xl p-4 mb-4">
          {displayError}
        </div>
      )}

      {/* Results */}
      <div className="w-full max-w-md">
        {isProcessing ? (
          <FeedbackSkeleton />
        ) : status === "done" ? (
          <FeedbackList feedbacks={feedbacks} transcript={transcript} />
        ) : status === "idle" && !displayError ? (
          <EmptyState
            title="영어로 말해보세요"
            description="녹음 버튼을 누르고 영어로 말한 뒤, AI 피드백을 받아보세요."
          />
        ) : null}
      </div>
    </div>
  );
}
