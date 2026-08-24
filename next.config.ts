import type { NextConfig } from "next";

const supabaseHost = (() => {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    return undefined;
  }
  try {
    return new URL(value).hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
