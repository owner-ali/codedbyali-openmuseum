export default function PageFallback() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-neon" />
    </div>
  );
}
