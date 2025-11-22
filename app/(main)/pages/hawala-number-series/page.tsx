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
import { Checkbox } from 'primereact/checkbox';
import { AppDispatch } from '@/app/redux/store';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { Paginator } from 'primereact/paginator';
import { isRTL } from '../../utilities/rtlUtil';
import {
    _fetchHawalaNumberSeriesList,
    _addHawalaNumberSeries,
    _editHawalaNumberSeries,
    _deleteHawalaNumberSeries,
    _changeHawalaNumberSeriesStatus,
    _fetchHawalaNextNumber
} from '@/app/redux/actions/hawalaSeriesActions';
import { HawalaBranch, HawalaNumberSeries } from '@/types/interface';
import { _fetchHawalaBranchList } from '@/app/redux/actions/hawalaBranchActions';

const HawalaNumberSeriesPage = () => {
    let emptyHawalaSeries: HawalaNumberSeries = {
        id: 0,
        branch_id: 0,
        prefix: '',
        current_number: 0,
        reset_daily: false,
        is_active: true
    };

    const [hawalaSeriesDialog, setHawalaSeriesDialog] = useState(false);
    const [deleteHawalaSeriesDialog, setDeleteHawalaSeriesDialog] = useState(false);
    const [deleteHawalaSeriesBulkDialog, setDeleteHawalaSeriesBulkDialog] = useState(false);
    const [hawalaSeries, setHawalaSeries] = useState<HawalaNumberSeries>(emptyHawalaSeries);
    const [selectedHawalaSeries, setSelectedHawalaSeries] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { series, loading, pagination, nextNumber } = useSelector((state: any) => state.hawalaNumberSeriesReducer);
    const { hawalaBranches } = useSelector((state: any) => state.hawalaBranchReducer);

    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');
    const [branchSearchTerm, setBranchSearchTerm] = useState('');

    useEffect(() => {
        dispatch(_fetchHawalaNumberSeriesList(1, searchTag));
        dispatch(_fetchHawalaBranchList(1, ''));
    }, [dispatch, searchTag]);

    // Debounced branch search
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(_fetchHawalaBranchList(1, branchSearchTerm));
        }, 300); // Debounce for 300ms

        return () => clearTimeout(timer);
    }, [branchSearchTerm, dispatch]);

    const openNew = () => {
        setHawalaSeries(emptyHawalaSeries);
        setSubmitted(false);
        setHawalaSeriesDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setHawalaSeriesDialog(false);
    };

    const hideDeleteHawalaSeriesDialog = () => {
        setDeleteHawalaSeriesDialog(false);
    };

    const hideDeleteHawalaSeriesBulkDialog = () => {
        setDeleteHawalaSeriesBulkDialog(false);
    };

    const saveHawalaSeries = () => {
        setSubmitted(true);

        if (!hawalaSeries.branch_id || !hawalaSeries.prefix || hawalaSeries.current_number === undefined) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        if (hawalaSeries.id && hawalaSeries.id !== 0) {
            dispatch(_editHawalaNumberSeries(hawalaSeries.id, hawalaSeries, toast, t));
        } else {
            dispatch(_addHawalaNumberSeries(hawalaSeries, toast, t));
        }

        setHawalaSeriesDialog(false);
        setHawalaSeries(emptyHawalaSeries);
        setSubmitted(false);
    };

    const editHawalaSeries = (series: HawalaNumberSeries) => {
        // Find the matching branch object from hawalaBranches
        const matchingBranch = hawalaBranches.find((branch: HawalaBranch) => branch.id === series.branch_id);

        setHawalaSeries({
            ...series,
            branch: matchingBranch
        });
        setHawalaSeriesDialog(true);
    };

    const confirmDeleteHawalaSeries = (series: HawalaNumberSeries) => {
        setHawalaSeries(series);
        setDeleteHawalaSeriesDialog(true);
    };

    const deleteHawalaSeries = () => {
        if (!hawalaSeries?.id) {
            console.error('Hawala Series ID is undefined.');
            return;
        }
        dispatch(_deleteHawalaNumberSeries(hawalaSeries?.id, toast, t));
        setDeleteHawalaSeriesDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteHawalaSeriesBulkDialog(true);
    };

    const handleStatusChange = (id: number, is_active: boolean) => {
        dispatch(_changeHawalaNumberSeriesStatus(id, is_active, toast, t));
    };

    const fetchNextNumber = (branchId: number) => {
        dispatch(_fetchHawalaNextNumber(branchId, toast, t));
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('HAWALA_SERIES.CREATE_NEW')}
                        icon="pi pi-plus"
                        severity="success"
                        className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                        onClick={openNew}
                    />
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex items-center">
                <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setSearchTag(e.currentTarget.value)}
                        placeholder={t('ECOMMERCE.COMMON.SEARCH')}
                        className="w-full md:w-auto"
                    />
                </span>
            </div>
        );
    };

    const branchBodyTemplate = (rowData: HawalaNumberSeries) => {
        //const branch = hawalaBranches.find((b: HawalaBranch) => b.id === rowData.branch_id);
        return (
            <>
                <span className="p-column-title">{t('HAWALA_SERIES.TABLE.BRANCH')}</span>
                {rowData?.branch?.name}
            </>
        );
    };

    const prefixBodyTemplate = (rowData: HawalaNumberSeries) => {
        return (
            <>
                <span className="p-column-title">{t('HAWALA_SERIES.TABLE.PREFIX')}</span>
                {rowData.prefix}
            </>
        );
    };

    const currentNumberBodyTemplate = (rowData: HawalaNumberSeries) => {
        return (
            <>
                <span className="p-column-title">{t('HAWALA_SERIES.TABLE.CURRENT_NUMBER')}</span>
                {rowData.current_number}
            </>
        );
    };

    const resetDailyBodyTemplate = (rowData: HawalaNumberSeries) => {
        return (
            <>
                <span className="p-column-title">{t('HAWALA_SERIES.TABLE.RESET_DAILY')}</span>
                <i className={classNames('pi', {
                    'pi-check text-green-500': rowData.reset_daily,
                    'pi-times text-red-500': !rowData.reset_daily
                })} />
            </>
        );
    };

    const statusBodyTemplate = (rowData: HawalaNumberSeries) => {
        const statusClass = rowData.is_active ? 'text-green-500' : 'text-red-500';
        const statusLabel = rowData.is_active ? t('APP.GENERAL.ACTIVE') : t('APP.GENERAL.INACTIVE');

        return (
            <>
                <span className="p-column-title">{t('HAWALA_SERIES.TABLE.STATUS')}</span>
                <span className={statusClass}>{statusLabel}</span>
            </>
        );
    };

    // const nextNumberBodyTemplate = (rowData: HawalaNumberSeries) => {
    //     return (
    //         <>
    //             <span className="p-column-title">{t('HAWALA_SERIES.TABLE.NEXT_NUMBER')}</span>
    //             <div className="flex items-center gap-2">
    //                 <span>{rowData.prefix}{rowData.current_number + 1}</span>
    //                 <Button 
    //                     icon="pi pi-refresh" 
    //                     rounded 
    //                     text 
    //                     severity="info" 
    //                     size="small"
    //                     onClick={() => fetchNextNumber(rowData.branch_id)}
    //                     tooltip={t('HAWALA_SERIES.FETCH_NEXT_NUMBER')}
    //                 />
    //             </div>
    //         </>
    //     );
    // };

    const actionBodyTemplate = (rowData: HawalaNumberSeries) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    severity="success"
                    size="small"
                    onClick={() => editHawalaSeries(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    severity="warning"
                    size="small"
                    onClick={() => confirmDeleteHawalaSeries(rowData)}
                />
                <Button
                    icon={rowData.is_active ? "pi pi-eye-slash" : "pi pi-eye"}
                    rounded
                    severity={rowData.is_active ? "secondary" : "info"}
                    size="small"
                    onClick={() => handleStatusChange(rowData.id, !rowData.is_active)}
                    tooltip={rowData.is_active ? t('DEACTIVATE') : t('ACTIVATE')}
                />
            </div>
        );
    };

    const hawalaSeriesDialogFooter = (
        <>
            <Button
                label={t('APP.GENERAL.CANCEL')}
                icon="pi pi-times"
                severity="danger"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={hideDialog}
            />
            <Button
                label={t('FORM.GENERAL.SUBMIT')}
                icon="pi pi-check"
                severity="success"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={saveHawalaSeries}
            />
        </>
    );

    const deleteHawalaSeriesDialogFooter = (
        <>
            <Button
                label={t('APP.GENERAL.CANCEL')}
                icon="pi pi-times"
                severity="danger"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={hideDeleteHawalaSeriesDialog}
            />
            <Button
                label={t('FORM.GENERAL.SUBMIT')}
                icon="pi pi-check"
                severity="success"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={deleteHawalaSeries}
            />
        </>
    );

    const deleteHawalaSeriesBulkDialogFooter = (
        <>
            <Button
                label={t('APP.GENERAL.CANCEL')}
                icon="pi pi-times"
                severity="danger"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={hideDeleteHawalaSeriesBulkDialog}
            />
            <Button
                label={t('FORM.GENERAL.SUBMIT')}
                icon="pi pi-check"
                severity="success"
                className={isRTL() ? 'rtl-button' : ''}
            />
        </>
    );

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchHawalaNumberSeriesList(page, searchTag));
    };

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />

                    {/* Next Number Display */}
                    {/* {nextNumber && (
                        <div className="mb-4 p-3 border-round bg-blue-50 border-1 border-blue-200">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-info-circle text-blue-500"></i>
                                <span className="font-semibold text-blue-700">
                                    {t('HAWALA_SERIES.NEXT_NUMBER_AVAILABLE')}: {nextNumber}
                                </span>
                            </div>
                        </div>
                    )} */}

                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={series}
                        selection={selectedHawalaSeries}
                        onSelectionChange={(e) => setSelectedHawalaSeries(e.value as any)}
                        dataKey="id"
                        paginator={false}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        globalFilter={globalFilter}
                        responsiveLayout="scroll"
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{
                            direction: isRTL() ? 'rtl' : 'ltr',
                            fontFamily: "'iranyekan', sans-serif,iranyekan"
                        }}
                    >
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="branch_id"
                            header={t('HAWALA_SERIES.TABLE.BRANCH')}
                            body={branchBodyTemplate}
                            sortable
                        />
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="prefix"
                            header={t('HAWALA_SERIES.TABLE.PREFIX')}
                            body={prefixBodyTemplate}
                            sortable
                        />
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="current_number"
                            header={t('HAWALA_SERIES.TABLE.CURRENT_NUMBER')}
                            body={currentNumberBodyTemplate}
                            sortable
                        />
                        {/* <Column 
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} 
                            field="next_number" 
                            header={t('HAWALA_SERIES.TABLE.NEXT_NUMBER')} 
                            body={nextNumberBodyTemplate} 
                        /> */}
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="reset_daily"
                            header={t('HAWALA_SERIES.TABLE.RESET_DAILY')}
                            body={resetDailyBodyTemplate}
                            sortable
                        />
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="is_active"
                            header={t('HAWALA_SERIES.TABLE.STATUS')}
                            body={statusBodyTemplate}
                            sortable
                        />
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '12rem' }}
                        />
                    </DataTable>

                    <Paginator
                        first={(pagination?.page - 1) * pagination?.items_per_page}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        firstPageLinkIcon={
                            isRTL()
                                ? "pi pi-angle-double-right"
                                : "pi pi-angle-double-left"
                        }
                        lastPageLinkIcon={
                            isRTL()
                                ? "pi pi-angle-double-left"
                                : "pi pi-angle-double-right"
                        }
                    />

                    {/* Add/Edit Dialog */}
                    <Dialog
                        visible={hawalaSeriesDialog}
                        style={{ width: '600px', padding: '5px' }}
                        header={t('HAWALA_SERIES.DETAILS')}
                        modal
                        className="p-fluid"
                        footer={hawalaSeriesDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="card flex flex-wrap p-fluid mt-3 gap-4">
                            <div className="flex-1 col-12">
                                <div className="field">
                                    <label htmlFor="branch" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA_SERIES.FORM.BRANCH')} *
                                    </label>
                                    <Dropdown
                                        id="branch"
                                        value={hawalaSeries.branch}
                                        options={hawalaBranches}
                                        onChange={(e) => {
                                            setHawalaSeries((prev) => ({
                                                ...prev,
                                                branch: e.value,
                                                branch_id: e.value?.id || 0
                                            }));
                                        }}
                                        optionLabel="name"
                                        filter
                                        filterBy="name"
                                        filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                        showFilterClear
                                        placeholder={t('HAWALA_SERIES.FORM.SELECT_BRANCH')}
                                        className={classNames('w-full', {
                                            'p-invalid': submitted && !hawalaSeries.branch_id
                                        })}
                                        panelClassName="min-w-[20rem]"
                                        onFilter={(e) => {
                                            setBranchSearchTerm(e.filter);
                                        }}
                                    />
                                    {submitted && !hawalaSeries.branch_id && (
                                        <small style={{ color: 'red', fontSize: '12px' }}>
                                            {t('APP.VALIDATION.REQUIRED_BRANCH')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="prefix" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA_SERIES.FORM.PREFIX')} *
                                    </label>
                                    <InputText
                                        id="prefix"
                                        value={hawalaSeries.prefix}
                                        onChange={(e) =>
                                            setHawalaSeries((prev: any) => ({
                                                ...prev,
                                                prefix: e.target.value.toUpperCase()
                                            }))
                                        }
                                        required
                                        placeholder={t('HAWALA_SERIES.FORM.PREFIX_PLACEHOLDER')}
                                        className={classNames({
                                            'p-invalid': submitted && !hawalaSeries.prefix
                                        })}
                                    />
                                    {submitted && !hawalaSeries.prefix && (
                                        <small style={{ color: 'red', fontSize: '12px' }}>
                                            {t('APP.VALIDATION.REQUIRED_PREFIX')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="current_number" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA_SERIES.FORM.CURRENT_NUMBER')} *
                                    </label>
                                    <InputText
                                        id="current_number"
                                        value={hawalaSeries.current_number?.toString()}
                                        onChange={(e) =>
                                            setHawalaSeries((prev: any) => ({
                                                ...prev,
                                                current_number: Number(e.target.value)
                                            }))
                                        }
                                        required
                                        keyfilter="num"
                                        placeholder={t('HAWALA_SERIES.FORM.CURRENT_NUMBER_PLACEHOLDER')}
                                        className={classNames({
                                            'p-invalid': submitted && hawalaSeries.current_number === undefined
                                        })}
                                    />
                                    {submitted && hawalaSeries.current_number === undefined && (
                                        <small style={{ color: 'red', fontSize: '12px' }}>
                                            {t('APP.VALIDATION.REQUIRED_CURRENT_NUMBER')}
                                        </small>
                                    )}
                                </div>

                                <div className="field flex align-items-center gap-2">
                                    <Checkbox
                                        id="reset_daily"
                                        checked={hawalaSeries.reset_daily}
                                        onChange={(e) =>
                                            setHawalaSeries((prev: any) => ({
                                                ...prev,
                                                reset_daily: e.checked || false
                                            }))
                                        }
                                    />
                                    <label htmlFor="reset_daily" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA_SERIES.FORM.RESET_DAILY')}
                                    </label>
                                </div>

                                <div className="field flex align-items-center gap-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={hawalaSeries.is_active}
                                        onChange={(e) =>
                                            setHawalaSeries((prev: any) => ({
                                                ...prev,
                                                is_active: e.checked || false
                                            }))
                                        }
                                    />
                                    <label htmlFor="is_active" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA_SERIES.FORM.ACTIVE')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        visible={deleteHawalaSeriesDialog}
                        style={{ width: '450px' }}
                        header={t('APP.GENERAL.CONFIRM')}
                        modal
                        footer={deleteHawalaSeriesDialogFooter}
                        onHide={hideDeleteHawalaSeriesDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {hawalaSeries && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE', {
                                        name: `${hawalaSeries.prefix} series`
                                    })}
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* Bulk Delete Confirmation Dialog */}
                    <Dialog
                        visible={deleteHawalaSeriesBulkDialog}
                        style={{ width: '450px' }}
                        header={t('APP.GENERAL.CONFIRM')}
                        modal
                        footer={deleteHawalaSeriesBulkDialogFooter}
                        onHide={hideDeleteHawalaSeriesBulkDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            <span>{t('APP.DELETE_SELECTED_CONFIRMATION')}</span>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default HawalaNumberSeriesPage;