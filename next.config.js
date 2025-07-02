/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
    // i18n: {
    //     locales: ['fa','en' , 'bn' , 'ar' , 'tr' , 'ps' , 'ge' , 'hi' ],
    //     defaultLocale: 'en', // Set the default locale
    //     localeDetection: false,
    // },
    reactStrictMode: false,
    localePath: path.resolve('./public/locales'),
    experimental: {
        metadataBase: new URL(process.env.NEXT_PUBLIC_METADATA_BASE || 'http://localhost:3000'),

    },
}

module.exports = nextConfig
