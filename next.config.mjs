/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: ["images.unsplash.com", "via.placeholder.com", "lh3.googleusercontent.com"]
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb'
        }
    },
    // PWA Configuration
    async headers() {
        return [
            {
                source: '/manifest.json',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/manifest+json',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                ],
            },
            {
                source: '/icons/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/v2/sw.js',
                destination: '/sw.js',
            },
            {
                source: '/v2/manifest.json',
                destination: '/manifest.json',
            },
        ];
    },
};

export default nextConfig;
