import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Newsluma Terms of Service — rules for using our news platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[820px] px-4 py-10 md:py-14">
      <h1 className="text-3xl md:text-4xl font-black text-textc tracking-tight">Terms of Service</h1>
      <p className="text-sm text-mutedc mt-2">Last updated: August 5, 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-textc/90">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Newsluma (newsluma.com), you agree to these Terms of Service.
            If you do not agree, please do not use the site.
          </p>
        </Section>

        <Section title="2. Content">
          <p>
            Articles on Newsluma are provided for general information purposes. We aggregate and
            summarize news from public sources; we do not guarantee accuracy, completeness or
            timeliness. Headlines and summaries may not reflect the full context of the original
            reporting.
          </p>
        </Section>

        <Section title="3. Comments">
          <p>
            You are responsible for the comments you post. We reserve the right to remove any
            comment that is illegal, abusive, defamatory, spam, or otherwise inappropriate, and to
            ban users who repeatedly violate this rule.
          </p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>
            You may not use the site to: distribute malware, attempt unauthorized access, scrape
            the site at scale in a way that disrupts service, or impersonate others.
          </p>
        </Section>

        <Section title="5. Intellectual Property">
          <p>
            The Newsluma name, logo and site design are our property. Article content belongs to
            its original sources and is used for commentary and news reporting purposes.
          </p>
        </Section>

        <Section title="6. Limitation of Liability">
          <p>
            Newsluma is provided &quot;as is&quot; without warranties of any kind. To the maximum
            extent permitted by law, we are not liable for any damages arising from your use of
            the site or reliance on its content.
          </p>
        </Section>

        <Section title="7. Changes">
          <p>
            We may update these terms from time to time. Continued use of the site after changes
            constitutes acceptance of the revised terms.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-extrabold text-textc mb-2">{title}</h2>
      {children}
    </section>
  );
}
