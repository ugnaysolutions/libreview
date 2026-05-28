import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LibreviewPH',
    short_name: 'Libreview',
    description: 'Free UPCAT reviewer for Filipino Grade 12 students.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#0D9488',
    background_color: '#F8FAFC',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
