import type { Metadata } from "next";
import { notFound } from "next/navigation";

const DOCS: Record<string, { title: string; intro: string; body: string[] }> = {
  terms: {
    title: "Terms of Service",
    intro:
      "These terms govern your use of the Ocean Park Asset website. This is a Phase 1 informational site; full platform terms will be provided at account activation.",
    body: [
      "1. Acceptance. By accessing this website you agree to use it for lawful, informational purposes and accept these terms. If you do not agree, please do not use the site.",
      "2. Nature of content. The content here describes our AI trading, staking, and hybrid strategies. It is provided for general information only and does not constitute an offer, solicitation, recommendation, or financial, investment, legal, or tax advice.",
      "3. No guarantees. Nothing on this site guarantees any outcome or return. Digital-asset trading and staking carry substantial risk, including the possible loss of capital. Any indicative rates or figures are illustrative and subject to change.",
      "4. Eligibility. Services may not be available in all jurisdictions. It is your responsibility to ensure that your use complies with the laws applicable to you.",
      "5. Intellectual property. The Ocean Park Asset name, logo, visual assets, and site content are owned by Ocean Park Asset Management and may not be copied or reused without permission.",
      "6. Third-party data. Market data is sourced from third-party providers and is presented as-is; we do not warrant its accuracy or availability.",
      "7. Limitation of liability. To the maximum extent permitted by law, Ocean Park Asset is not liable for any loss arising from your use of, or reliance on, this website.",
      "8. Changes. We may update these terms as the platform evolves. Continued use of the site constitutes acceptance of the current version.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "We respect your privacy. This policy explains what information we collect through this website and how it is handled.",
    body: [
      "1. Information we collect. Information you voluntarily provide — such as your name, email, stated interest (early-access form), and any message you send (contact form).",
      "2. How we use it. To contact you about Ocean Park Asset, respond to enquiries, plan onboarding, and improve our services. We process this information based on your consent and our legitimate interest in operating the business.",
      "3. Sharing. We do not sell your personal information. We may share it with service providers (for example, our email provider) strictly to deliver the communications you requested.",
      "4. Market data. Prices and charts shown on this site come from public market APIs and contain no personal data.",
      "5. Retention. We keep your contact details only as long as necessary for the purposes above or until you ask us to remove them.",
      "6. Your rights. You may request access to, correction of, or deletion of your personal information, and you may unsubscribe at any time. Contact contact@oceanparkasset.com.",
      "7. Security. We apply reasonable technical and organizational measures to protect the information you provide.",
    ],
  },
  risk: {
    title: "Risk Disclosure",
    intro:
      "Please read this disclosure carefully before considering any Ocean Park Asset strategy.",
    body: [
      "1. Capital at risk. Trading and staking digital assets involves substantial risk, including the possible loss of the entire capital you allocate. Cryptocurrency markets are highly volatile.",
      "2. No guaranteed returns. Staking yields are variable and depend on network conditions; they are never fixed or guaranteed. Trading results depend on market conditions and are not guaranteed.",
      "3. Risk controls are not a guarantee. Our automated risk controls (stop-losses, exposure limits, drawdown protection and others) are designed to manage risk but cannot eliminate it, and may not prevent losses in all conditions.",
      "4. Past performance. Past performance and validation testing (backtesting, forward testing, stress testing) do not guarantee future results.",
      "5. Not advice. Nothing on this website is financial, investment, legal, or tax advice. Consider seeking independent advice.",
      "6. Suitability. Only allocate capital you can afford to expose to risk, and only if these strategies are suitable for your circumstances.",
    ],
  },
  cookies: {
    title: "Cookie Policy",
    intro:
      "This policy explains how Ocean Park Asset uses cookies and similar technologies on this website.",
    body: [
      "1. What cookies are. Small text files stored on your device that help a website function and remember preferences.",
      "2. What we use. This Phase 1 site uses only essential cookies required for the site to work. We do not currently run advertising cookies.",
      "3. Analytics. If we introduce privacy-friendly analytics in future, we will update this policy and, where required, request your consent.",
      "4. Managing cookies. You can control or delete cookies through your browser settings. Disabling essential cookies may affect how the site works.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = DOCS[slug];
  return { title: doc?.title ?? "Legal" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-3xl">
        <div className="eyebrow mb-3">Legal</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">{doc.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-dim">{doc.intro}</p>
        <div className="hairline my-8" />
        <div className="space-y-5">
          {doc.body.map((p, i) => (
            <p key={i} className="leading-relaxed text-ink-dim">
              {p}
            </p>
          ))}
        </div>
        <p className="mt-10 text-xs text-ink-mute">Last updated: {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
