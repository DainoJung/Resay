"use client";

export default function FeedbackSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Transcript skeleton */}
      <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
        <div className="h-3 w-20 bg-blue-200 rounded" />
        <div className="h-4 w-full bg-blue-100 rounded" />
        <div className="h-4 w-3/4 bg-blue-100 rounded" />
      </div>

      <div className="h-4 w-24 bg-gray-200 rounded" />

      {/* Feedback card skeletons */}
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-6 bg-gray-200 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-10 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-10 bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-100 rounded" />
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="h-3 w-full bg-gray-200 rounded mb-1" />
            <div className="h-3 w-2/3 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
