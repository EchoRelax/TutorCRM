/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  serverExternalPackages: ["postgres"],
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
