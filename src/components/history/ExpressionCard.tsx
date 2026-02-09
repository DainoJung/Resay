"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";

interface ExpressionCardProps {
  id?: string;
  keyword: string;
  meaning: string;
  example: string;
  highlightWord: string;
  bookmarked?: boolean;
  onBookmarkToggle?: (id: string, saved: boolean) => void;
}

function highlightText(text: string, highlight: string) {
  const index = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (index === -1) return <span>{text}</span>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + highlight.length);
  const after = text.slice(index + highlight.length);

  return (
    <span>
      {before}
      <span className="bg-emerald-100 text-emerald-700 px-0.5 rounded">
        {match}
      </span>
      {after}
    </span>
  );
}

export default function ExpressionCard({
  id,
  keyword,
  meaning,
  example,
  highlightWord,
  bookmarked: initialBookmarked = false,
  onBookmarkToggle,
}: ExpressionCardProps) {
  const { ttsVoice, ttsStyle } = useLanguage();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: keyword, voice: ttsVoice, style: ttsStyle }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setPlaying(false);
        audioRef.current = null;
        URL.revokeObjectURL(url);
      };

      setPlaying(true);
      await audio.play();
    } catch (err) {
      console.error("TTS playback error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = () => {
    const newValue = !bookmarked;
    setBookmarked(newValue);
    if (id && onBookmarkToggle) {
      onBookmarkToggle(id, newValue);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      {/* Quote + bookmark on same row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="border-l-[3px] border-emerald-500 pl-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{keyword}</span>
            <button
              onClick={handlePlay}
              disabled={loading}
              className={`transition-colors ${
                playing ? "text-blue-500" : loading ? "text-gray-300" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{meaning}</p>
        </div>
        <button
          onClick={handleBookmark}
          className={`${bookmarked ? "text-emerald-500" : "text-gray-400"} hover:text-emerald-500 transition-colors flex-shrink-0 mt-0.5`}
        >
          <svg
            className="w-5 h-5"
            fill={bookmarked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={bookmarked ? 0 : 2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
      {/* Example */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {highlightText(example, highlightWord)}
      </p>
    </div>
  );
}
