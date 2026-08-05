import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Newsluma Privacy Policy — how we collect, use and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[820px] px-4 py-10 md:py-14">
      <h1 className="text-3xl md:text-4xl font-black text-textc tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-mutedc mt-2">Last updated: August 5, 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-textc/90">
        <Section title="1. Information We Collect">
          <p>
            Newsluma collects minimal data to operate and improve the service:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5">
            <li><b>Usage analytics</b> — page views, device type, browser, approximate country and referring site. Collected only if you accept the cookie consent banner.</li>
            <li><b>Comments</b> — the name and message you voluntarily submit on articles.</li>
            <li><b>Technical logs</b> — IP address and user agent are briefly processed by our servers and CDN for security and delivery purposes.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Data">
          <p>
            We use the data to display the site, measure traffic trends, protect against abuse,
            and show you relevant content. We do <b>not</b> sell your personal data.
          </p>
        </Section>

        <Section title="3. Cookies">
          <p>
            We use a small set of cookies and local storage: a session identifier for analytics
            (only after consent) and your theme/consent preferences. See our{" "}
            <Link href="/cookies" className="text-brand underline">Cookie Policy</Link> for details.
          </p>
        </Section>

        <Section title="4. Third Parties">
          <p>
            Our hosting and CDN provider (Cloudflare) processes requests on our behalf and may set
            its own security cookies. Article images may be served from third-party CDNs.
          </p>
        </Section>

        <Section title="5. Your Rights">
          <p>
            You may decline analytics at any time via the consent banner or by clearing your
            browser storage. To request deletion of a comment or personal data, contact us and we
            will act promptly.
          </p>
        </Section>

        <Section title="6. Contact">
          <p>
            Questions about this policy? Contact us at <b>admin@fermag.com.tr</b>.
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
