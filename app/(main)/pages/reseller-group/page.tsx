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
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { ResellerGroup } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addResellerGroup, _deleteResellerGroup, _editResellerGroup, _fetchResellerGroups } from '@/app/redux/actions/resellerGroupActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
import { FileUpload } from 'primereact/fileupload';
import { resellerGroupReducer } from '../../../redux/reducers/resellerGroupReducer';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslation } from 'react-i18next';
import { customCellStyle, customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const ResellerGroupPage = () => {
    let emptyResellerGroup: ResellerGroup = {
        id: 0,
        name: '',
        discount_type: '',
        discount_value: '',
        can_create_sub_resellers: 0,
        can_sub_reseller_create_subs: 0,
        sub_reseller_limit: 0,
        status: '',
        notes: '',
        created_at: '',
        updated_at: ''
    };

    const [resellerGroupDialog, setResellerGroupDialog] = useState(false);
    const [deleteResellerGroupDialog, setDeleteResellerGroupDialog] = useState(false);
    const [deleteResellerGroupsDialog, setDeleteResellerGroupsDialog] = useState(false);
    const [resellerGroup, setResellerGroup] = useState<ResellerGroup>(emptyResellerGroup);
    const [selectedCompanies, setSelectedResellerGroup] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { countries, loading } = useSelector((state: any) => state.countriesReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { languages } = useSelector((state: any) => state.languageReducer);
    const { reseller_groups } = useSelector((state: any) => state.resellerGroupReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchResellerGroups());
    }, [dispatch]);

    const openNew = () => {
        setResellerGroup(emptyResellerGroup);
        setSubmitted(false);
        setResellerGroupDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setResellerGroupDialog(false);
    };

    const hideDeleteResellerGroupDialog = () => {
        setDeleteResellerGroupDialog(false);
    };

    const hideDeleteResellerGroupsDialog = () => {
        setDeleteResellerGroupsDialog(false);
    };

    const saveResellerGroup = () => {
        setSubmitted(true);
        if (resellerGroup.id && resellerGroup.id !== 0) {
            dispatch(_editResellerGroup(resellerGroup.id, resellerGroup, toast, t));
        } else {
            dispatch(_addResellerGroup(resellerGroup, toast, t));
        }

        setResellerGroupDialog(false);
        setResellerGroup(emptyResellerGroup);
    };

    const editResellerGroup = (resellerGroup: ResellerGroup) => {
        setResellerGroup({ ...resellerGroup });

        setResellerGroupDialog(true);
    };

    const confirmDeleteResellerGroup = (resellerGroup: ResellerGroup) => {
        setResellerGroup(resellerGroup);
        setDeleteResellerGroupDialog(true);
    };

    const deleteResellerGroup = () => {
        if (!resellerGroup?.id) {
            console.error('ResellerGroup  ID is undefined.');
            return;
        }
        dispatch(_deleteResellerGroup(resellerGroup?.id, toast, t));
        setDeleteResellerGroupDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteResellerGroupsDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('RESELLER.GROUP.CREATENEW')}
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
                        disabled={!selectedCompanies || !(selectedCompanies as any).length}
                    /> */}
                </div>
            </React.Fragment>
        );
    };

    // const leftToolbarTemplate = () => {
    //     return (
    //         <div className="flex items-center">
    //             <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
    //                 <i className="pi pi-search" />
    //                 <InputText
    //                     type="search"
    //                     onInput={(e) => setGlobalFilter(e.currentTarget.value)}
    //                     placeholder={t('ECOMMERCE.COMMON.SEARCH')}
    //                     className="w-full md:w-auto"
    //                 />
    //             </span>
    //         </div>
    //     );
    // };

    const resellerGroupNameBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">ResellerGroup</span>
                {rowData.name}
            </>
        );
    };

    const discount_typeBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Discount Type</span>
                {rowData.discount_type}
            </>
        );
    };

    const discount_valueBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Discount Value</span>
                {rowData.discount_value}
            </>
        );
    };

    const subresellerLimitBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Sub reseller Limit</span>
                {rowData.sub_reseller_limit}
            </>
        );
    };

    const canAddSubResellerBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Can Add Sub-reseller</span>
                <span style={{ borderRadius: '10px' }} className={`px-3 py-1 text-center font-semibold inline-block w-16 ${rowData.can_create_sub_resellers ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {rowData.can_create_sub_resellers ? 'Yes' : 'No'}
                </span>
            </>
        );
    };

    const canSubResellerCreateSubsBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Can Sub-reseller Add Sub</span>
                <span style={{ borderRadius: '10px' }} className={`px-3 py-1 text-center font-semibold inline-block w-16 ${rowData.can_sub_reseller_create_subs ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {rowData.can_sub_reseller_create_subs ? 'Yes' : 'No'}
                </span>
            </>
        );
    };

    const statusBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span style={{ borderRadius: '10px', textAlign: 'center' }} className={`px-2 py-2  text-center text-white font-semibold inline-block w-24 ${rowData.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {rowData.status}
                </span>
            </>
        );
    };

    const notesBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Notes</span>
                {rowData.notes}
            </>
        );
    };

    const actionBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editResellerGroup(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteResellerGroup(rowData)} />
            </>
        );
    };

    // const header = (
    //     <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
    //         <h5 className="m-0">Manage Products</h5>
    //         <span className="block mt-2 md:mt-0 p-input-icon-left">
    //             <i className="pi pi-search" />
    //             <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
    //         </span>
    //     </div>
    // );

    const resellerGroupDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveResellerGroup} />
        </>
    );
    const deleteResellerGroupDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellerGroupDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteResellerGroup} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellerGroupsDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={reseller_groups}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedResellerGroup(e.value as any)}
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
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        // header={header}
                        responsiveLayout="scroll"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="name" header={t('RESELLER.GROUP.TABLE.RESELLEGROUP')} body={resellerGroupNameBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="guard_name"
                            header={t('RESELLER.GROUP.TABLE.DISCOUNTTYPE')}
                            body={discount_typeBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="guard_name"
                            header={t('RESELLER.GROUP.TABLE.DISCOUNTVALUE')}
                            body={discount_valueBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="guard_name"
                            header={t('RESELLER.GROUP.TABLE.SUBRESELLERLIMIT')}
                            body={subresellerLimitBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="guard_name"
                            header={t('RESELLER.GROUP.TABLE.CANADDSUBRESELLER')}
                            body={canAddSubResellerBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="guard_name"
                            header={t('RESELLER.GROUP.TABLE.CANSUBRESLLERADDSUB')}
                            body={canSubResellerCreateSubsBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="guard_name" header={t('RESELLER.GROUP.TABLE.STATUS')} body={statusBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="guard_name" header={t('RESELLER.GROUP.TABLE.NOTES')} body={notesBodyTemplate}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={resellerGroupDialog} style={{ width: '900px', padding: '5px' }} header={t('RESELLER.GROUP.DETAILS')} modal className="p-fluid" footer={resellerGroupDialogFooter} onHide={hideDialog}>
                        <div className="card flex flex-wrap p-fluid mt-3 gap-4">
                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="supplier" style={{ fontWeight: 'bold' }}>
                                        {t('RESELLER.GROUP.LABEL.GROUPNAME')}
                                    </label>
                                    <InputText
                                        id="name"
                                        value={resellerGroup.name}
                                        onChange={(e) =>
                                            setResellerGroup((prev) => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !resellerGroup.name
                                        })}
                                        placeholder={t('RESELLER.GROUP.PLACEHOLDER.GROUPNAME')}
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="supplier" style={{ fontWeight: 'bold' }}>
                                        {t('RESELLER.GROUP.LABEL.DISCOUNTVALUE')}
                                    </label>
                                    <InputText
                                        id="discount_value"
                                        value={resellerGroup.discount_value}
                                        onChange={(e) =>
                                            setResellerGroup((prev) => ({
                                                ...prev,
                                                discount_value: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !resellerGroup.discount_value
                                        })}
                                        placeholder={t('RESELLER.GROUP.PLACEHOLDER.DISCOUNTVALUE')}
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="supplier" style={{ fontWeight: 'bold' }}>
                                        {t('RESELLER.GROUP.LABEL.SUBRESELLERLIMIT')}
                                    </label>
                                    <InputText
                                        id="sub_reseller_limit"
                                        value={resellerGroup.sub_reseller_limit.toString()}
                                        onChange={(e) =>
                                            setResellerGroup((prev) => ({
                                                ...prev,
                                                sub_reseller_limit: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !resellerGroup.sub_reseller_limit
                                        })}
                                        placeholder={t('RESELLER.GROUP.PLACEHOLDER.SUBRESELLERLIMIT')}
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="status" style={{ fontWeight: 'bold' }}>
                                        {t('RESELLER.GROUP.LABEL.STATUS')}
                                    </label>
                                    <Dropdown
                                        id="status"
                                        value={resellerGroup.status}
                                        options={[
                                            { label: 'Active', value: 'Active' },
                                            { label: 'Inactive', value: 'Inactive' }
                                        ]}
                                        onChange={(e) =>
                                            setResellerGroup((prev) => ({
                                                ...prev,
                                                status: e.value
                                            }))
                                        }
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder={t('RESELLER.GROUP.PLACEHOLDER.STATUS')}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="discount_type" style={{ fontWeight: 'bold' }}>
                                        {t('RESELLER.GROUP.LABEL.DISCOUNTTYPE')}
                                    </label>
                                    <Dropdown
                                        id="discount_type"
                                        value={resellerGroup.discount_type}
                                        options={[
                                            { label: 'Percentage', value: 'Percentage' },
                                            { label: 'Fixed', value: 'Fixed' }
                                        ]}
                                        onChange={(e) =>
                                            setResellerGroup((prev) => ({
                                                ...prev,
                                                discount_type: e.value
                                            }))
                                        }
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder={t('RESELLER.GROUP.PLACEHOLDER.DISCOUNTTYPE')}
                                        className="w-full"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="can_create_sub_resellers" style={{ fontWeight: 'bold' }}>
                                        {t('RESELLER.GROUP.LABEL.CANADDSUBRESELLER')}
                                    </label>
                                    <Dropdown
                                        id="can_create_sub_resellers"
                                        value={resellerGroup.can_create_sub_resellers}
                                        options={[
                                            { label: 'Yes', value: 1 },
                                            { label: 'No', value: 0 }
                                        ]}
                                        onChange={(e) =>
                                            setResellerGroup((prev) => ({
                                                ...prev,
                                                can_create_sub_resellers: e.value
                                            }))
                                        }
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder={t('RESELLER.GROUP.PLACEHOLDER.CANADDSUBRESELLER')}
                                        className="w-full"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="can_sub_reseller_create_subs" style={{ fontWeight: 'bold' }}>
                                        {t('RESELLER.GROUP.LABEL.CANSUBRESELLERADDSUBS')}
                                    </label>
                                    <Dropdown
                                        id="can_sub_reseller_create_subs"
                                        value={resellerGroup.can_sub_reseller_create_subs}
                                        options={[
                                            { label: 'Yes', value: 1 },
                                            { label: 'No', value: 0 }
                                        ]}
                                        onChange={(e) =>
                                            setResellerGroup((prev) => ({
                                                ...prev,
                                                can_sub_reseller_create_subs: e.value
                                            }))
                                        }
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder={t('RESELLER.GROUP.PLACEHOLDER.CANSUBRESELLERADDSUBS')}
                                        className="w-full"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="notes" style={{ fontWeight: 'bold' }}>
                                        {t('RESELLER.GROUP.LABEL.NOTES')}
                                    </label>
                                    <InputTextarea
                                        value={resellerGroup.notes}
                                        onChange={(e) =>
                                            setResellerGroup((prev) => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))
                                        }
                                        rows={3}
                                        cols={30}
                                        placeholder={t('RESELLER.GROUP.PLACEHOLDER.NOTES')}
                                    />
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResellerGroupDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResellerGroupDialogFooter} onHide={hideDeleteResellerGroupDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {resellerGroup && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{resellerGroup.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResellerGroupsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteResellerGroupsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {resellerGroup && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default ResellerGroupPage;
