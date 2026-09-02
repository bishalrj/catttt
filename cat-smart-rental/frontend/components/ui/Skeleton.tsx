import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`cat-skeleton ${className}`} style={style} />;
}

export function SkeletonKPICard() {
  return (
    <div className="cat-stat-card space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="cat-skeleton-text" style={{ width: "55%" }} />
        <Skeleton style={{ width: 32, height: 32, borderRadius: 6 }} />
      </div>
      <Skeleton className="cat-skeleton-stat" />
      <Skeleton className="cat-skeleton-text" style={{ width: "35%", marginTop: 8 }} />
    </div>
  );
}

export function SkeletonTableRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            className="cat-skeleton-text"
            style={{ width: i === 0 ? "80px" : i === cols - 1 ? "60px" : "100%" }}
          />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="cat-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton style={{ width: 40, height: 40, borderRadius: 8 }} />
        <div className="flex-1 space-y-2">
          <Skeleton className="cat-skeleton-text" style={{ width: "40%" }} />
          <Skeleton className="cat-skeleton-text" style={{ width: "60%" }} />
        </div>
      </div>
      <Skeleton className="cat-skeleton-text" style={{ width: "100%" }} />
      <Skeleton className="cat-skeleton-text" style={{ width: "80%" }} />
      <div className="flex gap-2 mt-2">
        <Skeleton style={{ width: 80, height: 28, borderRadius: 6 }} />
        <Skeleton style={{ width: 60, height: 28, borderRadius: 6 }} />
      </div>
    </div>
  );
}

export function SkeletonChatBubble({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Skeleton style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
      <div className={`space-y-2 ${isUser ? "items-end" : ""}`} style={{ maxWidth: "70%" }}>
        <Skeleton style={{ height: 80, borderRadius: 10, width: "100%" }} />
      </div>
    </div>
  );
}
