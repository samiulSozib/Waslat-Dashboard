/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '@/app/redux/store';
import withAuth from '../../authGuard';
import { _blukbundlePriceUpdate } from '@/app/redux/actions/bundleActions';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { Service } from '@/types/interface';
import { FormField, FormSection } from '@/components/admin/form-sheet';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BulkBundlePriceForm {
    adjustment_type: 'percentage' | 'fixed';
    adjustment_value: number;
    adjustment_direction: 'increase' | 'decrease';
    base_price: 'admin_buying_price' | 'buying_price' | 'selling_price';
    service_ids: number[];
    confirmation: boolean;
}

const BulkBundlePriceUpdatePage = () => {
    const [formData, setFormData] = useState<BulkBundlePriceForm>({
        adjustment_type: 'percentage',
        adjustment_value: 10,
        adjustment_direction: 'increase',
        base_price: 'selling_price',
        service_ids: [],
        confirmation: false
    });

    const [submitted, setSubmitted] = useState(false);
    const [serviceFilter, setServiceFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();

    const { bulkUpdate } = useSelector((state: any) => state.bundleReducer);
    const { services } = useSelector((state: any) => state.serviceReducer);

    useEffect(() => {
        dispatch(_fetchServiceList());
    }, [dispatch]);

    const isUpdateLoading = bulkUpdate.loading;

    const handleInputChange = <K extends keyof BulkBundlePriceForm>(field: K, value: BulkBundlePriceForm[K]) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    type ServiceOption = { label: string; value: number };

    const serviceOptions = useMemo<ServiceOption[]>(
        () =>
            (services || []).map((service: Service) => ({
                label: `${service.service_category?.category_name} - ${service.company?.company_name}`,
                value: service.id
            })),
        [services]
    );

    const filteredServiceOptions = useMemo(() => {
        const q = serviceFilter.trim().toLowerCase();
        if (!q) return serviceOptions;
        return serviceOptions.filter((opt: ServiceOption) => opt.label.toLowerCase().includes(q));
    }, [serviceFilter, serviceOptions]);

    const handleSubmit = async () => {
        setSubmitted(true);

        if (!formData.adjustment_value || formData.adjustment_value <= 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_ENTER_VALID_ADJUSTMENT_VALUE'),
                life: 3000
            });
            return;
        }

        if (!formData.confirmation) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_CONFIRM_UPDATE'),
                life: 3000
            });
            return;
        }

        if (formData.adjustment_type === 'percentage' && formData.adjustment_value > 1000) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PERCENTAGE_VALUE_TOO_HIGH'),
                life: 3000
            });
            return;
        }

        const payload = {
            adjustment_type: formData.adjustment_type,
            adjustment_value: formData.adjustment_value,
            base_price: formData.base_price,
            adjustment_direction: formData.adjustment_direction,
            confirmation: formData.confirmation,
            service_ids: formData.service_ids
        };

        await dispatch(_blukbundlePriceUpdate(payload, toast, t));

        if (!bulkUpdate.error) {
            handleReset();
        }
    };

    const getCalculationDescription = () => {
        const base =
            formData.base_price === 'admin_buying_price'
                ? t('ADMIN_BUYING_PRICE')
                : formData.base_price === 'buying_price'
                  ? t('CURRENT_BUYING_PRICE')
                  : t('CURRENT_SELLING_PRICE');

        const value = formData.adjustment_value;
        const direction = formData.adjustment_direction === 'increase' ? t('INCREASE') : t('DECREASE');

        if (formData.adjustment_type === 'percentage') {
            return direction === t('INCREASE')
                ? t('INCREASE_BY_PERCENTAGE_FROM_BASE', { percentage: value, base })
                : t('DECREASE_BY_PERCENTAGE_FROM_BASE', { percentage: value, base });
        }
        return direction === t('INCREASE')
            ? t('ADD_FIXED_AMOUNT_TO_BASE', { amount: value, base })
            : t('SUBTRACT_FIXED_AMOUNT_FROM_BASE', { amount: value, base });
    };

    const handleReset = () => {
        setFormData({
            adjustment_type: 'percentage',
            adjustment_value: 10,
            adjustment_direction: 'increase',
            base_price: 'selling_price',
            confirmation: false,
            service_ids: []
        });
        setSubmitted(false);
        setServiceFilter('');
    };

    const toggleServiceId = (id: number, checked: boolean) => {
        handleInputChange(
            'service_ids',
            checked ? [...formData.service_ids, id] : formData.service_ids.filter((sid) => sid !== id)
        );
    };

    return (
        <div className="p-4 md:p-6">
            <Toast ref={toast} />
            <PageHeader title={t('BULK_BUNDLE_PRICE_UPDATE')} />

            <Card className="mb-4">
                <CardContent className="pt-5">
                    <FormSection title={t('BULK_BUNDLE_PRICE_UPDATE')} description={t('BASE_PRICE_HELP_TEXT')}>
                        <FormField label={t('BASE_PRICE_FOR_CALCULATION')} required hint={t('BASE_PRICE_HELP_TEXT')}>
                            <Select
                                value={formData.base_price}
                                onValueChange={(v) =>
                                    handleInputChange('base_price', v as BulkBundlePriceForm['base_price'])
                                }
                            >
                                <SelectTrigger id="base_price">
                                    <SelectValue placeholder={t('SELECT_BASE_PRICE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin_buying_price">{t('ADMIN_BUYING_PRICE')}</SelectItem>
                                    <SelectItem value="buying_price">{t('CURRENT_BUYING_PRICE')}</SelectItem>
                                    <SelectItem value="selling_price">{t('CURRENT_SELLING_PRICE')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t('ADJUSTMENT_TYPE')} required>
                            <Select
                                value={formData.adjustment_type}
                                onValueChange={(v) =>
                                    handleInputChange('adjustment_type', v as BulkBundlePriceForm['adjustment_type'])
                                }
                            >
                                <SelectTrigger id="adjustment_type">
                                    <SelectValue placeholder={t('SELECT_ADJUSTMENT_TYPE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">{t('PERCENTAGE')}</SelectItem>
                                    <SelectItem value="fixed">{t('FIXED_AMOUNT')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField
                            label={
                                formData.adjustment_type === 'percentage'
                                    ? t('ADJUSTMENT_PERCENTAGE')
                                    : t('ADJUSTMENT_AMOUNT')
                            }
                            required
                            error={
                                submitted && (!formData.adjustment_value || formData.adjustment_value <= 0)
                                    ? t('PLEASE_ENTER_VALID_VALUE')
                                    : null
                            }
                        >
                            <NumberInput
                                id="adjustment_value"
                                value={formData.adjustment_value}
                                min={0}
                                max={formData.adjustment_type === 'percentage' ? 1000 : undefined}
                                allowNull={false}
                                className="w-full"
                                onValueChange={(v) => handleInputChange('adjustment_value', v ?? 0)}
                            />
                        </FormField>

                        <FormField label={t('SPECIFIC_SERVICES')} hint={t('ALL_SERVICES_IF_EMPTY')}>
                            <Input
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                                placeholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو…' })}
                                className="mb-2"
                            />
                            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-emerald-100 p-2">
                                {filteredServiceOptions.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-emerald-50/60"
                                    >
                                        <Checkbox
                                            checked={formData.service_ids.includes(opt.value)}
                                            onCheckedChange={(checked) =>
                                                toggleServiceId(opt.value, Boolean(checked))
                                            }
                                            className="mt-0.5"
                                        />
                                        <span className="text-start">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </FormField>

                        <FormField label={t('ADJUSTMENT_DIRECTION')} required fullWidth>
                            <Select
                                value={formData.adjustment_direction}
                                onValueChange={(v) =>
                                    handleInputChange(
                                        'adjustment_direction',
                                        v as BulkBundlePriceForm['adjustment_direction']
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="increase">{t('INCREASE_PRICE')}</SelectItem>
                                    <SelectItem value="decrease">{t('DECREASE_PRICE')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t('CALCULATION_PREVIEW')} fullWidth>
                            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-start">
                                <p className="m-0 text-sm text-blue-900">{getCalculationDescription()}</p>
                                <p className="m-0 mt-1 text-xs text-muted-foreground">{t('THIS_WILL_AFFECT_ALL_BUNDLES')}</p>
                            </div>
                        </FormField>

                        <FormField label={t('IMPORTANT_NOTES')} fullWidth>
                            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 text-start text-xs text-muted-foreground">
                                <p className="mb-2 text-sm font-semibold text-rose-700">{t('IMPORTANT_NOTES')}</p>
                                <ul className="m-0 list-disc space-y-1 ps-4">
                                    <li>{t('BULK_UPDATE_IRREVERSIBLE')}</li>
                                    <li>{t('ALL_BUNDLES_AFFECTED')}</li>
                                    <li>{t('RECOMMEND_PREVIEW_FIRST')}</li>
                                </ul>
                            </div>
                        </FormField>

                        <FormField
                            label={t('I_CONFIRM_BULK_PRICE_UPDATE')}
                            fullWidth
                            error={submitted && !formData.confirmation ? t('CONFIRMATION_REQUIRED') : null}
                        >
                            <label className="flex items-center gap-2">
                                <Checkbox
                                    id="confirmation"
                                    checked={formData.confirmation}
                                    onCheckedChange={(checked) =>
                                        handleInputChange('confirmation', Boolean(checked))
                                    }
                                    className={cn(submitted && !formData.confirmation && 'border-rose-400')}
                                />
                                <span className="text-sm font-semibold">{t('I_CONFIRM_BULK_PRICE_UPDATE')}</span>
                            </label>
                        </FormField>

                        {isUpdateLoading ? (
                            <div className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                                <span className="h-1 flex-1 overflow-hidden rounded-full bg-emerald-100">
                                    <span className="block h-full w-1/3 animate-pulse rounded-full bg-emerald-500" />
                                </span>
                                <span className="text-xs text-muted-foreground">{t('UPDATING_PRICES')}…</span>
                            </div>
                        ) : null}

                        <div className="flex flex-wrap items-center justify-end gap-2 sm:col-span-2">
                            <Button type="button" variant="outline" onClick={handleReset} disabled={isUpdateLoading}>
                                {t('RESET')}
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleSubmit}
                                disabled={isUpdateLoading || !formData.confirmation}
                            >
                                {isUpdateLoading ? t('UPDATING') : t('UPDATE_ALL_PRICES')}
                            </Button>
                        </div>
                    </FormSection>
                </CardContent>
            </Card>

            {bulkUpdate.result ? (
                <Card className="border-green-200">
                    <CardContent className="pt-5">
                        <h3 className="mb-3 text-sm font-semibold text-green-700">{t('UPDATE_SUMMARY')}</h3>
                        <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                            <p className="m-0">
                                <strong>{t('TOTAL_BUNDLES_UPDATED')}:</strong>{' '}
                                <span className="text-green-600">
                                    {bulkUpdate.result.updated_bundles?.length ||
                                        bulkUpdate.result.total_updated ||
                                        0}
                                </span>
                            </p>
                            <p className="m-0">
                                <strong>{t('UPDATED_AT')}:</strong> <span>{new Date().toLocaleString()}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
};

export default withAuth(BulkBundlePriceUpdatePage);