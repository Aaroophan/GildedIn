import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'GildedIn Portfolio Platform',
        short_name: 'GildedIn',
        description: 'Instant, no-code portfolio creation platform.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000e23',
        theme_color: '#0f73ff',
        icons: [
            {
                src: '/images/Aaroophan-Main.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
