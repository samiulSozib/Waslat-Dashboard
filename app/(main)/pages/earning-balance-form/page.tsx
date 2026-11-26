/* eslint-disable @next/next/no-img-element */
'use client';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/app/redux/store';
import { Reseller } from '@/types/interface';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { _addEarningBalanceRequest } from '@/app/redux/actions/earningBalanceActions';
import CustomDropdownWithSearch from '@/app/(main)/components/customDropDownWithSearch';
import { FormActions, FormField, FormSection } from '@/components/admin/form-sheet';
import { NumberInput } from '@/components/ui/number-input';
import { cn } from '@/lib/utils';

const AddEarningBalanceRequestPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const { resellers, loading: resellersLoading } = useSelector((state: any) => state.resellerReducer);
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        reseller_id: '',
        amount: 0
    });
    const [totalEarningBalance, setTotalEarningBalance] = useState<number>(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (resellerSearchTerm) {
                dispatch(_fetchResellers(1, resellerSearchTerm));
            } else {
                dispatch(_fetchResellers(1, ''));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [resellerSearchTerm, dispatch]);

    const selectedReseller =
        (resellers || []).find((r: Reseller) => String(r.id) === String(formData.reseller_id)) || null;

    const submitRequest = () => {
        setSubmitted(true);

        if (!formData.reseller_id || formData.amount <= 0) return;

        dispatch(_addEarningBalanceRequest(formData, toast, t));
        router.push('/pages/earning-balance-form');
        setFormData({ reseller_id: '', amount: 0 });
        setTotalEarningBalance(0);
        setSubmitted(false);
    };

    return (
        <div className="mx-auto max-w-3xl space-y-4 p-4">
            <Toast ref={toast} />
            <header className="text-start">
                <h1 className="text-lg font-semibold text-emerald-950">{t('EARNING_BALANCE_REQUEST.ADD_DIALOG.TITLE')}</h1>
                <p className="mt-1 text-sm text-muted-foreground">ثبت درخواست انتقال موجودی درآمدی نماینده</p>
            </header>

            <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <FormSection title="جزئیات درخواست" description="نماینده و مبلغ انتقال">
                    <FormField
                        label={t('EARNING_BALANCE_REQUEST.ADD_DIALOG.RESELLER')}
                        required
                        fullWidth
                        error={submitted && !formData.reseller_id ? t('FORM.VALIDATION.REQUIRED') : null}
                    >
                        <CustomDropdownWithSearch
                            id="reseller"
                            value={selectedReseller}
                            options={resellers}
                            onChange={(selectedOption) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    reseller_id: selectedOption?.id != null ? String(selectedOption.id) : ''
                                }));
                                if (selectedOption) {
                                    setTotalEarningBalance(Number(selectedOption.total_earning_balance) || 0);
                                } else {
                                    setTotalEarningBalance(0);
                                }
                            }}
                            optionLabel="reseller_name"
                            filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                            placeholder={t('PAYMENT.FORM.INPUT.RESELLER')}
                            className="w-full"
                            panelClassName="min-w-[20rem]"
                            searchButtonText={t('ECOMMERCE.COMMON.SEARCH')}
                            error={submitted && !formData.reseller_id}
                            errorMessage={t('THIS_FIELD_IS_REQUIRED')}
                            showClear={true}
                            emptyMessage={t('NO_RESULTS_FOUND')}
                            noResultsMessage={t('TRY_DIFFERENT_SEARCH_TERM')}
                            returnFullObject={true}
                            itemTemplate={(option) => {
                                if (!option) return null;
                                return (
                                    <div className="flex flex-col gap-1 p-2">
                                        <div className="font-semibold">
                                            {option.contact_name} · {option.reseller_name}
                                        </div>
                                        {option.phone ? (
                                            <div className="text-sm text-muted-foreground">
                                                <span className="ms-2">{option.phone}</span>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            }}
                            valueTemplate={(option) => {
                                if (!option) return t('PAYMENT.FORM.INPUT.RESELLER');
                                return (
                                    <div className="flex flex-col text-start">
                                        <span className="font-bold">{option.reseller_name}</span>
                                        <small className="text-xs text-muted-foreground">
                                            {[option.contact_name, option.phone].filter(Boolean).join(' · ')}
                                        </small>
                                    </div>
                                );
                            }}
                            onSearch={(searchTerm) => {
                                setResellerSearchTerm(searchTerm);
                            }}
                        />
                    </FormField>
                    <FormField
                        label={t('EARNING_BALANCE_REQUEST.ADD_DIALOG.AMOUNT')}
                        required
                        fullWidth
                        hint={`${t('EARNING_BALANCE_REQUEST.ADD_DIALOG.AVAILABLE_BALANCE')}: ${totalEarningBalance}`}
                        error={submitted && formData.amount <= 0 ? t('FORM.VALIDATION.AMOUNT_POSITIVE') : null}
                    >
                        <NumberInput
                            id="amount"
                            value={formData.amount || null}
                            onValueChange={(v) => setFormData({ ...formData, amount: v ?? 0 })}
                            min={0}
                            step={0.01}
                            allowNull={false}
                            className={cn('w-full', submitted && formData.amount <= 0 && 'border-rose-300')}
                        />
                    </FormField>
                </FormSection>
                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-emerald-100 pt-4">
                    <FormActions
                        onCancel={() => router.back()}
                        onSubmit={submitRequest}
                        loading={resellersLoading}
                        cancelLabel={t('APP.GENERAL.CANCEL', { defaultValue: 'انصراف' })}
                        submitLabel={t('FORM.GENERAL.SUBMIT', { defaultValue: 'ذخیره' })}
                    />
                </div>
            </div>
        </div>
    );
};

export default withAuth(AddEarningBalanceRequestPage);