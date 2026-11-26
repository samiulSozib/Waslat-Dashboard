import { Metadata } from 'next';
import React from 'react';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: `${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    description: 'ورود به پنل مدیریت وصلات'
};

export default function SimpleLayout({ children }: SimpleLayoutProps) {
    return <>{children}</>;
}
