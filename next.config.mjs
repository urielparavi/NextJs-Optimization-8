/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enables Next.js to optimize images loaded from Cloudinary by allowing this external hostname
    remotePatterns: [{ hostname: 'res.cloudinary.com' }],
  },
};

export default nextConfig;
