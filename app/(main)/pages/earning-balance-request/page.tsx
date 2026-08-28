/* eslint-disable @next/next/no-img-element */
'use client';
import { _addEarningBalanceRequest, _changeEarningBalanceStatus, _fetchEarningBalanceRequestList } from '@/app/redux/actions/earningBalanceActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { AppDispatch } from '@/app/redux/store';
import i18n from '@/i18n';
import { EarningBalance, Reseller } from '@/types/interface';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { ProgressBar } from 'primereact/progressbar';
import { SplitButton } from 'primereact/splitbutton';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { customCellStyle } from '../../utilities/customRow';
import { isRTL } from '../../utilities/rtlUtil';
import CustomDropdownWithSearch from '@/app/(main)/components/customDropDownWithSearch';

const EarningBalanceRequest = () => {
    // State management
    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [statusChangeDialog, setStatusChangeDialog] = useState(false);
    const [selectedRequests, setSelectedRequests] = useState<EarningBalance[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { earningBalances, loading } = useSelector((state: any) => state.earningBalanceReducer);
    const { resellers, loading: resellersLoading } = useSelector((state: any) => state.resellerReducer);
    const [selectedRequest, setSelectedRequest] = useState<EarningBalance | null>(null);
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        reseller_id: '',
        amount: 0
    });

    // Fetch data on component mount and when search term changes
    useEffect(() => {
        dispatch(_fetchResellers());
        dispatch(_fetchEarningBalanceRequestList(1, searchTerm));
    }, [dispatch, searchTerm]);

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

    // Dialog handlers
    const openNew = () => {
        setFormData({
            reseller_id: '',
            amount: 0
        });
        setSubmitted(false);
        setAddDialogVisible(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAddDialogVisible(false);
    };

    const hideDeleteDialog = () => {
        setDeleteDialogVisible(false);
    };

    const confirmDeleteRequest = (request: EarningBalance) => {
        setSelectedRequest(request);
        setDeleteDialogVisible(true);
    };

    const confirmStatusChange = (request: EarningBalance, status: string) => {
        setSelectedRequest(request);
        setSelectedStatus(status);
        setStatusChangeDialog(true);
    };

    const changeStatus = () => {
        if (!selectedRequest?.id || !selectedStatus) return;

        dispatch(_changeEarningBalanceStatus(selectedRequest.id, selectedStatus, toast, t));

        setStatusChangeDialog(false);
    };

    const submitRequest = () => {
        setSubmitted(true);

        if (!formData.reseller_id || formData.amount <= 0) return;

        dispatch(_addEarningBalanceRequest(formData, toast, t));
        dispatch(_fetchEarningBalanceRequestList());
        setAddDialogVisible(false);
    };

    // Templates for DataTable
    // const leftToolbarTemplate = () => {
    //     return (
    //         <React.Fragment>
    //             <span className="block mt-2 md:mt-0 p-input-icon-left">
    //                 <i className="pi pi-search" />
    //                 <InputText type="search" onInput={(e) => setSearchTerm(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} />
    //             </span>
    //         </React.Fragment>
    //     );
    // };

    const [localSearchTerm, setLocalSearchTerm] = useState('');

    const leftToolbarTemplate = () => {

        const handleSearch = () => {
            setSearchTerm(localSearchTerm);
        };

        const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        };

        return (
            <React.Fragment>
                <div className="flex align-items-center gap-2">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            type="search"
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('ECOMMERCE.COMMON.SEARCH')}
                        />
                    </span>
                    <Button
                        label={t('SEARCH')}
                        onClick={handleSearch}
                        className="p-button-sm"
                    />
                    {localSearchTerm && (
                        <Button
                            icon="pi pi-times"
                            onClick={() => {
                                setLocalSearchTerm('');
                                setSearchTerm('');
                            }}
                            className="p-button-sm p-button-secondary p-button-text"

                        />
                    )}
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-content gap-2">
                    <Button label={t('APP.GENERAL.NEW')} icon="pi pi-plus" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={openNew} />
                    {/* <Button
                        label={t('APP.GENERAL.DELETE')}
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={() => setDeleteDialogVisible(true)}
                        disabled={!selectedRequests || selectedRequests.length === 0}
                        className={isRTL() ? 'rtl-button' : ''}
                    /> */}
                </div>
            </React.Fragment>
        );
    };

    const amountBodyTemplate = (rowData: EarningBalance) => {
        return (
            <>
                <span className="p-column-title">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.AMOUNT')}</span>
                {rowData.amount}
            </>
        );
    };

    const resellerBodyTemplate = (rowData: EarningBalance) => {
        return (
            <>
                <span className="p-column-title">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.RESELLER')}</span>
                {rowData.reseller?.reseller_name}
            </>
        );
    };

    const reviewedByBodyTemplate = (rowData: EarningBalance) => {
        return (
            <>
                <span className="p-column-title">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.REVIEWED_BY')}</span>
                <span style={{ fontSize: '0.8rem' }}>{rowData.reviewed_by}</span>
            </>
        );
    };
    const reviewedAtBodyTemplate = (rowData: EarningBalance) => {
        return (
            <>
                <span className="p-column-title">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.REVIEWED_AT')}</span>
                <span style={{ fontSize: '0.8rem' }}>{rowData.reviewed_at}</span>
            </>
        );
    };

    const adminNotesBodyTemplate = (rowData: EarningBalance) => {
        return (
            <>
                <span className="p-column-title">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.NOTES')}</span>
                <span style={{ fontSize: '0.8rem' }}>{rowData.admin_note}</span>
            </>
        );
    };

    const statusBodyTemplate = (rowData: EarningBalance) => {
        const getStatusInfo = (status: string | null) => {
            switch (status) {
                case 'pending':
                    return {
                        label: t('ORDER.STATUS.PENDING'),
                        class: 'bg-yellow-500 text-white'
                    };
                case 'approved':
                    return {
                        label: t('ORDER.STATUS.CONFIRMED'),
                        class: 'bg-green-500 text-white'
                    };
                case 'rejected':
                    return {
                        label: t('ORDER.STATUS.REJECTED'),
                        class: 'bg-red-500 text-white'
                    };
                default:
                    return {
                        label: t('ORDER.STATUS.UNKNOWN'),
                        class: 'bg-gray-500 text-white'
                    };
            }
        };

        const statusInfo = getStatusInfo(rowData.status);

        return (
            <>
                <span className="p-column-title">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.STATUS')}</span>
                <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${statusInfo.class}`}>{statusInfo.label}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: EarningBalance) => {
        const items = [
            {
                label: t('ORDER.STATUS.APPROVE'),
                icon: 'pi pi-check',
                command: () => confirmStatusChange(rowData, 'approved')
            },
            {
                label: t('ORDER.STATUS.REJECT'),
                icon: 'pi pi-times',
                command: () => confirmStatusChange(rowData, 'rejected')
            },
            {
                label: t('APP.GENERAL.DELETE'),
                icon: 'pi pi-trash',
                command: () => confirmDeleteRequest(rowData)
            }
        ];

        return <SplitButton label="" icon="pi pi-cog" model={items} className="p-button-rounded" severity="info" dir={isRTL() ? 'rtl' : 'ltr'} />;
    };

    // Dialog footers
    const addDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideDialog} className={isRTL() ? 'rtl-button' : ''} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={submitRequest} loading={loading} className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    const statusChangeDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={() => setStatusChangeDialog(false)} className={isRTL() ? 'rtl-button' : ''} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={changeStatus} loading={loading} className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={earningBalances}
                        selection={selectedRequests}
                        onSelectionChange={(e) => setSelectedRequests(e.value)}
                        dataKey="id"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        responsiveLayout="scroll"
                    >
                        {/* <Column
                            headerStyle={{ width: '4rem' }}
                        /> */}
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} />

                        <Column header={t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.RESELLER')} body={resellerBodyTemplate} style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} />
                        <Column header={t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.AMOUNT')} body={amountBodyTemplate} style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_number"
                            header={t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.REVIEWED_BY')}
                            body={reviewedByBodyTemplate}

                        ></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_number"
                            header={t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.REVIEWED_AT')}
                            body={reviewedAtBodyTemplate}

                        ></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_number"
                            header={t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.NOTES')}
                            body={adminNotesBodyTemplate}

                        ></Column>
                        <Column header={t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.STATUS')} body={statusBodyTemplate} style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} />
                    </DataTable>

                    {/* Add Earning Balance Dialog */}
                    <Dialog visible={addDialogVisible} style={{ width: '500px' }} header={t('EARNING_BALANCE_REQUEST.ADD_DIALOG.TITLE')} modal className="p-fluid" footer={addDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="reseller">
                                {t('EARNING_BALANCE_REQUEST.ADD_DIALOG.RESELLER')}
                                <span className="text-red-500">*</span>
                            </label>
                            {/* <Dropdown
                                id="reseller"
                                value={formData.reseller_id}
                                options={resellers.map((reseller: Reseller) => ({
                                    label: reseller.reseller_name,
                                    value: reseller.id
                                }))}
                                onChange={(e) => setFormData({ ...formData, reseller_id: e.value })}
                                placeholder={t('FORM.GENERAL.SELECT')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !formData.reseller_id
                                })}
                                // loading={resellersLoading}
                            /> */}
                            {/* <Dropdown
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
                                filterIcon
                            /> */}

                             <CustomDropdownWithSearch
                                        id="reseller"
                                        value={formData.reseller_id}
                                        options={resellers}
                                        onChange={(selectedOption) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                reseller_id: selectedOption?.id // This will be the full object
                                            }));
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
                                        returnFullObject={true} // This ensures we get the full object
                                        itemTemplate={(option) => {
                                            if (!option) return null;
                                            return (
                                                <div className="flex flex-column p-2 gap-1">
                                                    <div className="font-semibold">
                                                        {option.contact_name} || {option.reseller_name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {option.phone && (
                                                            <span className="ml-2 text-gray-500">{option.phone}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                        valueTemplate={(option) => {
                                            if (!option) return t('PAYMENT.FORM.INPUT.RESELLER');
                                            return (
                                                <div className="flex flex-column">
                                                    <span style={{ fontWeight: 'bold' }}>
                                                        {option.reseller_name}
                                                    </span>
                                                    <small className="text-gray-500 text-xs">
                                                        {option.contact_name} {option.phone && `${option.phone}`}
                                                    </small>
                                                </div>
                                            );
                                        }}
                                        onSearch={(searchTerm) => {
                                            setResellerSearchTerm(searchTerm);
                                        }}
                                    />

                            {submitted && !formData.reseller_id && <small className="p-invalid">{t('FORM.VALIDATION.REQUIRED')}</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="amount">
                                {t('EARNING_BALANCE_REQUEST.ADD_DIALOG.AMOUNT')}
                                <span className="text-red-500">*</span>
                            </label>
                            <InputNumber
                                id="amount"
                                value={formData.amount}
                                onValueChange={(e) => setFormData({ ...formData, amount: e.value || 0 })}
                                mode="currency"
                                currency="USD"
                                locale="en-US"
                                required
                                className={classNames({
                                    'p-invalid': submitted && formData.amount <= 0
                                })}
                            />
                            {submitted && formData.amount <= 0 && <small className="p-invalid">{t('FORM.VALIDATION.AMOUNT_POSITIVE')}</small>}
                        </div>
                    </Dialog>

                    {/* Status Change Dialog */}
                    <Dialog visible={statusChangeDialog} style={{ width: '450px' }} header={t('EARNING_BALANCE_REQUEST.STATUS_DIALOG.TITLE')} modal footer={statusChangeDialogFooter} onHide={() => setStatusChangeDialog(false)}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {selectedRequest && (
                                <span>
                                    {t('EARNING_BALANCE_REQUEST.STATUS_DIALOG.CONFIRMATION')}
                                    <b>{selectedRequest.amount}</b> {t('FOR')} {selectedRequest.reseller?.reseller_name}?
                                    <br />
                                    {t('NEW_STATUS')}: {selectedStatus === 'approved' && t('ORDER.STATUS.CONFIRMED')}
                                    {selectedStatus === 'rejected' && t('ORDER.STATUS.REJECTED')}
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        visible={deleteDialogVisible}
                        style={{ width: '450px' }}
                        header={t('TABLE.GENERAL.CONFIRM')}
                        modal
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideDeleteDialog} />
                                <Button
                                    label={t('FORM.GENERAL.SUBMIT')}
                                    icon="pi pi-check"
                                    severity="success"
                                    onClick={() => { }} // Implement delete functionality
                                    loading={loading}
                                />
                            </>
                        }
                        onHide={hideDeleteDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {selectedRequest && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the request for <b>{selectedRequest.amount}</b> {t('FOR')} {selectedRequest.reseller?.reseller_name}?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(EarningBalanceRequest);
