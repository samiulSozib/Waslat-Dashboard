/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { useTranslation } from 'react-i18next';
import { AppDispatch } from '@/app/redux/store';
import withAuth from '../../authGuard';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { Service } from '@/types/interface';
import { _bundlePriceAdjustmentUpdate } from '@/app/redux/actions/bundleActions';
import { FormField, FormSection } from '@/components/admin/form-sheet';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PriceAdjustmentForm {
    adjustment_type: 'percentage' | 'fixed';
    adjustment_value: number;
    base_price: 'admin_buying_price' | 'buying_price';
    service_ids: number[];
    confirmation: boolean;
}

const BundlePricingPage = () => {
    const [formData, setFormData] = useState<PriceAdjustmentForm>({
        adjustment_type: 'percentage',
        adjustment_value: 10,
        base_price: 'admin_buying_price',
        service_ids: [],
        confirmation: false
    });

    const [submitted, setSubmitted] = useState(false);
    const [serviceFilter, setServiceFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { services, loading } = useSelector((state: any) => state.serviceReducer);
    const { priceAdjustment } = useSelector((state: any) => state.bundleReducer);

    const isUpdateLoading = priceAdjustment.updateLoading;

    useEffect(() => {
        dispatch(_fetchServiceList());
    }, [dispatch]);

    const handleInputChange = <K extends keyof PriceAdjustmentForm>(field: K, value: PriceAdjustmentForm[K]) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        setSubmitted(true);

        if (!formData.adjustment_value) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_ENTER_ADJUSTMENT_VALUE'),
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

        if (formData.adjustment_type === 'percentage' && Math.abs(formData.adjustment_value) > 1000) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PERCENTAGE_VALUE_TOO_HIGH'),
                life: 3000
            });
            return;
        }

        await dispatch(_bundlePriceAdjustmentUpdate(formData, toast, t));

        if (!priceAdjustment.updateError) {
            setFormData({
                adjustment_type: 'percentage',
                adjustment_value: 10,
                base_price: 'admin_buying_price',
                service_ids: [],
                confirmation: false
            });
            setSubmitted(false);
        }
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

    const getCalculationDescription = () => {
        const base = formData.base_price === 'admin_buying_price' ? t('ADMIN_BUYING_PRICE') : t('CURRENT_BUYING_PRICE');
        const value = formData.adjustment_value;

        if (formData.adjustment_type === 'percentage') {
            return value >= 0
                ? t('INCREASE_BY_PERCENTAGE_FROM_BASE', { percentage: value, base })
                : t('DECREASE_BY_PERCENTAGE_FROM_BASE', { percentage: Math.abs(value), base });
        }
        return value >= 0
            ? t('ADD_FIXED_AMOUNT_TO_BASE', { amount: value, base })
            : t('SUBTRACT_FIXED_AMOUNT_FROM_BASE', { amount: Math.abs(value), base });
    };

    const handleReset = () => {
        setFormData({
            adjustment_type: 'percentage',
            adjustment_value: 10,
            base_price: 'admin_buying_price',
            service_ids: [],
            confirmation: false
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
            <PageHeader title={t('BUNDLE_PRICING_ADJUSTMENT')} />

            {loading ? (
                <span className="mb-4 block h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
                    <span className="block h-full w-1/3 animate-pulse rounded-full bg-emerald-500" />
                </span>
            ) : null}

            <Card className="mb-4">
                <CardContent className="pt-5">
                    <FormSection title={t('BUNDLE_PRICING_ADJUSTMENT')} description={t('DEFAULT_BASE_PRICE_HELP')}>
                        <FormField label={t('ADJUSTMENT_TYPE')} required>
                            <Select
                                value={formData.adjustment_type}
                                onValueChange={(v) => handleInputChange('adjustment_type', v as PriceAdjustmentForm['adjustment_type'])}
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
                                submitted && !formData.adjustment_value
                                    ? t('THIS_FIELD_IS_REQUIRED')
                                    : formData.adjustment_type === 'percentage' &&
                                        Math.abs(formData.adjustment_value) > 1000
                                      ? t('PERCENTAGE_RANGE_ERROR')
                                      : null
                            }
                        >
                            <NumberInput
                                id="adjustment_value"
                                value={formData.adjustment_value}
                                min={formData.adjustment_type === 'percentage' ? -1000 : undefined}
                                max={formData.adjustment_type === 'percentage' ? 1000 : undefined}
                                allowNull={false}
                                className="w-full"
                                onValueChange={(v) => handleInputChange('adjustment_value', v ?? 0)}
                            />
                        </FormField>

                        <FormField label={t('BASE_PRICE')} hint={t('DEFAULT_BASE_PRICE_HELP')}>
                            <Select
                                value={formData.base_price}
                                onValueChange={(v) =>
                                    handleInputChange('base_price', v as PriceAdjustmentForm['base_price'])
                                }
                            >
                                <SelectTrigger id="base_price">
                                    <SelectValue placeholder={t('SELECT_BASE_PRICE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin_buying_price">{t('ADMIN_BUYING_PRICE')}</SelectItem>
                                    <SelectItem value="buying_price">{t('CURRENT_BUYING_PRICE')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t('SPECIFIC_SERVICES')} hint={t('ALL_SERVICES_IF_EMPTY')} fullWidth>
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
                                {filteredServiceOptions.length === 0 ? (
                                    <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                                        {t('DATA_TABLE.TABLE.NO_DATA')}
                                    </p>
                                ) : null}
                            </div>
                        </FormField>

                        <FormField label={t('CALCULATION_DESCRIPTION')} fullWidth>
                            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-start">
                                <p className="m-0 text-sm text-blue-900">{getCalculationDescription()}</p>
                                {formData.service_ids.length > 0 ? (
                                    <p className="m-0 mt-2 text-xs text-blue-700">
                                        {t('APPLIED_TO_SELECTED_SERVICES', { count: formData.service_ids.length })}
                                    </p>
                                ) : null}
                            </div>
                        </FormField>

                        <FormField
                            label={t('CONFIRM_PRICE_UPDATE')}
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
                                <span className="text-sm font-medium text-rose-600">{t('CONFIRM_PRICE_UPDATE')}</span>
                            </label>
                        </FormField>

                        <div className="flex flex-wrap items-center justify-end gap-2 sm:col-span-2">
                            <Button type="button" variant="outline" onClick={handleReset} disabled={isUpdateLoading}>
                                {t('RESET')}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isUpdateLoading || !formData.confirmation}
                            >
                                {isUpdateLoading ? t('UPDATING') : t('UPDATE_PRICES')}
                            </Button>
                        </div>
                    </FormSection>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('EXAMPLES')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <h4 className="mb-2 text-sm font-semibold">{t('COMMON_SCENARIOS')}</h4>
                            <ul className="list-none space-y-2 p-0 text-sm text-muted-foreground">
                                <li>• {t('ADD_10_PERCENT_MARGIN')}</li>
                                <li>• {t('INCREASE_CURRENT_PRICES_5_PERCENT')}</li>
                                <li>• {t('ADD_FIXED_AMOUNT_EXAMPLE')}</li>
                                <li>• {t('SPECIFIC_SERVICES_EXAMPLE')}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-2 text-sm font-semibold">{t('NOTES')}</h4>
                            <ul className="list-none space-y-2 p-0 text-sm text-muted-foreground">
                                <li>• {t('CONFIRMATION_REQUIRED_NOTE')}</li>
                                <li>• {t('PRICES_CANNOT_GO_BELOW_ADMIN')}</li>
                                <li>• {t('CHANGES_ARE_PERMANENT')}</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default withAuth(BundlePricingPage);