'use client';

import { appWithTranslation } from 'next-i18next';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import '../styles/fonts.scss';
import '../styles/globals-v2.css';
import '../styles/waslat-prime-bridge.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import { ReactNode } from 'react';
import '../i18n';
import { useTranslation } from 'react-i18next';
import { QueryProvider } from '@/components/providers/query-provider';
import { DEFAULT_LOCALE, isRtlLocale } from '@/lib/locale';

interface RootLayoutProps {
    children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps): JSX.Element => {
    const { i18n } = useTranslation();
    const language = i18n.language || DEFAULT_LOCALE;
    const dir = isRtlLocale(language) ? 'rtl' : 'ltr';

    return (
        <html lang={language} dir={dir} suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {/* Keep Lara theme for pages not yet migrated off PrimeReact */}
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet" />
            </head>
            <body dir={dir} className="min-h-screen font-sans antialiased">
                <Provider store={store}>
                    <QueryProvider>
                        <PrimeReactProvider>
                            <LayoutProvider>{children}</LayoutProvider>
                        </PrimeReactProvider>
                    </QueryProvider>
                </Provider>
            </body>
        </html>
    );
};

const TranslatedRootLayout = appWithTranslation(({ children }: any) => {
    return <RootLayout>{children}</RootLayout>;
});

export default TranslatedRootLayout;
