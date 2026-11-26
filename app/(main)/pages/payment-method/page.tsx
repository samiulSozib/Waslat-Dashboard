/* eslint-disable @next/next/no-img-element */
'use client';
import { _addPaymentMethod, _deletePaymentMethod, _editPaymentMethod, _fetchPaymentMethods } from '@/app/redux/actions/paymentMethodActions';
import { AppDispatch } from '@/app/redux/store';
import i18n from '@/i18n';
import { PaymentMethod } from '@/types/interface';
import { Button as PrimeButton } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileDrop } from '@/components/ui/file-drop';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { customCellStyleImage } from '../../utilities/customRow';
import { isRTL } from '../../utilities/rtlUtil';

// Payment Method Type options
const PAYMENT_METHOD_TYPES = [
    { label: 'Bank Account', value: 'bank' },
    { label: 'Digital Wallet', value: 'digital_wallet' },
    { label: 'WhatsApp Payment', value: 'whatsapp' },
    { label: 'Hawala', value: 'hawala' },
    { label: 'Cash', value: 'cash' },
    { label: 'Other', value: 'other' },
];

const PaymentMethodPage = () => {
    let emptyPaymentMethod: PaymentMethod = {
        id: 0,
        method_name: '',
        account_details: '',
        account_image: '',
        status: 1,
        created_at: '',
        updated_at: '',
        bank_name: '',
        account_holder_name: '',
        card_number: '',
        account_number: '',
        sheba_number: '',
        notes: '',
        method_type: null,
    };

    const [methodDialog, setMethodDialog] = useState(false);
    const [deleteMethodDialog, setDeleteMethodDialog] = useState(false);
    const [deleteMethodsDialog, setDeleteMethodsDialog] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(emptyPaymentMethod);
    const [selectedCompanies, setSelectedCompanies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { paymentMethods, loading } = useSelector((state: any) => state.paymentMethodsReducer);
    const { t } = useTranslation();

    // Custom method type input state
    const [customMethodType, setCustomMethodType] = useState('');

    useEffect(() => {
        dispatch(_fetchPaymentMethods());
    }, [dispatch]);

    const openNew = () => {
        setPaymentMethod(emptyPaymentMethod);
        setSubmitted(false);
        setCustomMethodType('');
        setMethodDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setMethodDialog(false);
        setCustomMethodType('');
    };

    const hideDeleteMethodDialog = () => {
        setDeleteMethodDialog(false);
    };

    const hideDeleteMethodsDialog = () => {
        setDeleteMethodsDialog(false);
    };

    // Normalize string to lowercase snake_case
    const normalizeToSnakeCase = (str: string): string => {
        return str
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/[^a-z0-9_]/g, ''); // Remove invalid characters
    };

    // Handle method type selection
    const handleMethodTypeChange = (e: any) => {
        const value = e.value;
        if (value && !PAYMENT_METHOD_TYPES.some(option => option.value === value)) {
            // This is a custom value, normalize it
            const normalized = normalizeToSnakeCase(value);
            setPaymentMethod((prev) => ({
                ...prev,
                method_type: normalized as any,
            }));
        } else {
            setPaymentMethod((prev) => ({
                ...prev,
                method_type: value,
            }));
        }
        setCustomMethodType('');
    };

    // Handle custom method type input
    const handleCustomMethodTypeAdd = (e: any) => {
        const value = e.value?.trim();
        if (value) {
            const normalized = normalizeToSnakeCase(value);
            // Add to payment method
            setPaymentMethod((prev) => ({
                ...prev,
                method_type: normalized as any,
            }));
            setCustomMethodType('');
        }
    };

    const saveMethod = () => {
        setSubmitted(true);
        if (!paymentMethod.method_name || !paymentMethod.status) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000,
            });
            return;
        }

        // Prepare the payment method data
        const methodData = {
            ...paymentMethod,
            method_type: paymentMethod.method_type || null,
        };

        if (paymentMethod.id && paymentMethod.id !== 0) {
            dispatch(_editPaymentMethod(paymentMethod.id, methodData, toast, t));
        } else {
            dispatch(_addPaymentMethod(methodData, toast, t));
        }

        setMethodDialog(false);
        setPaymentMethod(emptyPaymentMethod);
        setSubmitted(false);
        setCustomMethodType('');
    };

    const editMethod = (paymentMethod: PaymentMethod) => {
        setPaymentMethod({ ...paymentMethod });
        setMethodDialog(true);
    };

    const confirmDeleteMethod = (paymentMethod: PaymentMethod) => {
        setPaymentMethod(paymentMethod);
        setDeleteMethodDialog(true);
    };

    const deleteMethod = () => {
        if (!paymentMethod?.id) {
            console.error("Method ID is undefined.");
            return;
        }
        dispatch(_deletePaymentMethod(paymentMethod?.id, toast, t));
        setDeleteMethodDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteMethodsDialog(true);
    };

    // Method Type Body Template for Table
    const methodTypeBodyTemplate = (rowData: PaymentMethod) => {
        const type = rowData.method_type;
        if (!type) return <span className="text-gray-400">-</span>;

        // Find the label for the type
        const found = PAYMENT_METHOD_TYPES.find(option => option.value === type);
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {found ? found.label : type}
            </span>
        );
    };

    const nameBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Method Name</span>
                {rowData.method_name}
            </>
        );
    };

    const accountDetailsBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Account Details</span>
                {rowData.account_details}
            </>
        );
    };

    const bankNameBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Bank Name</span>
                {rowData.bank_name || '-'}
            </>
        );
    };

    const accountHolderBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Account Holder</span>
                {rowData.account_holder_name || '-'}
            </>
        );
    };

    const cardNumberBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Card Number</span>
                {rowData.card_number || '-'}
            </>
        );
    };

    const accountNumberBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Account Number</span>
                {rowData.account_number || '-'}
            </>
        );
    };

    const shebaNumberBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Sheba Number</span>
                {rowData.sheba_number || '-'}
            </>
        );
    };

    const notesBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Notes</span>
                {rowData.notes || '-'}
            </>
        );
    };

    const imageBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img src={`${rowData.account_image}`} alt={rowData.method_name.toString()} className="shadow-2" width="60" />
            </>
        );
    };

    const statusBodyTemplate = (rowData: PaymentMethod) => {
        const getStatusText = (status: number) => {
            return status === 1 ? 'Active' : 'Deactivated';
        };

        const getStatusClasses = (status: number) => {
            return status === 1
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white';
        };

        return (
            <>
                <span className="p-column-title">Status</span>
                <span style={{ borderRadius: "5px" }}
                    className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getStatusClasses(
                        rowData.status
                    )}`}
                >
                    {getStatusText(rowData.status)}
                </span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: PaymentMethod) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT'),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editMethod(rowData)
                },
                {
                    label: t('TABLE.GENERAL.DELETE'),
                    icon: <Trash2 className="h-4 w-4" />,
                    danger: true,
                    separatorBefore: true,
                    onClick: () => confirmDeleteMethod(rowData)
                }
            ]}
        />
    );

    const deleteMethodDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteMethodDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteMethod} />
        </>
    );

    const deleteMethodsDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteMethodsDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.PAYMENTMETHOD', { defaultValue: 'روش پرداخت' })}
                description="مدیریت روش‌ها و حساب‌های پرداخت"
                loading={loading}
                actions={
                    <Button type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('PAYMENTMETHOD.TABLE.CREATEPAYMENTMETHOD')}
                    </Button>
                }
                toolbar={
                    <FilterBar
                        search={globalFilter}
                        onSearchChange={setGlobalFilter}
                        searchPlaceholder={t('TABLE.GENERAL.SEARCH', { defaultValue: 'جستجو...' })}
                    />
                }
            >
                <DataTable
                    ref={dt}
                    value={paymentMethods}
                    selection={selectedCompanies}
                    onSelectionChange={(e) => setSelectedCompanies(e.value as any)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    size="small"
                    className="datatable-responsive p-datatable-sm"
                    paginatorTemplate={
                        isRTL()
                            ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink'
                            : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    }
                    currentPageReportTemplate={t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}
                    emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                    dir={isRTL() ? 'rtl' : 'ltr'}
                    style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                    globalFilter={globalFilter}
                    responsiveLayout="scroll"
                >
                        <Column
                            header={t('TABLE.GENERAL.ACTION')}
                            body={actionBodyTemplate}
                            headerStyle={{ width: '4.5rem' }}
                            style={{ ...customCellStyleImage, textAlign: 'start' }}
                        />
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="name" header={t('PAYMENTMETHOD.TABLE.COLUMN.METHODNAME')} body={nameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="method_type" header={t('PAYMENTMETHOD.TABLE.COLUMN.METHODTYPE')} body={methodTypeBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="bank_name" header={t('PAYMENTMETHOD.TABLE.COLUMN.BANKNAME')} body={bankNameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="account_holder_name" header={t('PAYMENTMETHOD.TABLE.COLUMN.ACCOUNTHOLDER')} body={accountHolderBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="account_number" header={t('PAYMENTMETHOD.TABLE.COLUMN.ACCOUNTNUMBER')} body={accountNumberBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="sheba_number" header={t('PAYMENTMETHOD.TABLE.COLUMN.SHEBANUMBER')} body={shebaNumberBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="card_number" header={t('PAYMENTMETHOD.TABLE.COLUMN.CARDNUMBER')} body={cardNumberBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="account_details" header={t('PAYMENTMETHOD.TABLE.COLUMN.ACCOUNTDETAILS')} body={accountDetailsBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="notes" header={t('PAYMENTMETHOD.TABLE.COLUMN.NOTES')} body={notesBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} header={t('PAYMENTMETHOD.TABLE.COLUMN.IMAGE')} body={imageBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} header={t('PAYMENTMETHOD.TABLE.COLUMN.STATUS')} body={statusBodyTemplate}></Column>
                    </DataTable>
            </ListPage>

            <FormSheet
                open={methodDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('PAYMENT.METHOD.DETAILS')}
                description={paymentMethod.id ? 'ویرایش روش پرداخت' : 'ثبت روش پرداخت جدید'}
                size="xl"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveMethod}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('PAYMENTMETHOD.TABLE.COLUMN.IMAGE')} description="تصویر حساب یا کارت">
                    <FormField label={t('PAYMENTMETHOD.TABLE.COLUMN.IMAGE')} fullWidth>
                        <FileDrop
                            value={paymentMethod.account_image instanceof File ? paymentMethod.account_image : null}
                            previewUrl={
                                typeof paymentMethod.account_image === 'string' ? paymentMethod.account_image : null
                            }
                            onChange={(file) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    account_image: file ?? ''
                                }))
                            }
                            accept="image/*"
                        />
                    </FormField>
                </FormSection>

                <FormSection title={t('PAYMENT.METHOD.DETAILS')} description="اطلاعات روش و حساب بانکی">
                    <FormField
                        label={t('PAYMENTMETHOD.FORM.INPUT.METHODNAME')}
                        required
                        error={submitted && !paymentMethod.method_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="method_name"
                            value={paymentMethod?.method_name}
                            onChange={(e) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    method_name: e.target.value
                                }))
                            }
                            className={classNames('w-full', {
                                'p-invalid': submitted && !paymentMethod.method_name
                            })}
                        />
                    </FormField>
                    <FormField label={t('PAYMENTMETHOD.FORM.INPUT.METHODTYPE')} hint={t('TIP_TYPE_NEW_METHOD_TYPE')}>
                        <Select
                            value={
                                paymentMethod.method_type &&
                                PAYMENT_METHOD_TYPES.some((o) => o.value === paymentMethod.method_type)
                                    ? paymentMethod.method_type
                                    : undefined
                            }
                            onValueChange={(v) => setPaymentMethod((prev) => ({ ...prev, method_type: v as any }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('PAYMENTMETHOD.FORM.PLACEHOLDER.METHODTYPE')} />
                            </SelectTrigger>
                            <SelectContent>
                                {PAYMENT_METHOD_TYPES.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            className="mt-2"
                            value={
                                customMethodType ||
                                (paymentMethod.method_type &&
                                !PAYMENT_METHOD_TYPES.some((o) => o.value === paymentMethod.method_type)
                                    ? paymentMethod.method_type
                                    : '')
                            }
                            onChange={(e) => setCustomMethodType(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const value = (e.currentTarget.value || customMethodType).trim();
                                    if (value) {
                                        const normalized = normalizeToSnakeCase(value);
                                        setPaymentMethod((prev) => ({ ...prev, method_type: normalized as any }));
                                        setCustomMethodType('');
                                    }
                                }
                            }}
                            onBlur={() => {
                                const value = customMethodType.trim();
                                if (value) {
                                    const normalized = normalizeToSnakeCase(value);
                                    setPaymentMethod((prev) => ({ ...prev, method_type: normalized as any }));
                                    setCustomMethodType('');
                                }
                            }}
                            placeholder={t('PAYMENTMETHOD.FORM.PLACEHOLDER.METHODTYPE')}
                        />
                        {paymentMethod.method_type && !PAYMENT_METHOD_TYPES.some((o) => o.value === paymentMethod.method_type) ? (
                            <p className="mt-1 text-xs text-blue-500">
                                Custom type: <strong>{paymentMethod.method_type}</strong>
                            </p>
                        ) : null}
                    </FormField>
                    <FormField label={t('PAYMENTMETHOD.FORM.INPUT.BANKNAME')}>
                        <Input
                            id="bank_name"
                            value={paymentMethod?.bank_name || ''}
                            onChange={(e) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    bank_name: e.target.value
                                }))
                            }
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('PAYMENTMETHOD.FORM.INPUT.ACCOUNTHOLDER')}>
                        <Input
                            id="account_holder_name"
                            value={paymentMethod?.account_holder_name || ''}
                            onChange={(e) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    account_holder_name: e.target.value
                                }))
                            }
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('PAYMENTMETHOD.FORM.INPUT.CARDNUMBER')}>
                        <Input
                            id="card_number"
                            value={paymentMethod?.card_number || ''}
                            onChange={(e) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    card_number: e.target.value
                                }))
                            }
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('PAYMENTMETHOD.FORM.INPUT.ACCOUNTNUMBER')}>
                        <Input
                            id="account_number"
                            value={paymentMethod?.account_number || ''}
                            onChange={(e) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    account_number: e.target.value
                                }))
                            }
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('PAYMENTMETHOD.FORM.INPUT.SHEBANUMBER')}>
                        <Input
                            id="sheba_number"
                            value={paymentMethod?.sheba_number || ''}
                            onChange={(e) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    sheba_number: e.target.value
                                }))
                            }
                            className="w-full"
                        />
                    </FormField>
                    <FormField
                        label={t('PAYMENTMETHOD.FORM.INPUT.STATUS')}
                        required
                        error={submitted && !paymentMethod.status ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Select
                            value={paymentMethod.status != null ? String(paymentMethod.status) : undefined}
                            onValueChange={(v) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    status: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger className={cn(submitted && !paymentMethod.status && 'border-rose-300')}>
                                <SelectValue placeholder="Choose a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Active</SelectItem>
                                <SelectItem value="0">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('PAYMENTMETHOD.FORM.INPUT.ACCOUNTDETAILS')} fullWidth>
                        <Textarea
                            id="account_details"
                            value={paymentMethod.account_details || ''}
                            onChange={(e) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    account_details: e.target.value
                                }))
                            }
                            rows={4}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('PAYMENTMETHOD.FORM.INPUT.NOTES')} fullWidth>
                        <Textarea
                            id="notes"
                            value={paymentMethod.notes || ''}
                            onChange={(e) =>
                                setPaymentMethod((prev) => ({
                                    ...prev,
                                    notes: e.target.value
                                }))
                            }
                            rows={3}
                            className="w-full"
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteMethodDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteMethodDialogFooter} onHide={hideDeleteMethodDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {paymentMethod && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{paymentMethod.method_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteMethodsDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteMethodsDialogFooter} onHide={hideDeleteMethodsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {paymentMethod && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
        </>
    );
};

export default withAuth(PaymentMethodPage);
