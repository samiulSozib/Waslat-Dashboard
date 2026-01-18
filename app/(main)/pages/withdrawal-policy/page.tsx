/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { AppDispatch } from '@/app/redux/store';
import { Currency, WithdrawalPolicy } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { Badge } from 'primereact/badge';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { addWithdrawPolicy, deleteWithdrawPolicy, editWithdrawPolicy, fetchWithdrawPolicies } from '@/app/redux/actions/withdrawPolicyActions';

const WithdrawalPolicyPage = () => {
    let emptyWithdrawalPolicy: WithdrawalPolicy = {
        id: 0,
        currency_id: 0,
        commission_type: 'percentage',
        commission_value: 0,
        min_withdraw_amount: 0,
        max_withdraw_amount: 0,
        status: true
    };

    const [withdrawalPolicyDialog, setWithdrawalPolicyDialog] = useState(false);
    const [deleteWithdrawalPolicyDialog, setDeleteWithdrawalPolicyDialog] = useState(false);
    const [deleteWithdrawalPoliciesDialog, setDeleteWithdrawalPoliciesDialog] = useState(false);
    const [withdrawalPolicy, setWithdrawalPolicy] = useState<WithdrawalPolicy>(emptyWithdrawalPolicy);
    const [selectedWithdrawalPolicies, setSelectedWithdrawalPolicies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [currencyFilter, setCurrencyFilter] = useState<number | undefined>(undefined);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { withdrawPolicies, loading, pagination } = useSelector((state: any) => state.withdrawPoliciesReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(fetchWithdrawPolicies(1, currencyFilter));
        dispatch(_fetchCurrencies());
    }, [dispatch, currencyFilter]);

    const openNew = () => {
        setWithdrawalPolicy(emptyWithdrawalPolicy);
        setSubmitted(false);
        setWithdrawalPolicyDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setWithdrawalPolicyDialog(false);
    };

    const hideDeleteWithdrawalPolicyDialog = () => {
        setDeleteWithdrawalPolicyDialog(false);
    };

    const hideDeleteWithdrawalPoliciesDialog = () => {
        setDeleteWithdrawalPoliciesDialog(false);
    };

    const saveWithdrawalPolicy = () => {
        setSubmitted(true);

        // Validation
        if (!withdrawalPolicy.currency_id ||
            !withdrawalPolicy.commission_type ||
            withdrawalPolicy.commission_value === undefined ||
            withdrawalPolicy.min_withdraw_amount === undefined ||
            withdrawalPolicy.max_withdraw_amount === undefined) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('PLEASE_FILL_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        // Validate min amount < max amount
        if (withdrawalPolicy.min_withdraw_amount >= withdrawalPolicy.max_withdraw_amount) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('MIN_AMOUNT_MUST_BE_LESS_THAN_MAX_AMOUNT'),
                life: 3000
            });
            return;
        }

        // Validate commission value
        if (withdrawalPolicy.commission_type === 'percentage' &&
            (withdrawalPolicy.commission_value < 0 || withdrawalPolicy.commission_value > 100)) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('PERCENTAGE_MUST_BE_BETWEEN_0_AND_100'),
                life: 3000
            });
            return;
        }

        if (withdrawalPolicy.commission_type === 'fixed' && withdrawalPolicy.commission_value < 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('FIXED_COMMISSION_MUST_BE_POSITIVE'),
                life: 3000
            });
            return;
        }

        if (withdrawalPolicy.id && withdrawalPolicy.id !== 0) {
            // Convert string values to numbers for API
            const policyToUpdate = {
                currency_id: Number(withdrawalPolicy.currency_id),
                commission_value: Number(withdrawalPolicy.commission_value),
                commission_type:withdrawalPolicy.commission_type,
                min_withdraw_amount: Number(withdrawalPolicy.min_withdraw_amount),
                max_withdraw_amount: Number(withdrawalPolicy.max_withdraw_amount),
                status:withdrawalPolicy.status,
            };
            dispatch(editWithdrawPolicy(withdrawalPolicy.id, policyToUpdate, toast, t));
        } else {
            // Convert values to numbers for API
            const { id, currency, ...policyData } = withdrawalPolicy;
            const policyToAdd = {
                ...policyData,
                currency_id: Number(policyData.currency_id),
                commission_value: Number(policyData.commission_value),
                min_withdraw_amount: Number(policyData.min_withdraw_amount),
                max_withdraw_amount: Number(policyData.max_withdraw_amount),
                
            };
            dispatch(addWithdrawPolicy(policyToAdd, toast, t));
        }

        setWithdrawalPolicyDialog(false);
        setWithdrawalPolicy(emptyWithdrawalPolicy);
        setSubmitted(false);
    };

    const editWithdrawalPolicy = (policy: WithdrawalPolicy) => {
        // Convert string values to numbers for the form
        const policyToEdit = {
            ...policy,
            currency_id: Number(policy.currency_id),
            commission_value: Number(policy.commission_value),
            min_withdraw_amount: Number(policy.min_withdraw_amount),
            max_withdraw_amount: Number(policy.max_withdraw_amount),
            status: policy.status === true 
        };
        setWithdrawalPolicy(policyToEdit);
        setWithdrawalPolicyDialog(true);
    };

    const confirmDeleteWithdrawalPolicy = (policy: WithdrawalPolicy) => {
        setWithdrawalPolicy(policy);
        setDeleteWithdrawalPolicyDialog(true);
    };

    const deleteWithdrawalPolicy = () => {
        if (!withdrawalPolicy?.id) {
            return;
        }
        dispatch(deleteWithdrawPolicy(withdrawalPolicy?.id, toast, t));
        setDeleteWithdrawalPolicyDialog(false);
    };

    const confirmDeleteSelected = () => {
        if (!selectedWithdrawalPolicies || (selectedWithdrawalPolicies as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteWithdrawalPoliciesDialog(true);
    };

    const deleteSelectedWithdrawalPolicies = async () => {
        if (!selectedWithdrawalPolicies || (selectedWithdrawalPolicies as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        // Delete selected policies one by one
        const selectedPoliciesArray = selectedWithdrawalPolicies as WithdrawalPolicy[];
        for (const policy of selectedPoliciesArray) {
            if (policy.id) {
                await dispatch(deleteWithdrawPolicy(policy.id, toast, t));
            }
        }

        setSelectedWithdrawalPolicies(null);
        setDeleteWithdrawalPoliciesDialog(false);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('CREATE_WITHDRAWAL_POLICY')}
                        icon="pi pi-plus"
                        severity="success"
                        className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                        onClick={openNew}
                    />

                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('DELETE')}
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedWithdrawalPolicies || !(selectedWithdrawalPolicies as any).length}
                    />
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex items-center">
                <span className="block mt-2 md:mt-0 p-inputicon-left w-full md:w-auto mr-4">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                        placeholder={t('SEARCH')}
                        className="w-full md:w-auto"
                    />
                </span>
            </div>
        );
    };

    const currencyBodyTemplate = (rowData: WithdrawalPolicy) => {
        return (
            <>
                <span className="p-column-title">{t('CURRENCY')}</span>
                <div className="flex align-items-center gap-2">
                    <span className={`fi fi-${rowData.currency?.code?.toLowerCase()?.substring(0, 2) || 'us'} fis`}></span>
                    <span>{rowData.currency?.code} - {rowData.currency?.name}</span>
                </div>
            </>
        );
    };

    const commissionTypeBodyTemplate = (rowData: WithdrawalPolicy) => {
        return (
            <>
                <span className="p-column-title">{t('COMMISSION_TYPE')}</span>
                <Badge
                    value={rowData.commission_type === 'percentage' ? t('PERCENTAGE') : t('FIXED')}
                    severity={rowData.commission_type === 'percentage' ? 'info' : 'warning'}
                />
            </>
        );
    };

    const commissionValueBodyTemplate = (rowData: WithdrawalPolicy) => {
        const currencySymbol = rowData.currency?.symbol || '';
        return (
            <>
                <span className="p-column-title">{t('COMMISSION_VALUE')}</span>
                <span>
                    {Number(rowData.commission_value).toFixed(2)}
                    {rowData.commission_type === 'percentage' ? '%' : ` ${currencySymbol}`}
                </span>
            </>
        );
    };

    const minAmountBodyTemplate = (rowData: WithdrawalPolicy) => {
        return (
            <>
                <span className="p-column-title">{t('MIN_WITHDRAW_AMOUNT')}</span>
                <span>
                    {Number(rowData.min_withdraw_amount).toFixed(2)} {rowData.currency?.symbol || ''}
                </span>
            </>
        );
    };

    const maxAmountBodyTemplate = (rowData: WithdrawalPolicy) => {
        return (
            <>
                <span className="p-column-title">{t('MAX_WITHDRAW_AMOUNT')}</span>
                <span>
                    {Number(rowData.max_withdraw_amount).toFixed(2)} {rowData.currency?.symbol || ''}
                </span>
            </>
        );
    };

    const statusBodyTemplate = (rowData: WithdrawalPolicy) => {
        const isActive = rowData.status === true ;
        return (
            <>
                <span className="p-column-title">{t('STATUS')}</span>
                <Badge
                    value={isActive ? t('ACTIVE') : t('INACTIVE')}
                    severity={isActive ? 'success' : 'danger'}
                />
            </>
        );
    };

    const actionBodyTemplate = (rowData: WithdrawalPolicy) => {
        return (
            <>
                <Button
                    icon="pi pi-pencil"
                    rounded
                    severity="success"
                    className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                    onClick={() => editWithdrawalPolicy(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    severity="warning"
                    onClick={() => confirmDeleteWithdrawalPolicy(rowData)}
                />
            </>
        );
    };

    const withdrawalPolicyDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('SAVE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveWithdrawalPolicy} />
        </>
    );

    const deleteWithdrawalPolicyDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteWithdrawalPolicyDialog} />
            <Button label={t('DELETE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteWithdrawalPolicy} />
        </>
    );

    const deleteWithdrawalPoliciesDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteWithdrawalPoliciesDialog} />
            <Button label={t('DELETE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedWithdrawalPolicies} />
        </>
    );

    const commissionTypeOptions = [
        { label: t('PERCENTAGE'), value: 'percentage' },
        { label: t('FIXED'), value: 'fixed' }
    ];

    const statusOptions = [
        { label: t('ACTIVE'), value: true },
        { label: t('INACTIVE'), value: false }
    ];

    // Filter currencies to only show active ones if needed
    const availableCurrencies = currencies.filter((currency: Currency) => currency.deleted_at === null);

    return (
        <div className="grid -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={withdrawPolicies}
                        selection={selectedWithdrawalPolicies}
                        onSelectionChange={(e) => setSelectedWithdrawalPolicies(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={
                            isRTL()
                                ? `Showing {first} to {last} of {totalRecords} entries`
                                : `Showing {first} to {last} of {totalRecords} entries`
                        }
                        emptyMessage={t('NO_DATA_AVAILABLE')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="currency.code"
                            header={t('MENU.CURRENCY')}
                            body={currencyBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('COMMISSION_TYPE')}
                            body={commissionTypeBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('COMMISSION_VALUE')}
                            body={commissionValueBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('MIN_WITHDRAW_AMOUNT')}
                            body={minAmountBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('MAX_WITHDRAW_AMOUNT')}
                            body={maxAmountBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('STATUS')}
                            body={statusBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '10rem' }}
                            header={t('COMMON.ACTIONS')}
                        ></Column>
                    </DataTable>

                    <Dialog
                        visible={withdrawalPolicyDialog}
                        style={{ width: '700px', padding: '5px' }}
                        header={withdrawalPolicy.id ? t('EDIT_WITHDRAWAL_POLICY') : t('CREATE_WITHDRAWAL_POLICY')}
                        modal
                        className="p-fluid"
                        footer={withdrawalPolicyDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="card" style={{ padding: '40px' }}>
                            {/* Currency Field */}
                            <div className="field mb-4">
                                <label htmlFor="currency_id" style={{ fontWeight: 'bold' }}>
                                    {t('MENU.CURRENCY')} *
                                </label>
                                <Dropdown
                                    id="currency_id"
                                    value={Number(withdrawalPolicy.currency_id)} // Ensure it's a number
                                    options={availableCurrencies}
                                    onChange={(e) =>
                                        setWithdrawalPolicy((prev) => ({
                                            ...prev,
                                            currency_id: Number(e.value) // Convert to number
                                        }))
                                    }
                                    optionLabel="code"
                                    optionValue="id"
                                    placeholder={t('SELECT_CURRENCY')}
                                    className={classNames({
                                        'p-invalid': submitted && !withdrawalPolicy.currency_id
                                    })}
                                    
                                />
                                {submitted && !withdrawalPolicy.currency_id && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            {/* Commission Type and Status */}
                            <div className="formgrid grid mb-4">
                                <div className="field col">
                                    <label htmlFor="commission_type" style={{ fontWeight: 'bold' }}>
                                        {t('COMMISSION_TYPE')} *
                                    </label>
                                    <Dropdown
                                        id="commission_type"
                                        value={withdrawalPolicy.commission_type}
                                        options={commissionTypeOptions}
                                        onChange={(e) =>
                                            setWithdrawalPolicy((prev) => ({
                                                ...prev,
                                                commission_type: e.value
                                            }))
                                        }
                                        placeholder={t('SELECT_COMMISSION_TYPE')}
                                        className={classNames({
                                            'p-invalid': submitted && !withdrawalPolicy.commission_type
                                        })}
                                    />
                                    {submitted && !withdrawalPolicy.commission_type && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field col">
                                    <label htmlFor="status" style={{ fontWeight: 'bold' }}>
                                        {t('STATUS')}
                                    </label>
                                    <Dropdown
                                        id="status"
                                        value={Boolean(withdrawalPolicy.status)} // Ensure boolean
                                        options={statusOptions}
                                        onChange={(e) =>
                                            setWithdrawalPolicy((prev) => ({
                                                ...prev,
                                                status: Boolean(e.value)
                                            }))
                                        }
                                        placeholder={t('SELECT_STATUS')}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Commission Value */}
                            <div className="field mb-4">
                                <label htmlFor="commission_value" style={{ fontWeight: 'bold' }}>
                                    {t('COMMISSION_VALUE')} *
                                    {withdrawalPolicy.commission_type === 'percentage' &&
                                        ` (0-100%)`}
                                </label>
                                <div className="p-inputgroup">
                                    <InputNumber
                                        id="commission_value"
                                        value={Number(withdrawalPolicy.commission_value)} // Ensure number
                                        onValueChange={(e) =>
                                            setWithdrawalPolicy((prev) => ({
                                                ...prev,
                                                commission_value: Number(e.value) || 0
                                            }))
                                        }
                                        mode="decimal"
                                        min={0}
                                        max={withdrawalPolicy.commission_type === 'percentage' ? 100 : undefined}
                                        minFractionDigits={2}
                                        maxFractionDigits={2}
                                        className={classNames('w-full', {
                                            'p-invalid': submitted && withdrawalPolicy.commission_value === undefined
                                        })}
                                        placeholder={withdrawalPolicy.commission_type === 'percentage' ?
                                            t('ENTER_PERCENTAGE') : t('ENTER_FIXED_AMOUNT')}
                                    />
                                    <span className="p-inputgroup-addon">
                                        {withdrawalPolicy.commission_type === 'percentage' ?
                                            '%' :
                                            (availableCurrencies.find((c: Currency) => Number(c.id) === Number(withdrawalPolicy.currency_id))?.symbol || '$')}
                                    </span>
                                </div>
                                {submitted && withdrawalPolicy.commission_value === undefined && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            {/* Min and Max Withdraw Amounts */}
                            <div className="formgrid grid mb-4">
                                <div className="field col">
                                    <label htmlFor="min_withdraw_amount" style={{ fontWeight: 'bold' }}>
                                        {t('MIN_WITHDRAW_AMOUNT')} *
                                    </label>
                                    <InputNumber
                                        id="min_withdraw_amount"
                                        value={Number(withdrawalPolicy.min_withdraw_amount)} // Ensure number
                                        onValueChange={(e) =>
                                            setWithdrawalPolicy((prev) => ({
                                                ...prev,
                                                min_withdraw_amount: Number(e.value) || 0
                                            }))
                                        }
                                        mode="decimal"
                                        min={0}
                                        className={classNames('w-full', {
                                            'p-invalid': submitted && withdrawalPolicy.min_withdraw_amount === undefined
                                        })}
                                        placeholder={t('ENTER_MIN_AMOUNT')}
                                    />
                                    {submitted && withdrawalPolicy.min_withdraw_amount === undefined && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field col">
                                    <label htmlFor="max_withdraw_amount" style={{ fontWeight: 'bold' }}>
                                        {t('MAX_WITHDRAW_AMOUNT')} *
                                    </label>
                                    <InputNumber
                                        id="max_withdraw_amount"
                                        value={Number(withdrawalPolicy.max_withdraw_amount)} // Ensure number
                                        onValueChange={(e) =>
                                            setWithdrawalPolicy((prev) => ({
                                                ...prev,
                                                max_withdraw_amount: Number(e.value) || 0
                                            }))
                                        }
                                        mode="decimal"
                                        min={0}
                                        className={classNames('w-full', {
                                            'p-invalid': submitted && withdrawalPolicy.max_withdraw_amount === undefined
                                        })}
                                        placeholder={t('ENTER_MAX_AMOUNT')}
                                    />
                                    {submitted && withdrawalPolicy.max_withdraw_amount === undefined && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Validation Note */}
                            {withdrawalPolicy.min_withdraw_amount >= withdrawalPolicy.max_withdraw_amount &&
                                withdrawalPolicy.min_withdraw_amount > 0 && withdrawalPolicy.max_withdraw_amount > 0 && (
                                    <div className="field mb-4">
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('MIN_AMOUNT_MUST_BE_LESS_THAN_MAX_AMOUNT')}
                                        </small>
                                    </div>
                                )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteWithdrawalPolicyDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM')}
                        modal
                        footer={deleteWithdrawalPolicyDialogFooter}
                        onHide={hideDeleteWithdrawalPolicyDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {withdrawalPolicy && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>
                                        {withdrawalPolicy.currency?.code} {t('WITHDRAWAL_POLICY')}
                                    </b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteWithdrawalPoliciesDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM')}
                        modal
                        footer={deleteWithdrawalPoliciesDialogFooter}
                        onHide={hideDeleteWithdrawalPoliciesDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {selectedWithdrawalPolicies && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}
                                    ({(selectedWithdrawalPolicies as any).length} {t('ITEMS')})?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(WithdrawalPolicyPage);