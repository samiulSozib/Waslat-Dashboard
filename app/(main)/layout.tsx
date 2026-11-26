import { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: `${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    description: 'پنل مدیریت وصلات',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    icons: {
        icon: `${process.env.NEXT_PUBLIC_PROJECT_LOGO}`
    }
};

export default function AppLayout({ children }: AppLayoutProps) {
    return <AdminShell>{children}</AdminShell>;
}
