import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90, 92, 95],
  },
  async redirects() {
    return [
      {
        source: "/careers/backend-engineer-trading-systems",
        destination: "/careers/backend-developer",
        permanent: true,
      },
      {
        source: "/careers/frontend-engineer-trading-ui",
        destination: "/careers/frontend-developer",
        permanent: true,
      },
      {
        source: "/careers/finance-analyst",
        destination: "/careers/financial-analyst",
        permanent: true,
      },
      {
        source: "/careers/smart-contract-engineer",
        destination: "/careers",
        permanent: true,
      },
      {
        source: "/careers/smart-contract-developer",
        destination: "/careers",
        permanent: true,
      },
      {
        source: "/careers/trading-bot-systems-engineer",
        destination: "/careers",
        permanent: false,
      },
      {
        source: "/careers/payments-engineer",
        destination: "/careers",
        permanent: false,
      },
      {
        source: "/careers/risk-engineer",
        destination: "/careers",
        permanent: false,
      },
      {
        source: "/careers/defi-onchain-trader",
        destination: "/careers",
        permanent: false,
      },
      {
        source: "/careers/product-manager",
        destination: "/careers",
        permanent: false,
      },
      {
        source: "/careers/product-designer",
        destination: "/careers/ui-ux-designer",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
