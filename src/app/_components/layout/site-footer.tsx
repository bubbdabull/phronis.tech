import Link from "next/link";

import { FOOTER_HOME_ANCHORS, SITE, SITE_SOCIAL_LINKS } from "@/_lib/site-content";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-phronis-void">
      <div className="gutter-safe mx-auto max-w-6xl min-w-0 pt-12 pb-[calc(3rem+env(safe-area-inset-bottom,0px))]">
        <div>
          <p className="font-semibold tracking-tight text-phronis-foreground">{SITE.legalName}</p>
          <a
            className="mt-1 inline-block font-mono text-sm text-phronis-teal underline-offset-4 hover:underline"
            href={`mailto:${SITE.contactEmail}`}
          >
            {SITE.contactEmail}
          </a>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <Link
              className="text-sm text-phronis-muted underline-offset-4 transition-colors hover:text-phronis-teal hover:underline"
              href="/business"
            >
              Business
            </Link>
            <Link
              className="text-sm text-phronis-muted underline-offset-4 transition-colors hover:text-phronis-teal hover:underline"
              href="/business#contact"
            >
              Contact
            </Link>
            <Link
              href="/members"
              className="text-sm text-phronis-muted underline-offset-4 transition-colors hover:text-phronis-teal hover:underline"
            >
              Members
            </Link>
            <Link
              href="/member"
              className="text-sm text-phronis-muted underline-offset-4 transition-colors hover:text-phronis-teal hover:underline"
            >
              Workspace
            </Link>
            <Link
              className="text-sm text-phronis-muted underline-offset-4 transition-colors hover:text-phronis-teal hover:underline"
              href="/members#auth"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-3 text-xs text-phronis-muted">
            <span className="font-medium text-phronis-foreground/80">Business site:</span>{" "}
            {FOOTER_HOME_ANCHORS.map((item, i) => (
              <span key={item.id}>
                {i > 0 ? " · " : null}
                <Link
                  className="underline-offset-4 transition-colors hover:text-phronis-teal hover:underline"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {SITE_SOCIAL_LINKS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-phronis-muted underline-offset-4 transition-colors hover:text-phronis-teal hover:underline"
              >
                {item.label}
              </a>
            ))}
          </p>
        </div>
        <p className="mt-8 font-mono text-[11px] text-phronis-muted">© {year} {SITE.legalName}</p>
      </div>
    </footer>
  );
}
