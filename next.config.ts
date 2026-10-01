import type { NextConfig } from "next";
const apiBase = process.env.NEXT_PUBLIC_PLATFORM_API_BASE_URL;
const nextConfig: NextConfig = { async rewrites() { return apiBase?.startsWith("http://127.0.0.1") ? [{ source: "/v1/:path*", destination: `${apiBase}/v1/:path*` }] : []; } };
export default nextConfig;
