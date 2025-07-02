// 'use client';
// import { LayoutProvider } from '../layout/context/layoutcontext';
// import { PrimeReactProvider } from 'primereact/api';
// import 'primereact/resources/primereact.css';
// import 'primeflex/primeflex.css';
// import 'primeicons/primeicons.css';
// import '../styles/layout/layout.scss';
// import '../styles/demo/Demos.scss';
// import { Provider, useSelector } from 'react-redux';
// import store from './redux/store';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';

// interface RootLayoutProps {
//     children: React.ReactNode;
// }

// function AuthGuard({ children }: { children: React.ReactNode }) {
//     const router = useRouter();
//     const { isAuthenticated } = useSelector((state: any) => state.authReducer);

//     useEffect(() => {
//         if (!isAuthenticated) {
//             router.replace('/auth/login'); // Redirect to login if not authenticated
//         }
//     }, [isAuthenticated, router]);

//     // Show children only if authenticated
//     //if (!isAuthenticated) return null // Optional: Add a loading spinner or message
//     return <>{children}</>;
// }

// export default function RootLayout({ children }: RootLayoutProps) {
//     return (
//         <html lang="en" suppressHydrationWarning>
//             <head>
//                 <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
//             </head>
//             <body>
//                 <Provider store={store}>
//                 <PrimeReactProvider>
//                     <LayoutProvider>
//                         {/* <AuthGuard> */}
//                             {children}
//                         {/* </AuthGuard> */}
//                     </LayoutProvider>
//                 </PrimeReactProvider>
//                 </Provider>

//             </body>
//         </html>
//     );
// }



'use client';

import { appWithTranslation } from 'next-i18next';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { Provider } from 'react-redux';
import store from './redux/store';
import { ReactNode, useEffect, useState } from 'react';
import '../i18n'
import i18n from 'i18next';
import '../styles/fonts.scss';


interface RootLayoutProps {
    children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps): JSX.Element => {


    const [locale, setLocale] = useState(i18n.language);
    const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

    // useEffect(() => {
    //     // Update the direction based on the current locale
    //     if (locale === 'ar' || locale === 'fa' || locale === 'ps') {
    //         setDirection('rtl');
    //     } else {
    //         setDirection('ltr');
    //     }
    // }, [locale]);

    // useEffect(()=>{
    //     console.log(locale)
    //     console.log(direction)
    // },[direction,locale])

    return (
        <html>
            <head lang='en' suppressHydrationWarning>
                <link
                    id="theme-css"
                    href={`/themes/lara-light-indigo/theme.css`}
                    rel="stylesheet"
                ></link>
            </head>

            <body dir={["ar", "fa", "ps","bn"].includes(i18n.language) ? "rtl" : "ltr"}>
                <Provider store={store}>
                <PrimeReactProvider>
                    <LayoutProvider>
                        {children}
                    </LayoutProvider>
                </PrimeReactProvider>
                </Provider>
            </body>
        </html>

    );
};

// Wrap RootLayout with appWithTranslation
const TranslatedRootLayout = appWithTranslation(({ children }: any) => {
    return <RootLayout>{children}</RootLayout>;
});

export default TranslatedRootLayout;

