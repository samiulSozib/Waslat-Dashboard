// components/ManageTranslationsButton.tsx
'use client';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    type: string; // 'bundle' | 'country' | 'payment_method' | ...
}

export const ManageTranslationsButton: React.FC<Props> = ({ type }) => {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <Button
            label={t('MANAGE_TRANSLATIONS')}
            icon="pi pi-language"
            className="p-button-info"
            onClick={() => router.push(`/pages/translation-workspace?type=${type}`)}
        />
    );
};
