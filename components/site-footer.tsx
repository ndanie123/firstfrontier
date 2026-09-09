export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Electorate Atlas — a class project, not an official source.</p>
        <p>
          Boundaries &amp; members: Australian Electoral Commission · Demographics: ABS 2021
          Census
        </p>
      </div>
    </footer>
  );
}
