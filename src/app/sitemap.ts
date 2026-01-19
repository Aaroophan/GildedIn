import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aaroophan.dev' || 'https://aaroophan.vercel.app'

    const routes = [
        '',
        '/Aaroophan',
        '/Aaroophan/About',
        '/Aaroophan/Projects',
        '/Aaroophan/Experience',
        '/Aaroophan/Education',
        '/Aaroophan/Contact',
        '/Aaroophan/Blog',
        '/Aaroophan/Technologies',
        '/Aaroophan/Reference'
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : route === '/Aaroophan' ? 0.9 : 0.8,
    }))

    return routes
}
