// Temporary page for the screens that are still being moved to the Sprint 4 API.
export function PlaceholderPage({ titulo }: { titulo: string }) {
  return (
    <div className="animate-fade-up">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">{titulo}</h1>
      <p className="mt-2 text-sm text-muted">Em construção.</p>
    </div>
  );
}
