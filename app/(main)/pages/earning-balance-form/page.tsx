/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/app/redux/store';
import { Reseller } from '@/types/interface';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { Toolbar } from 'primereact/toolbar';
import { _addEarningBalanceRequest } from '@/app/redux/actions/earningBalanceActions';
import { isRTL } from '../../utilities/rtlUtil';

const AddEarningBalanceRequestPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const { resellers, loading: resellersLoading } = useSelector((state: any) => state.resellerReducer);
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        reseller_id: '',
        amount: 0
    });
    const [totalEarningBalance, setTotalEarningBalance] = useState<number>(0);
    const [submitted, setSubmitted] = useState(false);

    // Fetch resellers on component mount
    // useEffect(() => {
    //     dispatch(_fetchResellers());
    // }, [dispatch]);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (resellerSearchTerm) {
                dispatch(_fetchResellers(1, resellerSearchTerm));
            } else {
                dispatch(_fetchResellers(1, ''));
            }
        }, 300); // Debounce for 300ms

        return () => clearTimeout(timer);
    }, [resellerSearchTerm, dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!formData.reseller_id || formData.amount <= 0) return;

        dispatch(_addEarningBalanceRequest(formData, toast, t));
        router.push('/pages/earning-balance-form');
        setFormData({ ...formData, reseller_id: '', amount: 0 });
    };

    // Templates for DataTable
    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div>
                    <span className="block mt-2 md:mt-0 p-input-icon-left font-bold text-[16px]">{t('EARNING_BALANCE_REQUEST.ADD_DIALOG.TITLE')}</span>
                </div>
            </React.Fragment>
        );
    };

    useEffect(() => {
        console.log(formData.amount);
    }, [formData]);

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} />

                    <form onSubmit={handleSubmit}>
                        <div className="field mb-4">
                            <label htmlFor="reseller" className="block mb-2">
                                {t('EARNING_BALANCE_REQUEST.ADD_DIALOG.RESELLER')}
                                <span className="text-red-500">*</span>
                            </label>
                            {/* <Dropdown
                                id="reseller"
                                value={formData.reseller_id}
                                options={
                                    resellers?.map((reseller: Reseller) => ({
                                        label: reseller.reseller_name,
                                        value: reseller.id
                                    })) || []
                                }
                                onChange={(e: { value: string }) => {
                                    const selectedReseller = resellers.find((r: any) => r.id === e.value);
                                    setFormData({ ...formData, reseller_id: e.value });
                                    if (selectedReseller) {
                                        setTotalEarningBalance(selectedReseller?.total_earning_balance);
                                    }
                                }}
                                placeholder={t('FORM.GENERAL.SELECT')}
                                required
                                className={classNames('w-full', {
                                    'p-invalid': submitted && !formData.reseller_id
                                })}
                            />
                             */}

                            <Dropdown
                                id="reseller"
                                value={formData.reseller_id}
                                options={resellers.map((reseller: Reseller) => ({
                                    label: reseller.reseller_name,
                                    value: reseller.id
                                }))}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        reseller_id: e.value
                                    }));
                                }}
                                filter
                                filterPlaceholder={t('SEARCH')}
                                showFilterClear
                                placeholder={t('PAYMENT.FORM.INPUT.RESELLER')}
                                className="w-full"
                                panelClassName="min-w-[20rem]"
                                onFilter={(e) => {
                                    setResellerSearchTerm(e.filter);
                                }}
                            />

                            {submitted && !formData.reseller_id && <small className="p-invalid block mt-1">{t('FORM.VALIDATION.REQUIRED')}</small>}
                        </div>

                        <div className="field mb-4">
                            <label htmlFor="amount" className="block mb-2">
                                {t('EARNING_BALANCE_REQUEST.ADD_DIALOG.AMOUNT')}
                            </label>
                            <div className="text-sm mb-2 font-bold">
                                {t('EARNING_BALANCE_REQUEST.ADD_DIALOG.AVAILABLE_BALANCE')}: {totalEarningBalance}
                            </div>
                            <InputNumber
                                id="amount"
                                value={formData.amount}
                                onValueChange={(e) => setFormData({ ...formData, amount: e.value || 0 })}
                                required
                                className={classNames('w-full', {
                                    'p-invalid': submitted && formData.amount <= 0
                                })}
                            />
                            {submitted && formData.amount <= 0 && <small className="p-invalid block mt-1">{t('FORM.VALIDATION.AMOUNT_POSITIVE')}</small>}
                        </div>

                        <div className="flex justify-content-end gap-3 mt-5">
                            <Button type="button" label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={() => router.back()} />
                            <Button type="submit" label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} loading={resellersLoading} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default withAuth(AddEarningBalanceRequestPage);
