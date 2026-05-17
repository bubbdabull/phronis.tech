import { ContactLeadForm } from "@/_components/sections/contact-lead-form";
import { SITE } from "@/_lib/site-content";

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-white/10 bg-phronis-surface/25 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_minmax(0,1.05fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-phronis-teal">
              Get in touch
            </p>
            <h2
              id="contact-heading"
              className="font-serif mt-3 text-3xl font-medium tracking-tight text-phronis-foreground sm:text-4xl"
            >
              Tell us what you want to build
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-phronis-muted sm:text-base">
              You do not need to know blockchain vocabulary. Share your goal, timeline, and who should be copied (legal,
              security, product). We reply to serious project inquiries.
            </p>
            <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-phronis-muted">Email</p>
              <a
                className="text-base font-medium text-phronis-teal underline-offset-4 hover:underline"
                href={`mailto:${SITE.contactEmail}`}
              >
                {SITE.contactEmail}
              </a>
            </div>
          </div>
          <div id="contact-form">
            <ContactLeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
