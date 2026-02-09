"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Utterance } from "@/types";
import RecordButton from "@/components/RecordButton";
import RecordingStatus from "@/components/RecordingStatus";
import SpeakerSelector from "@/components/SpeakerSelector";
import ProcessingScreen from "@/components/ProcessingScreen";
import { useLanguage } from "@/lib/i18n/context";

type Status =
  | "idle"
  | "recording"
  | "transcribing"
  | "selecting-speaker"
  | "analyzing"
  | "error";

export default function Home() {
  const router = useRouter();
  const { isRecording, duration, startRecording, stopRecording, error: recorderError } =
    useAudioRecorder();
  const { t, lang, userName } = useLanguage();

  const [status, setStatus] = useState<Status>("idle");
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const handleStart = async () => {
    setError(null);
    setUtterances([]);
    setSpeakers([]);
    setTranscript("");
    setStatus("recording");
    await startRecording();
  };

  const handleStop = async () => {
    if (duration < 2) {
      setShowStopConfirm(true);
      return;
    }
    await processRecording();
  };

  const handleConfirmStop = async () => {
    setShowStopConfirm(false);
    await stopRecording();
    setStatus("idle");
  };

  const processRecording = async () => {
    const blob = await stopRecording();
    if (!blob) {
      setStatus("idle");
      return;
    }

    try {
      // Step 1: Transcribe with speaker labels
      setStatus("transcribing");
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("aac") ? "aac" : "webm";
      const formData = new FormData();
      formData.append("audio", blob, `recording.${ext}`);
      formData.append("duration", String(duration));

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeData = await transcribeRes.json();
      if (!transcribeRes.ok) {
        if (transcribeData.sessionId) {
          router.push("/history");
          setStatus("idle");
          return;
        }
        const serverError = transcribeData.error || "";
        if (serverError.includes("no spoken audio") || serverError.includes("Could not recognize speech")) {
          throw new Error(t("error.noSpeech"));
        }
        throw new Error(t("error.transcribeFailed"));
      }

      setTranscript(transcribeData.transcript);
      setUtterances(transcribeData.utterances);
      setSpeakers(transcribeData.speakers);
      setAudioUrl(transcribeData.audioUrl);

      // If only one speaker, skip selection
      if (transcribeData.speakers.length <= 1) {
        const speaker = transcribeData.speakers[0] || "A";
        await fetchFeedback(
          transcribeData.transcript,
          transcribeData.utterances,
          speaker,
          transcribeData.audioUrl
        );
      } else {
        setStatus("selecting-speaker");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
      setStatus("error");
    }
  };

  const handleSpeakerSelect = async (speaker: string) => {
    await fetchFeedback(transcript, utterances, speaker, audioUrl);
  };

  const fetchFeedback = async (
    transcriptText: string,
    utts: Utterance[],
    speaker: string,
    aUrl: string | null
  ) => {
    try {
      setStatus("analyzing");
      const feedbackRes = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptText,
          utterances: utts,
          mySpeaker: speaker,
          audioUrl: aUrl,
          lang,
          duration,
        }),
      });

      const feedbackData = await feedbackRes.json();
      if (!feedbackRes.ok) {
        throw new Error(feedbackData.error || t("error.feedbackFailed"));
      }

      router.push(`/history?id=${feedbackData.sessionId}`);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
      setStatus("error");
    }
  };

  const isProcessing = status === "transcribing" || status === "analyzing";
  const displayError = recorderError || error;

  const statusMessage: Record<string, string> = {
    transcribing: t("status.transcribing"),
    analyzing: t("status.analyzing"),
  };

  const showRecordButton =
    status === "idle" || status === "recording" || status === "error";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top bar: streak badge + profile icon */}
      <div className="flex items-center justify-end px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Center content area */}
      <div className="flex-1 flex flex-col items-center justify-top px-4 pb-40">
        {/* Partner name - hide during processing */}
        {!isProcessing && status !== "selecting-speaker" && (
          <h1 className="text-3xl font-bold italic text-gray-900 mt-20">
            {userName}
          </h1>
        )}

        {/* Recording status (timer) */}
        {status === "recording" && (
          <div className="mb-4">
            <RecordingStatus isRecording={isRecording} duration={duration} />
          </div>
        )}

        {/* Processing screen */}
        {isProcessing && (
          <ProcessingScreen
            stage={status as "transcribing" | "analyzing"}
            stageLabel={statusMessage[status]}
          />
        )}

        {/* Error */}
        {displayError && (
          <div className="w-full max-w-md bg-red-50 text-red-700 text-sm rounded-xl p-4 mb-4">
            {displayError}
          </div>
        )}

        {/* Results area */}
        <div className="w-full max-w-md">
          {status === "selecting-speaker" && (
            <SpeakerSelector
              speakers={speakers}
              utterances={utterances}
              onSelect={handleSpeakerSelect}
            />
          )}
        </div>
      </div>

      {/* Fixed record button at bottom center */}
      {showRecordButton && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10">
          <RecordButton
            isRecording={isRecording}
            isProcessing={isProcessing}
            onStart={handleStart}
            onStop={handleStop}
          />
        </div>
      )}

      {/* History nav */}
      {!isProcessing && status !== "selecting-speaker" && (
        <nav className="fixed bottom-0 left-0 right-0 safe-area-bottom z-0">
          <div className="flex items-end justify-end max-w-md mx-auto px-6 py-2">
            <Link
              href="/history"
              className="flex flex-col items-center py-2 px-4 text-gray-400"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-4 4 4 4-8" />
              </svg>
              <span className="text-xs mt-0.5">{t("nav.history")}</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Stop confirmation popup */}
      {showStopConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <p className="text-base font-semibold text-gray-900 text-center mb-2">
              {t("record.stopConfirmTitle")}
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              {t("record.stopConfirmDesc")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStopConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {t("record.continueRecording")}
              </button>
              <button
                onClick={handleConfirmStop}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                {t("record.stopRecording")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
