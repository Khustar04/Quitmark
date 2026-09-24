export default function Skeleton({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-md bg-slate-200/70 dark:bg-white/[0.06] motion-reduce:animate-none ${className}`}
    />
  );
}
