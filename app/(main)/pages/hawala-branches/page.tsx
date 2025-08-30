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
import { ProgressBar } from 'primereact/progressbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { _addHawalaBranch, _deleteHawalaBranch, _editHawalaBranch, _fetchHawalaBranchList } from '@/app/redux/actions/hawalaBranchActions';
import { AppDispatch } from '@/app/redux/store';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { HawalaBranch } from '@/types/interface';
import { _fetchHawalaList } from '@/app/redux/actions/hawalaActions';
import { Paginator } from 'primereact/paginator';
import { isRTL } from '../../utilities/rtlUtil';

const HawalaBranchPage = () => {
    let emptyHawalaBranch: HawalaBranch = {
        id: 0,
        name: '',
        email: '',
        password: '',
        address: '',
        phone_number: '',
        commission_type: 'percentage',
        amount: 0,
        status: 'active'
    };

    const [hawalaBranchDialog, setHawalaBranchDialog] = useState(false);
    const [deleteHawalaBranchDialog, setDeleteHawalaBranchDialog] = useState(false);
    const [deleteHawalaBranchesDialog, setDeleteHawalaBranchesDialog] = useState(false);
    const [hawalaBranch, setHawalaBranch] = useState<HawalaBranch>(emptyHawalaBranch);
    const [selectedHawalaBranches, setSelectedHawalaBranches] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { hawalaBranches, loading, pagination } = useSelector((state: any) => state.hawalaBranchReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');

    const commissionTypes = [
        { label: t('HAWALA.FORM.PERCENTAGE'), value: 'percentage' },
        { label: t('HAWALA.FORM.FIXED'), value: 'fixed' }
    ];

    const statusOptions = [
        { label: t('APP.GENERAL.ACTIVE'), value: 'active' },
        { label: t('APP.GENERAL.INACTIVE'), value: 'inactive' }
    ];

    useEffect(() => {
        dispatch(_fetchHawalaBranchList(1, searchTag));
    }, [dispatch, searchTag]);

    const openNew = () => {
        setHawalaBranch(emptyHawalaBranch);
        setSubmitted(false);
        setHawalaBranchDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setHawalaBranchDialog(false);
    };

    const hideDeleteHawalaBranchDialog = () => {
        setDeleteHawalaBranchDialog(false);
    };

    const hideDeleteHawalaBranchesDialog = () => {
        setDeleteHawalaBranchesDialog(false);
    };

    const saveHawalaBranch = () => {
        setSubmitted(true);

        if (!hawalaBranch.name || !hawalaBranch.email || !hawalaBranch.phone_number || !hawalaBranch.address || !hawalaBranch.commission_type || !hawalaBranch.amount) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        if (hawalaBranch.id && hawalaBranch.id !== 0) {
            dispatch(_editHawalaBranch(hawalaBranch.id, hawalaBranch, toast, t));
        } else {
            dispatch(_addHawalaBranch(hawalaBranch, toast, t));
        }

        setHawalaBranchDialog(false);
        setHawalaBranch(emptyHawalaBranch);
        setSubmitted(false);
    };

    const editHawalaBranch = (branch: HawalaBranch) => {
        setHawalaBranch({ ...branch });
        setHawalaBranchDialog(true);
    };

    const confirmDeleteHawalaBranch = (branch: HawalaBranch) => {
        setHawalaBranch(branch);
        setDeleteHawalaBranchDialog(true);
    };

    const deleteHawalaBranch = () => {
        if (!hawalaBranch?.id) {
            console.error('Hawala Branch ID is undefined.');
            return;
        }
        dispatch(_deleteHawalaBranch(hawalaBranch?.id, toast, t));
        setDeleteHawalaBranchDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteHawalaBranchesDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('HAWALA.CREATE_NEW')}
                        icon="pi pi-plus"
                        severity="success"
                        className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                        onClick={openNew}
                    />
                    {/* <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('APP.GENERAL.DELETE')}
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedHawalaBranches || !(selectedHawalaBranches as any).length}
                    /> */}
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex items-center">
                <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setSearchTag(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} className="w-full md:w-auto" />
                </span>
            </div>
        );
    };

    const nameBodyTemplate = (rowData: HawalaBranch) => {
        return (
            <>
                <span className="p-column-title">{t('HAWALA.TABLE.NAME')}</span>
                {rowData.name}
            </>
        );
    };

    const emailBodyTemplate = (rowData: HawalaBranch) => {
        return (
            <>
                <span className="p-column-title">{t('HAWALA.TABLE.EMAIL')}</span>
                {rowData.email}
            </>
        );
    };

    const phoneBodyTemplate = (rowData: HawalaBranch) => {
        return (
            <>
                <span className="p-column-title">{t('HAWALA.TABLE.PHONE')}</span>
                {rowData.phone_number}
            </>
        );
    };

    const commissionTypeBodyTemplate = (rowData: HawalaBranch) => {
        const typeLabel = rowData.commission_type === 'percentage' ? t('HAWALA.FORM.PERCENTAGE') : t('HAWALA.FORM.FIXED');

        return (
            <>
                <span className="p-column-title">{t('HAWALA.TABLE.COMMISSION_TYPE')}</span>
                {typeLabel}
            </>
        );
    };

    const amountBodyTemplate = (rowData: HawalaBranch) => {
        return (
            <>
                <span className="p-column-title">{t('HAWALA.TABLE.AMOUNT')}</span>
                {rowData.amount}
            </>
        );
    };

    const statusBodyTemplate = (rowData: HawalaBranch) => {
        const statusClass = rowData.status === 'active' ? 'text-green-500' : 'text-red-500';
        const statusLabel = rowData.status === 'active' ? t('APP.GENERAL.ACTIVE') : t('APP.GENERAL.INACTIVE');

        return (
            <>
                <span className="p-column-title">{t('HAWALA.TABLE.STATUS')}</span>
                <span className={statusClass}>{statusLabel}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: HawalaBranch) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editHawalaBranch(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteHawalaBranch(rowData)} />
            </>
        );
    };

    const hawalaBranchDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveHawalaBranch} />
        </>
    );

    const deleteHawalaBranchDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteHawalaBranchDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteHawalaBranch} />
        </>
    );

    const deleteHawalaBranchesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteHawalaBranchesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchHawalaBranchList(page, searchTag));
    };

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={hawalaBranches}
                        selection={selectedHawalaBranches}
                        onSelectionChange={(e) => setSelectedHawalaBranches(e.value as any)}
                        dataKey="id"
                        paginator={false} // Disable PrimeReact's built-in paginator
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        globalFilter={globalFilter}
                        responsiveLayout="scroll"
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="name" header={t('HAWALA.TABLE.NAME')} sortable body={nameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="email" header={t('HAWALA.TABLE.EMAIL')} body={emailBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="phone_number" header={t('HAWALA.TABLE.PHONE')} body={phoneBodyTemplate} sortable></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="commission_type"
                            header={t('HAWALA.TABLE.COMMISSION_TYPE')}
                            body={commissionTypeBodyTemplate}
                            sortable
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="amount" header={t('HAWALA.TABLE.AMOUNT')} body={amountBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="status" header={t('HAWALA.TABLE.STATUS')} body={statusBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Paginator
                        first={(pagination?.page - 1) * pagination?.items_per_page}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                    />

                    <Dialog visible={hawalaBranchDialog} style={{ width: '900px', padding: '5px' }} header={t('HAWALA.DETAILS')} modal className="p-fluid" footer={hawalaBranchDialogFooter} onHide={hideDialog}>
                        <div className="card flex flex-wrap p-fluid mt-3 gap-4">
                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="name" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.FORM.NAME')}
                                    </label>
                                    <InputText
                                        id="name"
                                        value={hawalaBranch.name}
                                        onChange={(e) =>
                                            setHawalaBranch((prev: any) => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('HAWALA.FORM.NAME_PLACEHOLDER')}
                                        className={classNames({
                                            'p-invalid': submitted && !hawalaBranch.name
                                        })}
                                    />
                                    {submitted && !hawalaBranch.name && <small style={{ color: 'red', fontSize: '12px' }}>{t('APP.VALIDATION.REQUIRED_NAME')}</small>}
                                </div>

                                <div className="field">
                                    <label htmlFor="email" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.FORM.EMAIL')}
                                    </label>
                                    <InputText
                                        id="email"
                                        value={hawalaBranch.email}
                                        onChange={(e) =>
                                            setHawalaBranch((prev: any) => ({
                                                ...prev,
                                                email: e.target.value
                                            }))
                                        }
                                        required
                                        placeholder={t('HAWALA.FORM.EMAIL_PLACEHOLDER')}
                                        className={classNames({
                                            'p-invalid': submitted && !hawalaBranch.email
                                        })}
                                    />
                                    {submitted && !hawalaBranch.email && <small style={{ color: 'red', fontSize: '12px' }}>{t('APP.VALIDATION.REQUIRED_EMAIL')}</small>}
                                </div>

                                <div className="field">
                                    <label htmlFor="password" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.FORM.PASSWORD')}
                                    </label>
                                    <InputText
                                        id="password"
                                        type="password"
                                        value={hawalaBranch.password}
                                        onChange={(e) =>
                                            setHawalaBranch((prev: any) => ({
                                                ...prev,
                                                password: e.target.value
                                            }))
                                        }
                                        required={!hawalaBranch.id}
                                        placeholder={t('HAWALA.FORM.PASSWORD_PLACEHOLDER')}
                                        className={classNames({
                                            'p-invalid': submitted && !hawalaBranch.password && !hawalaBranch.id
                                        })}
                                    />
                                    {submitted && !hawalaBranch.password && !hawalaBranch.id && <small style={{ color: 'red', fontSize: '12px' }}>{t('APP.VALIDATION.REQUIRED_PASSWORD')}</small>}
                                </div>

                                <div className="field">
                                    <label htmlFor="address" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.FORM.ADDRESS')}
                                    </label>
                                    <InputTextarea
                                        id="address"
                                        value={hawalaBranch.address}
                                        onChange={(e) =>
                                            setHawalaBranch((prev: any) => ({
                                                ...prev,
                                                address: e.target.value
                                            }))
                                        }
                                        required
                                        rows={3}
                                        placeholder={t('HAWALA.FORM.ADDRESS_PLACEHOLDER')}
                                        className={classNames({
                                            'p-invalid': submitted && !hawalaBranch.address
                                        })}
                                    />
                                    {submitted && !hawalaBranch.address && <small style={{ color: 'red', fontSize: '12px' }}>{t('APP.VALIDATION.REQUIRED_ADDRESS')}</small>}
                                </div>
                            </div>

                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="phone_number" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.FORM.PHONE')}
                                    </label>
                                    <InputText
                                        id="phone_number"
                                        value={hawalaBranch.phone_number}
                                        onChange={(e) =>
                                            setHawalaBranch((prev: any) => ({
                                                ...prev,
                                                phone_number: e.target.value
                                            }))
                                        }
                                        required
                                        placeholder={t('HAWALA.FORM.PHONE_PLACEHOLDER')}
                                        className={classNames({
                                            'p-invalid': submitted && !hawalaBranch.phone_number
                                        })}
                                    />
                                    {submitted && !hawalaBranch.phone_number && <small style={{ color: 'red', fontSize: '12px' }}>{t('APP.VALIDATION.REQUIRED_PHONE')}</small>}
                                </div>

                                <div className="field">
                                    <label htmlFor="commission_type" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.FORM.COMMISSION_TYPE')}
                                    </label>
                                    <Dropdown
                                        id="commission_type"
                                        value={hawalaBranch.commission_type}
                                        options={commissionTypes}
                                        onChange={(e) =>
                                            setHawalaBranch((prev: any) => ({
                                                ...prev,
                                                commission_type: e.value
                                            }))
                                        }
                                        placeholder={t('HAWALA.FORM.SELECT_COMMISSION_TYPE')}
                                        className="w-full"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="amount" style={{ fontWeight: 'bold' }}>
                                        {hawalaBranch.commission_type === 'percentage' ? t('HAWALA.FORM.COMMISSION_PERCENTAGE') : t('HAWALA.FORM.COMMISSION_AMOUNT')}
                                    </label>
                                    <InputText
                                        id="amount"
                                        value={hawalaBranch.amount?.toString()}
                                        onChange={(e) =>
                                            setHawalaBranch((prev: any) => ({
                                                ...prev,
                                                amount: Number(e.target.value)
                                            }))
                                        }
                                        required
                                        keyfilter="num"
                                        placeholder={hawalaBranch.commission_type === 'percentage' ? t('HAWALA.FORM.PERCENTAGE_PLACEHOLDER') : t('HAWALA.FORM.AMOUNT_PLACEHOLDER')}
                                        className={classNames({
                                            'p-invalid': submitted && !hawalaBranch.amount
                                        })}
                                    />
                                    {submitted && !hawalaBranch.amount && <small style={{ color: 'red', fontSize: '12px' }}>{t('APP.VALIDATION.REQUIRED_AMOUNT')}</small>}
                                </div>

                                <div className="field">
                                    <label htmlFor="status" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.FORM.STATUS')}
                                    </label>
                                    <Dropdown
                                        id="status"
                                        value={hawalaBranch.status}
                                        options={statusOptions}
                                        onChange={(e) =>
                                            setHawalaBranch((prev: any) => ({
                                                ...prev,
                                                status: e.value
                                            }))
                                        }
                                        placeholder={t('HAWALA.FORM.SELECT_STATUS')}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteHawalaBranchDialog} style={{ width: '450px' }} header={t('APP.GENERAL.CONFIRM')} modal footer={deleteHawalaBranchDialogFooter} onHide={hideDeleteHawalaBranchDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {hawalaBranch && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE', { name: hawalaBranch.name })}</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteHawalaBranchesDialog} style={{ width: '450px' }} header={t('APP.GENERAL.CONFIRM')} modal footer={deleteHawalaBranchesDialogFooter} onHide={hideDeleteHawalaBranchesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {hawalaBranch && <span>{t('APP.DELETE_SELECTED_CONFIRMATION')}</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default HawalaBranchPage;
