'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    type: string; // 'bundle' | 'country' | 'payment_method' | ...
}

export const ManageTranslationsButton: React.FC<Props> = ({ type }) => {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/pages/translation-workspace?type=${type}`)}
        >
            <Languages className="h-4 w-4" />
            {t('MANAGE_TRANSLATIONS', { defaultValue: 'مدیریت ترجمه‌ها' })}
        </Button>
    );
};
