import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Newsluma Cookie Policy — what cookies we use and how you can control them.",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-[820px] px-4 py-10 md:py-14">
      <h1 className="text-3xl md:text-4xl font-black text-textc tracking-tight">Cookie Policy</h1>
      <p className="text-sm text-mutedc mt-2">Last updated: August 5, 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-textc/90">
        <Section title="What are cookies?">
          <p>
            Cookies are small text files stored in your browser. They help websites remember your
            preferences and understand how the site is used.
          </p>
        </Section>

        <Section title="Cookies we use">
          <ul className="list-disc pl-5 space-y-2">
            <li><b>Consent preference</b> (<code>tn_consent</code>) — remembers your cookie choice so we don&apos;t ask again.</li>
            <li><b>Session identifier</b> (<code>tn_sid</code>) — used only for anonymous visit counting, and only if you accepted analytics.</li>
            <li><b>Theme preference</b> — remembers dark/light mode.</li>
            <li><b>Security cookies</b> — set by our CDN (Cloudflare) to protect the site.</li>
          </ul>
          <p className="mt-2">
            We do <b>not</b> use advertising cookies, tracking pixels or cross-site trackers.
          </p>
        </Section>

        <Section title="Managing cookies">
          <p>
            You can change your choice at any time by clearing your browser storage, or use your
            browser&apos;s cookie settings to block or delete cookies. Note that blocking essential
            cookies may affect site functionality.
          </p>
        </Section>

        <Section title="More information">
          <p>
            See our <Link href="/privacy" className="text-brand underline">Privacy Policy</Link> for
            details about how we handle your data, or{" "}
            <Link href="/terms" className="text-brand underline">Terms of Service</Link> for usage rules.
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
