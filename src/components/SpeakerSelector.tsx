"use client";

import { Utterance } from "@/types";
import { useLanguage } from "@/lib/i18n/context";

interface SpeakerSelectorProps {
  speakers: string[];
  utterances: Utterance[];
  onSelect: (speaker: string) => void;
}

export default function SpeakerSelector({
  speakers,
  utterances,
  onSelect,
}: SpeakerSelectorProps) {
  const { t } = useLanguage();

  // Show first utterance of each speaker as a preview
  const previews = speakers.map((speaker) => {
    const first = utterances.find((u) => u.speaker === speaker);
    return { speaker, preview: first?.text || "" };
  });

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">{t("speaker.title")}</h2>
        <p className="text-sm text-gray-400 mt-1">{t("speaker.description")}</p>
      </div>

      <div className="space-y-3">
        {previews.map(({ speaker, preview }) => (
          <button
            key={speaker}
            onClick={() => onSelect(speaker)}
            className="w-full text-left bg-white rounded-2xl border border-gray-200 p-4
                       hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                {speaker}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Speaker {speaker}</p>
                <p className="text-sm text-gray-700 truncate">&ldquo;{preview}&rdquo;</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
