import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border-2 border-foreground bg-primary text-primary-foreground text-sm font-bold shadow-[2px_2px_0_0_var(--foreground)]">
            V
          </span>
          <span className="font-comic text-xl tracking-wide">Electorate Atlas</span>
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
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
