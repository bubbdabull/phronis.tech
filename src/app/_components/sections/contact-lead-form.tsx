"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm, type Resolver } from "react-hook-form";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Textarea } from "@/_components/ui/textarea";
import { leadFormSchema, type LeadFormValues } from "@/_lib/contact-schema";
import { SITE } from "@/_lib/site-content";
import { useReducedMotion } from "@/_hooks/use-reduced-motion";

export function ContactLeadForm() {
  const reduced = useReducedMotion();
  const [postSubmitHelp, setPostSubmitHelp] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema) as Resolver<LeadFormValues>,
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      role: "",
      message: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const messageLen = form.watch("message").length;

  const onSubmit = form.handleSubmit(async (values) => {
    setPostSubmitHelp(false);
    const subject = encodeURIComponent(`Phronis consultation · ${values.organization}`);
    const body = encodeURIComponent(
      [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Organization: ${values.organization}`,
        `Role: ${values.role}`,
        "",
        values.message,
      ].join("\n"),
    );
    window.location.href = `mailto:${SITE.contactEmail}?subject=${subject}&body=${body}`;
    setPostSubmitHelp(true);
  });

  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-8 rounded-xl border border-phronis-border bg-phronis-surface/40 p-6 shadow-inner sm:p-8"
      noValidate
      aria-describedby="contact-form-description"
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
    >
      <p id="contact-form-description" className="text-sm leading-relaxed text-phronis-muted">
        This opens your email app with your answers filled in. Nothing is sent until you press send in that app.
      </p>
      <div className="space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-phronis-muted">Your details</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-xs font-medium text-red-400" role="alert">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-describedby={
              form.formState.errors.email ? "email-hint email-error" : "email-hint"
            }
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          <p id="email-hint" className="text-xs text-phronis-muted">
            We reply to this address.
          </p>
          {form.formState.errors.email ? (
            <p id="email-error" className="text-xs font-medium text-red-400" role="alert">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            autoComplete="organization"
            aria-invalid={!!form.formState.errors.organization}
            {...form.register("organization")}
          />
          {form.formState.errors.organization ? (
            <p className="text-xs font-medium text-red-400" role="alert">
              {form.formState.errors.organization.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role / title</Label>
          <Input id="role" autoComplete="organization-title" aria-invalid={!!form.formState.errors.role} {...form.register("role")} />
          {form.formState.errors.role ? (
            <p className="text-xs font-medium text-red-400" role="alert">
              {form.formState.errors.role.message}
            </p>
          ) : null}
        </div>
      </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-phronis-muted">About the project</h3>
        <div className="space-y-2">
          <Label htmlFor="message">What you want to build</Label>
          <Textarea
            id="message"
            rows={6}
            placeholder="Goal, timeline, and who should be on the thread (legal, security, product). Everyday language is fine."
            aria-invalid={!!form.formState.errors.message}
            {...form.register("message")}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs tabular-nums text-phronis-muted">
              {messageLen} / 4000
            </p>
            {form.formState.errors.message ? (
              <p className="text-xs font-medium text-red-400" role="alert">
                {form.formState.errors.message.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div
        aria-live="polite"
        className="rounded-lg border border-phronis-border/80 bg-phronis-elevated/25 px-4 py-3 min-h-[3rem]"
      >
        {postSubmitHelp ? (
          <p className="text-sm leading-relaxed text-phronis-teal" role="status">
            If your mail app opened, send the message from there. If nothing happened, copy your note and email{" "}
            <a className="font-medium underline underline-offset-2 hover:text-phronis-foreground" href={`mailto:${SITE.contactEmail}`}>
              {SITE.contactEmail}
            </a>
            , or use Start over below when you are finished.
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-phronis-muted">
            Tip: keep this tab open until your draft appears in your mail app.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Opening email…" : "Open in email app"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              setPostSubmitHelp(false);
              form.reset({
                name: "",
                email: "",
                organization: "",
                role: "",
                message: "",
              });
            }}
          >
            Start over
          </Button>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-phronis-muted sm:text-right">
          By continuing, you agree we may contact you about this inquiry only. We do not use this form for marketing lists.
        </p>
      </div>
    </motion.form>
  );
}
