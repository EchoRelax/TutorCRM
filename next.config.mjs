/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["postgres"],
  // Type-check и lint выполняем отдельными командами (npm run typecheck / lint),
  // поэтому внутри next build их пропускаем — это сильно ускоряет сборку на VDS.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  turbopack: {},
  webpack: (config) => {
    if (config.cache && typeof config.cache === "object") {
      config.cache = {
        ...config.cache,
        type: "filesystem",
        maxSize: 64 * 1024 * 1024,
        maxAge: 1000 * 60 * 60,
      };
    }
    return config;
  },
};

export default nextConfig;
