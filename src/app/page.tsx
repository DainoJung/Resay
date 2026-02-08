"use client";

import { useState } from "react";
import Link from "next/link";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Feedback, Utterance } from "@/types";
import RecordButton from "@/components/RecordButton";
import RecordingStatus from "@/components/RecordingStatus";
import SpeakerSelector from "@/components/SpeakerSelector";
import ChatView from "@/components/ChatView";
import FeedbackSkeleton from "@/components/FeedbackSkeleton";
import { useLanguage } from "@/lib/i18n/context";

type Status =
  | "idle"
  | "recording"
  | "transcribing"
  | "selecting-speaker"
  | "analyzing"
  | "done"
  | "error";

export default function Home() {
  const { isRecording, duration, startRecording, stopRecording, error: recorderError } =
    useAudioRecorder();
  const { t, lang, userName } = useLanguage();

  const [status, setStatus] = useState<Status>("idle");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [mySpeaker, setMySpeaker] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    setFeedbacks([]);
    setUtterances([]);
    setSpeakers([]);
    setMySpeaker("");
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
      // Step 1: Transcribe with speaker labels
      setStatus("transcribing");
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeData = await transcribeRes.json();
      if (!transcribeRes.ok) {
        throw new Error(transcribeData.error || t("error.transcribeFailed"));
      }

      setTranscript(transcribeData.transcript);
      setUtterances(transcribeData.utterances);
      setSpeakers(transcribeData.speakers);
      setAudioUrl(transcribeData.audioUrl);

      // If only one speaker, skip selection
      if (transcribeData.speakers.length <= 1) {
        const speaker = transcribeData.speakers[0] || "A";
        setMySpeaker(speaker);
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
    setMySpeaker(speaker);
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
        }),
      });

      const feedbackData = await feedbackRes.json();
      if (!feedbackRes.ok) {
        throw new Error(feedbackData.error || t("error.feedbackFailed"));
      }

      setFeedbacks(feedbackData.feedbacks);
      setStatus("done");
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
        {/* Partner name */}
        <h1 className="text-3xl font-bold italic text-gray-900 mt-20">
          {userName}
        </h1>

        {/* Recording status (timer) */}
        {status === "recording" && (
          <div className="mb-4">
            <RecordingStatus isRecording={isRecording} duration={duration} />
          </div>
        )}

        {/* Processing spinner */}
        {isProcessing && (
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 animate-pulse">
              {statusMessage[status]}
            </p>
          </div>
        )}

        {/* Error */}
        {displayError && (
          <div className="w-full max-w-md bg-red-50 text-red-700 text-sm rounded-xl p-4 mb-4">
            {displayError}
          </div>
        )}

        {/* Results area */}
        <div className="w-full max-w-md">
          {status === "transcribing" && <FeedbackSkeleton />}

          {status === "selecting-speaker" && (
            <SpeakerSelector
              speakers={speakers}
              utterances={utterances}
              onSelect={handleSpeakerSelect}
            />
          )}

          {status === "analyzing" && <FeedbackSkeleton />}

          {status === "done" && (
            <>
              <ChatView
                utterances={utterances}
                mySpeaker={mySpeaker}
                feedbacks={feedbacks}
              />
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleStart}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {t("action.recordAgain")}
                </button>
              </div>
            </>
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
    </div>
  );
}
