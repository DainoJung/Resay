"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  onTimeUpdate: (timeMs: number) => void;
}

function formatTime(ms: number): string {
  if (!isFinite(ms) || isNaN(ms)) return "--:--";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ audioUrl, onTimeUpdate }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // If it's a storage path (not a full URL), proxy through our API
  const src = audioUrl.startsWith("http") ? audioUrl : `/api/audio?path=${encodeURIComponent(audioUrl)}`;

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const timeMs = audio.currentTime * 1000;
    setCurrentTime(timeMs);
    onTimeUpdate(timeMs);
  }, [onTimeUpdate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => {
      const d = audio.duration;
      if (isFinite(d) && d > 0) setDuration(d * 1000);
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  }, []);

  const progress = duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
      <audio ref={audioRef} src={src} preload="metadata" onTimeUpdate={handleTimeUpdate} />

      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center flex-shrink-0"
      >
        {isPlaying ? (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="h-2 bg-gray-200 rounded-full cursor-pointer relative"
        >
          <div
            className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
        </div>
      </div>
    </div>
  );
}
