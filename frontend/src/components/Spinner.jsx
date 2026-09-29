export default function Spinner({ full = false }) {
  const spinner = (
    <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
  );
  if (!full) return spinner;
  return <div className="flex min-h-[60vh] items-center justify-center">{spinner}</div>;
}
