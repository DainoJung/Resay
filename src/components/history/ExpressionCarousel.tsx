"use client";

import { useRef, useState, useEffect } from "react";
import ExpressionCard from "./ExpressionCard";

interface Expression {
  id?: string;
  keyword: string;
  meaning: string;
  example: string;
  highlightWord: string;
  saved?: boolean;
}

interface ExpressionCarouselProps {
  expressions: Expression[];
  onBookmarkToggle?: (id: string, saved: boolean) => void;
}

export default function ExpressionCarousel({ expressions, onBookmarkToggle }: ExpressionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const total = expressions.length;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.offsetWidth;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(index, total - 1));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [total]);

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {expressions.map((expr, i) => (
          <div key={expr.id || i} className="snap-center flex-shrink-0 w-full">
            <ExpressionCard
              id={expr.id}
              keyword={expr.keyword}
              meaning={expr.meaning}
              example={expr.example}
              highlightWord={expr.highlightWord}
              bookmarked={expr.saved}
              onBookmarkToggle={onBookmarkToggle}
            />
          </div>
        ))}
      </div>

      {total > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex gap-1.5">
            {expressions.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === activeIndex ? "bg-gray-900" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {activeIndex + 1} / {total}
          </span>
        </div>
      )}
    </div>
  );
}
