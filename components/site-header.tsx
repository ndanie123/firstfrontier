import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm">
            V
          </span>
          <span>Electorate Atlas</span>
          <span className="hidden text-sm font-normal text-muted-foreground sm:inline">
            Victoria
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/divisions" className="transition-colors hover:text-foreground">
            Divisions
          </Link>
          <Link href="/map" className="transition-colors hover:text-foreground">
            Map
          </Link>
        </nav>
      </div>
    </header>
  );
}
