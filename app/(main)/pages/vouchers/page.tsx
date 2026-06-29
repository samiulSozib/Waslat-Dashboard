// /* eslint-disable @next/next/no-img-element */
// 'use client';
// import { Button } from 'primereact/button';
// import { Column } from 'primereact/column';
// import { DataTable } from 'primereact/datatable';
// import { Dialog } from 'primereact/dialog';
// import { InputText } from 'primereact/inputtext';
// import { Toast } from 'primereact/toast';
// import { Toolbar } from 'primereact/toolbar';
// import { classNames } from 'primereact/utils';
// import React, { useEffect, useRef, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useSelector } from 'react-redux';
// import { Dropdown } from 'primereact/dropdown';
// import { Paginator } from 'primereact/paginator';
// import { AppDispatch } from '@/app/redux/store';
// import { ProgressBar } from 'primereact/progressbar';
// import withAuth from '../../authGuard';
// import { useTranslation } from 'react-i18next';
// import { customCellStyle } from '../../utilities/customRow';
// import i18n from '@/i18n';
// import { isRTL } from '../../utilities/rtlUtil';
// import { Calendar } from 'primereact/calendar';
// import { InputTextarea } from 'primereact/inputtextarea';
// import { Chip } from 'primereact/chip';
// import { Tag } from 'primereact/tag';

// // Import voucher actions
// import {
//     _fetchVoucherList,
//     _addVoucher,
//     _editVoucher,
//     _deleteVoucher,
//     _deleteSelectedVouchers,
//     _bulkImportVouchers,
//     _fetchSocialCompanies,
//     _fetchBundleStats,
//     _clearBulkImportState,
// } from '@/app/redux/actions/voucherActions';

// // Import interfaces
// import {
//     Voucher,
//     VoucherQueryParams,
//     CreateVoucherPayload,
//     UpdateVoucherPayload,
//     BulkImportPayload,
//     BulkImportVoucher,
//     BundleStat,
// } from '@/types/interface';

// const VoucherPage = () => {
//     // ============================
//     // State Definitions
//     // ============================

//     const emptyVoucher: Voucher = {
//         id: undefined,
//         company_name: '',
//         bundle_title: '',
//         bundle: {
//             service: {
//                 id: 0,
//                 service_category_id: '',
//                 company_id: '',
//                 service_category: {
//                     id: 0,
//                     category_name: '',
//                     type: '',
//                 },
//                 company: [],
//             },
//         },
//         voucher_code: '',
//         provider: '',
//         expires_at: '',
//         notes: '',
//         metadata: {},
//         status: '',
//         created_at: '',
//         updated_at: '',
//     };

//     // Voucher form state
//     const [voucherDialog, setVoucherDialog] = useState(false);
//     const [deleteVoucherDialog, setDeleteVoucherDialog] = useState(false);
//     const [deleteVouchersDialog, setDeleteVouchersDialog] = useState(false);
//     const [bulkImportDialog, setBulkImportDialog] = useState(false);
//     const [voucher, setVoucher] = useState<Voucher>(emptyVoucher);
//     const [selectedVouchers, setSelectedVouchers] = useState<Voucher[] | null>(null);
//     const [submitted, setSubmitted] = useState(false);
//     const [globalFilter, setGlobalFilter] = useState('');
//     const [searchTag, setSearchTag] = useState('');
//     const [filterDialogVisible, setFilterDialogVisible] = useState(false);
//     const toast = useRef<Toast>(null);
//     const dt = useRef<DataTable<any>>(null);
//     const dispatch = useDispatch<AppDispatch>();
//     const { t } = useTranslation();

//     // Redux state
//     const { vouchers, statistics, pagination, loading, bundleStats, bulkImport } = useSelector(
//         (state: any) => state.voucherReducer
//     );

//     // Filter state
//     const [filters, setFilters] = useState<VoucherQueryParams>({
//         page: 1,
//         items_per_page: 20,
//         status: 'available',
//         bundle_id: undefined,
//         search: '',
//         provider: '',
//     });

//     const [activeFilters, setActiveFilters] = useState<VoucherQueryParams>({});

//     // Bulk import state
//     const [bulkImportData, setBulkImportData] = useState<BulkImportPayload>({
//         bundle_id: 0,
//         provider: 'midasbuy',
//         vouchers: [],
//     });

//     const [bulkVoucherCode, setBulkVoucherCode] = useState('');
//     const [bulkVoucherExpiry, setBulkVoucherExpiry] = useState<Date | null>(null);
//     const [bulkVoucherNotes, setBulkVoucherNotes] = useState('');
//     const [bulkVoucherMetadata, setBulkVoucherMetadata] = useState('');

//     // ============================
//     // Data Fetching
//     // ============================

//     useEffect(() => {
//         dispatch(_fetchVoucherList({ page: 1, items_per_page: 20 }));
//         dispatch(_fetchSocialCompanies());
//         dispatch(_fetchBundleStats());
//     }, [dispatch]);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             dispatch(_fetchVoucherList({ ...filters, search: searchTag }));
//         }, 300);
//         return () => clearTimeout(timer);
//     }, [searchTag, filters, dispatch]);

//     useEffect(() => {
//         if (Object.keys(activeFilters).length > 0) {
//             dispatch(_fetchVoucherList({ ...filters, ...activeFilters }));
//         }
//     }, [activeFilters, dispatch]);

//     // ============================
//     // CRUD Operations
//     // ============================

//     const openNew = () => {
//         setVoucher({ ...emptyVoucher });
//         setSubmitted(false);
//         setVoucherDialog(true);
//     };

//     const hideDialog = () => {
//         setSubmitted(false);
//         setVoucherDialog(false);
//         setVoucher({ ...emptyVoucher });
//     };

//     const hideDeleteVoucherDialog = () => {
//         setDeleteVoucherDialog(false);
//         setVoucher({ ...emptyVoucher });
//     };

//     const hideDeleteVouchersDialog = () => {
//         setDeleteVouchersDialog(false);
//         setSelectedVouchers(null);
//     };

//     const hideBulkImportDialog = () => {
//         setBulkImportDialog(false);
//         setBulkImportData({
//             bundle_id: 0,
//             provider: 'midasbuy',
//             vouchers: [],
//         });
//         setBulkVoucherCode('');
//         setBulkVoucherExpiry(null);
//         setBulkVoucherNotes('');
//         setBulkVoucherMetadata('');
//         dispatch(_clearBulkImportState());
//     };

//     const saveVoucher = () => {
//         setSubmitted(true);

//         if (!voucher.voucher_code || !voucher.expires_at || !voucher.bundle?.service?.id) {
//             toast.current?.show({
//                 severity: 'error',
//                 summary: t('VALIDATION_ERROR'),
//                 detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
//                 life: 3000,
//             });
//             return;
//         }

//         const payload: CreateVoucherPayload = {
//             bundle_id: voucher.bundle?.service?.id || 0,
//             voucher_code: voucher.voucher_code,
//             provider: voucher.provider || 'midasbuy',
//             expires_at: voucher.expires_at,
//             notes: voucher.notes,
//             metadata: voucher.metadata,
//         };

//         if (voucher.id) {
//             // Edit existing voucher
//             const updatePayload: UpdateVoucherPayload = {
//                 voucher_code: voucher.voucher_code,
//                 notes: voucher.notes,
//                 expires_at: voucher.expires_at,
//                 metadata: voucher.metadata,
//                 status: voucher.status,
//             };
//             dispatch(_editVoucher(voucher.id, updatePayload, toast, t));
//         } else {
//             // Create new voucher
//             dispatch(_addVoucher(payload, toast, t));
//         }

//         setVoucherDialog(false);
//         setVoucher({ ...emptyVoucher });
//         setSubmitted(false);
//     };

//     const editVoucher = (voucherData: Voucher) => {
//         setVoucher({ ...voucherData });
//         setVoucherDialog(true);
//     };

//     const confirmDeleteVoucher = (voucherData: Voucher) => {
//         setVoucher({ ...voucherData });
//         setDeleteVoucherDialog(true);
//     };

//     const deleteVoucher = () => {
//         if (voucher.id) {
//             dispatch(_deleteVoucher(voucher.id, toast, t));
//         }
//         setDeleteVoucherDialog(false);
//         setVoucher({ ...emptyVoucher });
//     };

//     const confirmDeleteSelected = () => {
//         if (!selectedVouchers || selectedVouchers.length === 0) {
//             toast.current?.show({
//                 severity: 'warn',
//                 summary: t('VALIDATION_WARNING'),
//                 detail: t('NO_SELECTED_ITEMS_FOUND'),
//                 life: 3000,
//             });
//             return;
//         }
//         setDeleteVouchersDialog(true);
//     };

//     const deleteSelectedVouchers = async () => {
//         if (!selectedVouchers || selectedVouchers.length === 0) {
//             toast.current?.show({
//                 severity: 'error',
//                 summary: t('VALIDATION_ERROR'),
//                 detail: t('NO_SELECTED_ITEMS_FOUND'),
//                 life: 3000,
//             });
//             return;
//         }

//         const selectedIds = selectedVouchers
//             .map((v) => v.id)
//             .filter((id): id is number => id !== undefined);

//         await _deleteSelectedVouchers(selectedIds, toast, t);
//         dispatch(_fetchVoucherList(filters));

//         setSelectedVouchers(null);
//         setDeleteVouchersDialog(false);
//     };

//     // ============================
//     // Bulk Import Functions
//     // ============================

//     const openBulkImport = () => {
//         setBulkImportDialog(true);
//         setBulkImportData({
//             bundle_id: 0,
//             provider: 'midasbuy',
//             vouchers: [],
//         });
//         setBulkVoucherCode('');
//         setBulkVoucherExpiry(null);
//         setBulkVoucherNotes('');
//         setBulkVoucherMetadata('');
//         dispatch(_clearBulkImportState());
//     };

//     const addBulkVoucher = () => {
//         if (!bulkVoucherCode) {
//             toast.current?.show({
//                 severity: 'error',
//                 summary: t('VALIDATION_ERROR'),
//                 detail: t('PLEASE_ENTER_VOUCHER_CODE'),
//                 life: 3000,
//             });
//             return;
//         }

//         if (!bulkVoucherExpiry) {
//             toast.current?.show({
//                 severity: 'error',
//                 summary: t('VALIDATION_ERROR'),
//                 detail: t('PLEASE_SELECT_EXPIRY_DATE'),
//                 life: 3000,
//             });
//             return;
//         }

//         let metadata = {};
//         if (bulkVoucherMetadata) {
//             try {
//                 metadata = JSON.parse(bulkVoucherMetadata);
//             } catch (e) {
//                 toast.current?.show({
//                     severity: 'error',
//                     summary: t('VALIDATION_ERROR'),
//                     detail: t('INVALID_JSON_FORMAT'),
//                     life: 3000,
//                 });
//                 return;
//             }
//         }

//         const newVoucher: BulkImportVoucher = {
//             code: bulkVoucherCode,
//             expires_at: bulkVoucherExpiry.toISOString().replace('T', ' ').slice(0, 19),
//             notes: bulkVoucherNotes || undefined,
//             metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
//         };

//         setBulkImportData((prev) => ({
//             ...prev,
//             vouchers: [...prev.vouchers, newVoucher],
//         }));

//         // Clear fields
//         setBulkVoucherCode('');
//         setBulkVoucherExpiry(null);
//         setBulkVoucherNotes('');
//         setBulkVoucherMetadata('');

//         toast.current?.show({
//             severity: 'success',
//             summary: t('SUCCESS'),
//             detail: t('VOUCHER_ADDED_TO_BULK_LIST'),
//             life: 2000,
//         });
//     };

//     const removeBulkVoucher = (index: number) => {
//         setBulkImportData((prev) => ({
//             ...prev,
//             vouchers: prev.vouchers.filter((_, i) => i !== index),
//         }));
//     };

//     const submitBulkImport = () => {
//         if (bulkImportData.vouchers.length === 0) {
//             toast.current?.show({
//                 severity: 'error',
//                 summary: t('VALIDATION_ERROR'),
//                 detail: t('NO_VOUCHERS_TO_IMPORT'),
//                 life: 3000,
//             });
//             return;
//         }

//         if (!bulkImportData.bundle_id) {
//             toast.current?.show({
//                 severity: 'error',
//                 summary: t('VALIDATION_ERROR'),
//                 detail: t('PLEASE_SELECT_BUNDLE'),
//                 life: 3000,
//             });
//             return;
//         }

//         dispatch(_bulkImportVouchers(bulkImportData, toast, t));
//     };

//     // ============================
//     // Filter Functions
//     // ============================

//     const handleSubmitFilter = (filterData: VoucherQueryParams) => {
//         setActiveFilters(filterData);
//     };

//     const filterRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             const target = event.target as HTMLElement;
//             if (target.closest('.p-dropdown-panel')) {
//                 return;
//             }
//             if (filterDialogVisible && filterRef.current && !filterRef.current.contains(target)) {
//                 setFilterDialogVisible(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [filterDialogVisible]);

//     // ============================
//     // Table Templates
//     // ============================

//     const statusBodyTemplate = (rowData: Voucher) => {
//         const statusMap: Record<
//             string,
//             { severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary'; label: string }
//         > = {
//             available: { severity: 'success', label: t('VOUCHER.STATUS.AVAILABLE') },
//             used: { severity: 'warning', label: t('VOUCHER.STATUS.USED') },
//             reserved: { severity: 'info', label: t('VOUCHER.STATUS.RESERVED') },
//             expired: { severity: 'danger', label: t('VOUCHER.STATUS.EXPIRED') },
//         };

//         const status = rowData.status || 'available';
//         const statusInfo = statusMap[status] || statusMap.available;

//         return (
//             <>
//                 <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.STATUS')}</span>
//                 {/* <Tag severity={statusInfo.severity} value={statusInfo.label} /> */}
//             </>
//         );
//     };

//     const voucherCodeBodyTemplate = (rowData: Voucher) => {
//         return (
//             <>
//                 <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.CODE')}</span>
//                 <span className="font-bold text-primary" style={{ fontSize: '0.85rem' }}>
//                     {rowData.voucher_code}
//                 </span>
//             </>
//         );
//     };

//     const bundleTitleBodyTemplate = (rowData: Voucher) => {
//         return (
//             <>
//                 <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.BUNDLE')}</span>
//                 <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle_title}</span>
//             </>
//         );
//     };

//     const companyNameBodyTemplate = (rowData: Voucher) => {
//         return (
//             <>
//                 <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.COMPANY')}</span>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.company_name}</span>
//                 </div>
//             </>
//         );
//     };

//     const providerBodyTemplate = (rowData: Voucher) => {
//         return (
//             <>
//                 <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.PROVIDER')}</span>
//                 <Chip label={rowData.provider || 'N/A'} className="text-sm" />
//             </>
//         );
//     };

//     const expiryDateBodyTemplate = (rowData: Voucher) => {
//         const formatDate = (dateString: string) => {
//             if (!dateString) return { formattedDate: 'N/A', formattedTime: '' };
//             const date = new Date(dateString);
//             const optionsDate: Intl.DateTimeFormatOptions = {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//             };
//             const optionsTime: Intl.DateTimeFormatOptions = {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true,
//             };
//             const formattedDate = date.toLocaleDateString('en-US', optionsDate);
//             const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

//             return { formattedDate, formattedTime };
//         };

//         const { formattedDate, formattedTime } = formatDate(rowData.expires_at || '');

//         return (
//             <>
//                 <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.EXPIRES')}</span>
//                 <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate || 'N/A'}</span>
//                 <br />
//                 <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime || ''}</span>
//             </>
//         );
//     };

//     const notesBodyTemplate = (rowData: Voucher) => {
//         return (
//             <>
//                 <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.NOTES')}</span>
//                 <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.notes || '-'}</span>
//             </>
//         );
//     };

//     const createdAtBodyTemplate = (rowData: Voucher) => {
//         const formatDate = (dateString: string) => {
//             if (!dateString) return { formattedDate: 'N/A', formattedTime: '' };
//             const date = new Date(dateString);
//             const optionsDate: Intl.DateTimeFormatOptions = {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//             };
//             const optionsTime: Intl.DateTimeFormatOptions = {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true,
//             };
//             const formattedDate = date.toLocaleDateString('en-US', optionsDate);
//             const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

//             return { formattedDate, formattedTime };
//         };

//         const { formattedDate, formattedTime } = formatDate(rowData.created_at || '');

//         return (
//             <>
//                 <span className="p-column-title">{t('TABLE.GENERAL.CREATEDAT')}</span>
//                 <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
//                 <br />
//                 <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
//             </>
//         );
//     };

//     const actionBodyTemplate = (rowData: Voucher) => {
//         return (
//             <>
//                 <Button
//                     icon="pi pi-pencil"
//                     rounded
//                     severity="success"
//                     className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
//                     onClick={() => editVoucher(rowData)}
//                 />
//                 <Button
//                     icon="pi pi-trash"
//                     rounded
//                     severity="warning"
//                     onClick={() => confirmDeleteVoucher(rowData)}
//                 />
//             </>
//         );
//     };

//     // ============================
//     // Statistics Summary
//     // ============================

//     const statisticsSummary = () => {
//         if (!statistics) return null;

//         const statItems = [
//             { label: t('VOUCHER.STATS.TOTAL'), value: statistics.total, color: 'text-blue-500' },
//             { label: t('VOUCHER.STATS.AVAILABLE'), value: statistics.available, color: 'text-green-500' },
//             { label: t('VOUCHER.STATS.USED'), value: statistics.used, color: 'text-yellow-500' },
//             { label: t('VOUCHER.STATS.RESERVED'), value: statistics.reserved, color: 'text-purple-500' },
//             { label: t('VOUCHER.STATS.EXPIRED'), value: statistics.expired, color: 'text-red-500' },
//         ];

//         return (
//             <div className="grid mb-4">
//                 {statItems.map((item) => (
//                     <div key={item.label} className="col-12 sm:col-6 md:col-2 lg:col-2">
//                         <div className="p-3 shadow-1 border-round bg-white">
//                             <div className="text-sm text-500">{item.label}</div>
//                             <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     // ============================
//     // Toolbar Templates
//     // ============================

//     const leftToolbarTemplate = () => {
//         return (
//             <div className="flex items-center gap-2">
//                 <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
//                     <i className="pi pi-search" />
//                     <InputText
//                         type="search"
//                         onInput={(e) => setSearchTag(e.currentTarget.value)}
//                         placeholder={t('ECOMMERCE.COMMON.SEARCH')}
//                         className="w-full md:w-auto"
//                     />
//                 </span>
//             </div>
//         );
//     };

//     const rightToolbarTemplate = () => {
//         const hasSelectedVouchers = selectedVouchers && selectedVouchers.length > 0;
//         return (
//             <React.Fragment>
//                 <div
//                     className="my-2"
//                     style={{ display: 'flex', gap: '0.5rem', position: 'relative', flexWrap: 'wrap' }}
//                 >
//                     <Button
//                         style={{ gap: '8px' }}
//                         label={t('ORDER.FILTER.FILTER')}
//                         icon="pi pi-filter"
//                         className="p-button-info"
//                         onClick={() => setFilterDialogVisible(!filterDialogVisible)}
//                     />
//                     <Button
//                         label={t('VOUCHER.BULK_IMPORT')}
//                         icon="pi pi-upload"
//                         severity="help"
//                         onClick={openBulkImport}
//                     />
//                     <Button
//                         label={t('VOUCHER.TABLE.CREATEVOUCHER')}
//                         icon="pi pi-plus"
//                         severity="success"
//                         onClick={openNew}
//                     />
//                     {hasSelectedVouchers && (
//                         <Button
//                             label={t('VOUCHER.TABLE.DELETE_SELECTED')}
//                             icon="pi pi-trash"
//                             severity="danger"
//                             onClick={confirmDeleteSelected}
//                         />
//                     )}
//                 </div>
//                 {/* Filter Dialog */}
//                 {filterDialogVisible && (
//                     <div
//                         className="p-card p-fluid"
//                         ref={filterRef}
//                         style={{
//                             position: 'absolute',
//                             top: '100%',
//                             right: isRTL() ? '-20%' : '0',
//                             left: isRTL() ? '0' : '-20%',
//                             width: '300px',
//                             zIndex: 1000,
//                             marginTop: '0.5rem',
//                             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                         }}
//                     >
//                         <div className="p-card-body" style={{ padding: '1rem' }}>
//                             <div className="grid">
//                                 <div className="col-12">
//                                     <label htmlFor="statusFilter" style={{ fontSize: '0.875rem' }}>
//                                         {t('VOUCHER.FILTER.STATUS')}
//                                     </label>
//                                     <Dropdown
//                                         id="statusFilter"
//                                         options={[
//                                             { label: t('VOUCHER.STATUS.ALL'), value: 'all' },
//                                             { label: t('VOUCHER.STATUS.AVAILABLE'), value: 'available' },
//                                             { label: t('VOUCHER.STATUS.USED'), value: 'used' },
//                                             { label: t('VOUCHER.STATUS.RESERVED'), value: 'reserved' },
//                                             { label: t('VOUCHER.STATUS.EXPIRED'), value: 'expired' },
//                                         ]}
//                                         value={filters.status}
//                                         onChange={(e) => setFilters({ ...filters, status: e.value })}
//                                         placeholder={t('VOUCHER.FILTER.SELECT_STATUS')}
//                                         style={{ width: '100%' }}
//                                     />
//                                 </div>

//                                 <div className="col-12">
//                                     <label htmlFor="bundleFilter" style={{ fontSize: '0.875rem' }}>
//                                         {t('VOUCHER.FILTER.BUNDLE')}
//                                     </label>
//                                     <Dropdown
//                                         id="bundleFilter"
//                                         options={bundleStats}
//                                         value={
//                                             bundleStats.find((b: BundleStat) => b.id === filters.bundle_id) || null
//                                         }
//                                         onChange={(e) =>
//                                             setFilters({
//                                                 ...filters,
//                                                 bundle_id: e.value?.id,
//                                             })
//                                         }
//                                         optionLabel="bundle_title"
//                                         optionValue="id"
//                                         placeholder={t('VOUCHER.FILTER.SELECT_BUNDLE')}
//                                         style={{ width: '100%' }}
//                                     />
//                                 </div>

//                                 <div className="col-12">
//                                     <label htmlFor="providerFilter" style={{ fontSize: '0.875rem' }}>
//                                         {t('VOUCHER.FILTER.PROVIDER')}
//                                     </label>
//                                     <InputText
//                                         id="providerFilter"
//                                         value={filters.provider || ''}
//                                         onChange={(e) =>
//                                             setFilters({
//                                                 ...filters,
//                                                 provider: e.target.value,
//                                             })
//                                         }
//                                         placeholder={t('VOUCHER.FILTER.ENTER_PROVIDER')}
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="col-12 mt-3 flex justify-content-between gap-2">
//                                     <Button
//                                         label={t('RESET')}
//                                         icon="pi pi-times"
//                                         className="p-button-secondary p-button-sm"
//                                         onClick={() => {
//                                             setFilters({
//                                                 page: 1,
//                                                 items_per_page: 20,
//                                                 status: 'available',
//                                                 bundle_id: undefined,
//                                                 search: '',
//                                                 provider: '',
//                                             });
//                                             setActiveFilters({});
//                                         }}
//                                     />
//                                     <Button
//                                         label={t('APPLY')}
//                                         icon="pi pi-check"
//                                         className="p-button-sm"
//                                         onClick={() => {
//                                             handleSubmitFilter(filters);
//                                             setFilterDialogVisible(false);
//                                         }}
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </React.Fragment>
//         );
//     };

//     // ============================
//     // Dialog Footers
//     // ============================

//     const voucherDialogFooter = (
//         <>
//             <Button
//                 label={t('APP.GENERAL.CANCEL')}
//                 icon="pi pi-times"
//                 severity="danger"
//                 className={isRTL() ? 'rtl-button' : ''}
//                 onClick={hideDialog}
//             />
//             <Button
//                 label={t('FORM.GENERAL.SUBMIT')}
//                 icon="pi pi-check"
//                 severity="success"
//                 className={isRTL() ? 'rtl-button' : ''}
//                 onClick={saveVoucher}
//             />
//         </>
//     );

//     const deleteVoucherDialogFooter = (
//         <>
//             <Button
//                 label={t('APP.GENERAL.CANCEL')}
//                 icon="pi pi-times"
//                 severity="danger"
//                 className={isRTL() ? 'rtl-button' : ''}
//                 onClick={hideDeleteVoucherDialog}
//             />
//             <Button
//                 label={t('FORM.GENERAL.SUBMIT')}
//                 icon="pi pi-check"
//                 severity="success"
//                 className={isRTL() ? 'rtl-button' : ''}
//                 onClick={deleteVoucher}
//             />
//         </>
//     );

//     const deleteVouchersDialogFooter = (
//         <>
//             <Button
//                 label={t('APP.GENERAL.CANCEL')}
//                 icon="pi pi-times"
//                 severity="danger"
//                 className={isRTL() ? 'rtl-button' : ''}
//                 onClick={hideDeleteVouchersDialog}
//             />
//             <Button
//                 label={t('FORM.GENERAL.SUBMIT')}
//                 icon="pi pi-check"
//                 severity="success"
//                 className={isRTL() ? 'rtl-button' : ''}
//                 onClick={deleteSelectedVouchers}
//             />
//         </>
//     );

//     const bulkImportDialogFooter = (
//         <>
//             <Button
//                 label={t('APP.GENERAL.CANCEL')}
//                 icon="pi pi-times"
//                 severity="danger"
//                 className={isRTL() ? 'rtl-button' : ''}
//                 onClick={hideBulkImportDialog}
//             />
//             <Button
//                 label={t('VOUCHER.IMPORT')}
//                 icon="pi pi-upload"
//                 severity="success"
//                 className={isRTL() ? 'rtl-button' : ''}
//                 onClick={submitBulkImport}
//                 loading={bulkImport.loading}
//             />
//         </>
//     );

//     // ============================
//     // Pagination
//     // ============================

//     const onPageChange = (event: any) => {
//         const page = event.page + 1;
//         const itemsPerPage = event.rows;
//         dispatch(_fetchVoucherList({ ...filters, page, items_per_page: itemsPerPage }));
//     };

//     // ============================
//     // Helper Functions
//     // ============================

//     const getSelectedBundleStat = (bundleId: number | undefined): BundleStat | null => {
//         if (!bundleId) return null;
//         return bundleStats.find((b: BundleStat) => b.id === bundleId) || null;
//     };

//     // ============================
//     // Render
//     // ============================

//     return (
//         <div className="grid crud-demo -m-5">
//             <div className="col-12">
//                 <div className="card p-2">
//                     {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
//                     <Toast ref={toast} />

//                     {/* Statistics Summary */}
//                     {statisticsSummary()}

//                     {/* Toolbar */}
//                     <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

//                     {/* Data Table */}
//                     <DataTable
//                         ref={dt}
//                         value={vouchers}
//                         selection={selectedVouchers}
//                         onSelectionChange={(e) => setSelectedVouchers(e.value as any)}
//                         dataKey="id"
//                         className="datatable-responsive"
//                         globalFilter={globalFilter}
//                         emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
//                         dir={isRTL() ? 'rtl' : 'ltr'}
//                         style={{
//                             direction: isRTL() ? 'rtl' : 'ltr',
//                             fontFamily: "'iranyekan', sans-serif,iranyekan",
//                         }}
//                         scrollHeight="flex"
//                         scrollable
//                         responsiveLayout="scroll"
//                         paginator={false}
//                         rows={pagination?.per_page || 20}
//                         totalRecords={pagination?.total || 0}
//                         currentPageReportTemplate={
//                             isRTL()
//                                 ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
//                                 : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
//                         }
//                     >
//                         <Column
//                             selectionMode="multiple"
//                             headerStyle={{ minWidth: '3rem' }}
//                             style={{ ...customCellStyle, maxWidth: '3rem' }}
//                         />
//                         <Column
//                             style={{
//                                 ...customCellStyle,
//                                 textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
//                             }}
//                             body={actionBodyTemplate}
//                             headerStyle={{ minWidth: '8rem' }}
//                         />
//                         <Column
//                             style={{
//                                 ...customCellStyle,
//                                 textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
//                             }}
//                             field="voucher_code"
//                             header={t('VOUCHER.TABLE.COLUMN.CODE')}
//                             body={voucherCodeBodyTemplate}
//                             headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
//                         />
//                         <Column
//                             style={{
//                                 ...customCellStyle,
//                                 textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
//                             }}
//                             field="bundle_title"
//                             header={t('VOUCHER.TABLE.COLUMN.BUNDLE')}
//                             body={bundleTitleBodyTemplate}
//                             headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
//                         />
//                         <Column
//                             style={{
//                                 ...customCellStyle,
//                                 textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
//                             }}
//                             field="company_name"
//                             header={t('VOUCHER.TABLE.COLUMN.COMPANY')}
//                             body={companyNameBodyTemplate}
//                             headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
//                         />
//                         <Column
//                             style={{
//                                 ...customCellStyle,
//                                 textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
//                             }}
//                             field="provider"
//                             header={t('VOUCHER.TABLE.COLUMN.PROVIDER')}
//                             body={providerBodyTemplate}
//                             headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}
//                         />
//                         <Column
//                             style={{
//                                 ...customCellStyle,
//                                 textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
//                             }}
//                             field="status"
//                             header={t('VOUCHER.TABLE.COLUMN.STATUS')}
//                             body={statusBodyTemplate}
//                             headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}
//                         />
//                         <Column
//                             style={{
//                                 ...customCellStyle,
//                                 textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
//                             }}
//                             field="expires_at"
//                             header={t('VOUCHER.TABLE.COLUMN.EXPIRES')}
//                             body={expiryDateBodyTemplate}
//                             headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
//                         />
//                         <Column
//                             style={{
//                                 ...customCellStyle,
//                                 textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
//                             }}
//                             field="notes"
//                             header={t('VOUCHER.TABLE.COLUMN.NOTES')}
//                             body={notesBodyTemplate}
//                             headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}
//                         />
//                         <Column
//                             style={{
//                                 ...customCellStyle,
//                                 textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
//                             }}
//                             field="created_at"
//                             header={t('TABLE.GENERAL.CREATEDAT')}
//                             body={createdAtBodyTemplate}
//                             headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
//                         />
//                     </DataTable>

//                     {/* Paginator */}
//                     <Paginator
//                         first={
//                             ((pagination?.current_page || 1) - 1) * (pagination?.per_page || 20)
//                         }
//                         rows={pagination?.per_page || 20}
//                         totalRecords={pagination?.total || 0}
//                         onPageChange={(e) => onPageChange(e)}
//                         template={
//                             isRTL()
//                                 ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
//                                 : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
//                         }
//                         currentPageReportTemplate={
//                             isRTL()
//                                 ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
//                                 : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
//                         }
//                         firstPageLinkIcon={isRTL() ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'}
//                         lastPageLinkIcon={isRTL() ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'}
//                     />

//                     {/* ============================
//                         Voucher Form Dialog
//                         ============================ */}
//                     <Dialog
//                         visible={voucherDialog}
//                         style={{ width: '95%', maxWidth: '800px', padding: '5px' }}
//                         header={voucher.id ? t('VOUCHER.EDIT') : t('VOUCHER.CREATE')}
//                         modal
//                         className="p-fluid"
//                         footer={voucherDialogFooter}
//                         onHide={hideDialog}
//                         breakpoints={{ '960px': '95vw', '640px': '95vw' }}
//                     >
//                         <div className="card" style={{ padding: '20px' }}>
//                             {/* Voucher Code */}
//                             <div className="grid formgrid p-fluid">
//                                 <div className="field col-12">
//                                     <label
//                                         htmlFor="voucher_code"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.CODE')} <span className="text-red-500">*</span>
//                                     </label>
//                                     <InputText
//                                         id="voucher_code"
//                                         value={voucher.voucher_code || ''}
//                                         onChange={(e) =>
//                                             setVoucher((prev) => ({
//                                                 ...prev,
//                                                 voucher_code: e.target.value,
//                                             }))
//                                         }
//                                         required
//                                         autoFocus
//                                         placeholder={t('VOUCHER.FORM.ENTER_CODE')}
//                                         className={classNames('w-full', {
//                                             'p-invalid': submitted && !voucher.voucher_code,
//                                         })}
//                                     />
//                                     {submitted && !voucher.voucher_code && (
//                                         <small className="p-invalid text-red-500">
//                                             {t('THIS_FIELD_IS_REQUIRED')}
//                                         </small>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Bundle Selection */}
//                             <div className="grid formgrid p-fluid">
//                                 <div className="field col-12 md:col-6">
//                                     <label
//                                         htmlFor="bundle_id"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.BUNDLE')} <span className="text-red-500">*</span>
//                                     </label>
//                                     <Dropdown
//                                         id="bundle_id"
//                                         value={getSelectedBundleStat(voucher.bundle?.service?.id)}
//                                         options={bundleStats}
//                                         onChange={(e) => {
//                                             const selectedBundle = e.value;
//                                             // if (selectedBundle) {
//                                             //     setVoucher((prev) => ({
//                                             //         ...prev,
//                                             //         bundle: {
//                                             //             ...prev.bundle,
//                                             //             service: {
//                                             //                 ...prev.bundle.service,
//                                             //                 id: selectedBundle.id,
//                                             //                 service_category_id: selectedBundle.service
//                                             //                     ?.service_category_id || '',
//                                             //                 company_id: selectedBundle.service?.company_id || '',
//                                             //             },
//                                             //         },
//                                             //         bundle_title: selectedBundle.bundle_title || '',
//                                             //         company_name: selectedBundle.company_name || '',
//                                             //     }));
//                                             // }
//                                         }}
//                                         optionLabel="bundle_title"
//                                         placeholder={t('VOUCHER.FORM.SELECT_BUNDLE')}
//                                         className="w-full"
//                                         itemTemplate={(option) => (
//                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
//                                                 <div className="font-semibold">{option.bundle_title}</div>
//                                                 <div className="text-sm text-gray-600">
//                                                     {option.company_name} - {option.category_type}
//                                                 </div>
//                                             </div>
//                                         )}
//                                         valueTemplate={(option) => {
//                                             if (!option) return t('VOUCHER.FORM.SELECT_BUNDLE');
//                                             return (
//                                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
//                                                     <div className="font-semibold">{option.bundle_title}</div>
//                                                     <div className="text-sm text-gray-600">
//                                                         {option.company_name}
//                                                     </div>
//                                                 </div>
//                                             );
//                                         }}
//                                     />
//                                     {submitted && !voucher.bundle?.service?.id && (
//                                         <small className="p-invalid text-red-500">
//                                             {t('THIS_FIELD_IS_REQUIRED')}
//                                         </small>
//                                     )}
//                                 </div>

//                                 <div className="field col-12 md:col-6">
//                                     <label
//                                         htmlFor="provider"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.PROVIDER')}
//                                     </label>
//                                     <InputText
//                                         id="provider"
//                                         value={voucher.provider || ''}
//                                         onChange={(e) =>
//                                             setVoucher((prev) => ({
//                                                 ...prev,
//                                                 provider: e.target.value,
//                                             }))
//                                         }
//                                         placeholder={t('VOUCHER.FORM.ENTER_PROVIDER')}
//                                         className="w-full"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Expiry Date */}
//                             <div className="grid formgrid p-fluid">
//                                 <div className="field col-12">
//                                     <label
//                                         htmlFor="expires_at"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.EXPIRES_AT')} <span className="text-red-500">*</span>
//                                     </label>
//                                     <Calendar
//                                         id="expires_at"
//                                         value={voucher.expires_at ? new Date(voucher.expires_at) : null}
//                                         onChange={(e) => {
//                                             const date = e.value;
//                                             if (date) {
//                                                 const formattedDate = date
//                                                     .toISOString()
//                                                     .replace('T', ' ')
//                                                     .slice(0, 19);
//                                                 setVoucher((prev) => ({
//                                                     ...prev,
//                                                     expires_at: formattedDate,
//                                                 }));
//                                             }
//                                         }}
//                                         showTime
//                                         hourFormat="24"
//                                         placeholder={t('VOUCHER.FORM.SELECT_EXPIRY')}
//                                         className={classNames('w-full', {
//                                             'p-invalid': submitted && !voucher.expires_at,
//                                         })}
//                                     />
//                                     {submitted && !voucher.expires_at && (
//                                         <small className="p-invalid text-red-500">
//                                             {t('THIS_FIELD_IS_REQUIRED')}
//                                         </small>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Notes */}
//                             <div className="grid formgrid p-fluid">
//                                 <div className="field col-12">
//                                     <label
//                                         htmlFor="notes"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.NOTES')}
//                                     </label>
//                                     <InputTextarea
//                                         id="notes"
//                                         value={voucher.notes || ''}
//                                         onChange={(e) =>
//                                             setVoucher((prev) => ({
//                                                 ...prev,
//                                                 notes: e.target.value,
//                                             }))
//                                         }
//                                         rows={3}
//                                         placeholder={t('VOUCHER.FORM.ENTER_NOTES')}
//                                         className="w-full"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Metadata (JSON) */}
//                             <div className="grid formgrid p-fluid">
//                                 <div className="field col-12">
//                                     <label
//                                         htmlFor="metadata"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.METADATA')}
//                                     </label>
//                                     <InputTextarea
//                                         id="metadata"
//                                         value={
//                                             voucher.metadata
//                                                 ? JSON.stringify(voucher.metadata, null, 2)
//                                                 : ''
//                                         }
//                                         onChange={(e) => {
//                                             try {
//                                                 const parsed = JSON.parse(e.target.value);
//                                                 setVoucher((prev) => ({
//                                                     ...prev,
//                                                     metadata: parsed,
//                                                 }));
//                                             } catch {
//                                                 // Keep as string if invalid JSON
//                                                 setVoucher((prev) => ({
//                                                     ...prev,
//                                                     metadata: e.target.value,
//                                                 }));
//                                             }
//                                         }}
//                                         rows={3}
//                                         placeholder={t('VOUCHER.FORM.ENTER_METADATA_JSON')}
//                                         className="w-full"
//                                     />
//                                     <small className="text-gray-500">
//                                         {t('VOUCHER.FORM.METADATA_HELP')}
//                                     </small>
//                                 </div>
//                             </div>

//                             {/* Status (readonly for edit) */}
//                             {voucher.id && (
//                                 <div className="grid formgrid p-fluid">
//                                     <div className="field col-12">
//                                         <label
//                                             htmlFor="status"
//                                             style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                         >
//                                             {t('VOUCHER.TABLE.COLUMN.STATUS')}
//                                         </label>
//                                         <Dropdown
//                                             id="status"
//                                             value={voucher.status}
//                                             options={[
//                                                 { label: t('VOUCHER.STATUS.AVAILABLE'), value: 'available' },
//                                                 { label: t('VOUCHER.STATUS.USED'), value: 'used' },
//                                                 { label: t('VOUCHER.STATUS.RESERVED'), value: 'reserved' },
//                                                 { label: t('VOUCHER.STATUS.EXPIRED'), value: 'expired' },
//                                             ]}
//                                             onChange={(e) =>
//                                                 setVoucher((prev) => ({
//                                                     ...prev,
//                                                     status: e.value,
//                                                 }))
//                                             }
//                                             optionLabel="label"
//                                             optionValue="value"
//                                             placeholder={t('VOUCHER.FORM.SELECT_STATUS')}
//                                             className="w-full"
//                                         />
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </Dialog>

//                     {/* ============================
//                         Bulk Import Dialog
//                         ============================ */}
//                     <Dialog
//                         visible={bulkImportDialog}
//                         style={{ width: '95%', maxWidth: '900px', padding: '5px' }}
//                         header={t('VOUCHER.BULK_IMPORT')}
//                         modal
//                         className="p-fluid"
//                         footer={bulkImportDialogFooter}
//                         onHide={hideBulkImportDialog}
//                         breakpoints={{ '960px': '95vw', '640px': '95vw' }}
//                     >
//                         <div className="card" style={{ padding: '20px' }}>
//                             {/* Bulk Import Configuration */}
//                             <div className="grid formgrid p-fluid">
//                                 <div className="field col-12 md:col-6">
//                                     <label
//                                         htmlFor="bulk_bundle_id"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.BUNDLE')} <span className="text-red-500">*</span>
//                                     </label>
//                                     <Dropdown
//                                         id="bulk_bundle_id"
//                                         value={
//                                             bundleStats.find(
//                                                 (b: BundleStat) => b.id === bulkImportData.bundle_id
//                                             ) || null
//                                         }
//                                         options={bundleStats}
//                                         onChange={(e) => {
//                                             const selectedBundle = e.value;
//                                             setBulkImportData((prev) => ({
//                                                 ...prev,
//                                                 bundle_id: selectedBundle?.id || 0,
//                                             }));
//                                         }}
//                                         optionLabel="bundle_title"
//                                         placeholder={t('VOUCHER.FORM.SELECT_BUNDLE')}
//                                         className="w-full"
//                                         itemTemplate={(option) => (
//                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
//                                                 <div className="font-semibold">{option.bundle_title}</div>
//                                                 <div className="text-sm text-gray-600">
//                                                     {option.company_name} - Available: {option.available}
//                                                 </div>
//                                             </div>
//                                         )}
//                                         valueTemplate={(option) => {
//                                             if (!option) return t('VOUCHER.FORM.SELECT_BUNDLE');
//                                             return (
//                                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
//                                                     <div className="font-semibold">{option.bundle_title}</div>
//                                                     <div className="text-sm text-gray-600">
//                                                         {option.company_name}
//                                                     </div>
//                                                 </div>
//                                             );
//                                         }}
//                                     />
//                                     {!bulkImportData.bundle_id && (
//                                         <small className="p-invalid text-red-500">
//                                             {t('THIS_FIELD_IS_REQUIRED')}
//                                         </small>
//                                     )}
//                                 </div>

//                                 <div className="field col-12 md:col-6">
//                                     <label
//                                         htmlFor="bulk_provider"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.PROVIDER')}
//                                     </label>
//                                     <InputText
//                                         id="bulk_provider"
//                                         value={bulkImportData.provider}
//                                         onChange={(e) =>
//                                             setBulkImportData((prev) => ({
//                                                 ...prev,
//                                                 provider: e.target.value,
//                                             }))
//                                         }
//                                         placeholder={t('VOUCHER.FORM.ENTER_PROVIDER')}
//                                         className="w-full"
//                                     />
//                                 </div>
//                             </div>

//                             <hr className="my-3" />

//                             {/* Add Voucher to Bulk List */}
//                             <div className="grid formgrid p-fluid">
//                                 <div className="field col-12 md:col-4">
//                                     <label
//                                         htmlFor="bulk_voucher_code"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.CODE')} <span className="text-red-500">*</span>
//                                     </label>
//                                     <InputText
//                                         id="bulk_voucher_code"
//                                         value={bulkVoucherCode}
//                                         onChange={(e) => setBulkVoucherCode(e.target.value)}
//                                         placeholder={t('VOUCHER.FORM.ENTER_CODE')}
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="field col-12 md:col-4">
//                                     <label
//                                         htmlFor="bulk_expiry"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.EXPIRES_AT')} <span className="text-red-500">*</span>
//                                     </label>
//                                     <Calendar
//                                         id="bulk_expiry"
//                                         value={bulkVoucherExpiry}
//                                         onChange={(e) => setBulkVoucherExpiry(e.value || null)}
//                                         showTime
//                                         hourFormat="24"
//                                         placeholder={t('VOUCHER.FORM.SELECT_EXPIRY')}
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div
//                                     className="field col-12 md:col-4"
//                                     style={{ display: 'flex', alignItems: 'flex-end' }}
//                                 >
//                                     <Button
//                                         label={t('VOUCHER.ADD_TO_LIST')}
//                                         icon="pi pi-plus"
//                                         severity="info"
//                                         onClick={addBulkVoucher}
//                                         className="w-full"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Notes and Metadata for Bulk */}
//                             <div className="grid formgrid p-fluid">
//                                 <div className="field col-12 md:col-6">
//                                     <label
//                                         htmlFor="bulk_notes"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.NOTES')}
//                                     </label>
//                                     <InputText
//                                         id="bulk_notes"
//                                         value={bulkVoucherNotes}
//                                         onChange={(e) => setBulkVoucherNotes(e.target.value)}
//                                         placeholder={t('VOUCHER.FORM.ENTER_NOTES')}
//                                         className="w-full"
//                                     />
//                                 </div>

//                                 <div className="field col-12 md:col-6">
//                                     <label
//                                         htmlFor="bulk_metadata"
//                                         style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
//                                     >
//                                         {t('VOUCHER.FORM.METADATA')}
//                                     </label>
//                                     <InputText
//                                         id="bulk_metadata"
//                                         value={bulkVoucherMetadata}
//                                         onChange={(e) => setBulkVoucherMetadata(e.target.value)}
//                                         placeholder={'{"region": "US"}'}
//                                         className="w-full"
//                                     />
//                                 </div>
//                             </div>

//                             <hr className="my-3" />

//                             {/* Bulk Vouchers List */}
//                             <div className="grid">
//                                 <div className="col-12">
//                                     <h4>
//                                         {t('VOUCHER.VOUCHERS_LIST')} ({bulkImportData.vouchers.length})
//                                     </h4>
//                                     {bulkImportData.vouchers.length === 0 ? (
//                                         <div className="text-center p-4 border-round bg-gray-50">
//                                             <i className="pi pi-inbox text-3xl text-gray-400" />
//                                             <p className="text-gray-500">{t('VOUCHER.NO_VOUCHERS_ADDED')}</p>
//                                         </div>
//                                     ) : (
//                                         <div
//                                             className="border-round bg-gray-50 p-2"
//                                             style={{ maxHeight: '300px', overflowY: 'auto' }}
//                                         >
//                                             {bulkImportData.vouchers.map((v, index) => (
//                                                 <div
//                                                     key={index}
//                                                     className="flex justify-content-between align-items-center p-2 border-bottom-1 border-gray-200"
//                                                 >
//                                                     <div>
//                                                         <div className="font-semibold text-sm">{v.code}</div>
//                                                         <div className="text-xs text-gray-500">
//                                                             {new Date(v.expires_at).toLocaleDateString()} -{' '}
//                                                             {v.notes || t('VOUCHER.NO_NOTES')}
//                                                         </div>
//                                                         {v.metadata && (
//                                                             <div className="text-xs text-gray-400">
//                                                                 {JSON.stringify(v.metadata)}
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                     <Button
//                                                         icon="pi pi-times"
//                                                         severity="danger"
//                                                         rounded
//                                                         text
//                                                         onClick={() => removeBulkVoucher(index)}
//                                                     />
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Import Summary */}
//                             {bulkImport.summary && (
//                                 <div className="grid mt-3">
//                                     <div className="col-12">
//                                         <div className="border-round bg-green-50 p-3">
//                                             <h5>{t('VOUCHER.IMPORT_SUMMARY')}</h5>
//                                             <div className="grid">
//                                                 <div className="col-4">
//                                                     <div className="text-sm">{t('VOUCHER.TOTAL')}</div>
//                                                     <div className="font-bold">{bulkImport.summary.total}</div>
//                                                 </div>
//                                                 <div className="col-4">
//                                                     <div className="text-sm">{t('VOUCHER.IMPORTED')}</div>
//                                                     <div className="font-bold text-green-500">
//                                                         {bulkImport.summary.imported}
//                                                     </div>
//                                                 </div>
//                                                 <div className="col-4">
//                                                     <div className="text-sm">{t('VOUCHER.FAILED')}</div>
//                                                     <div className="font-bold text-red-500">
//                                                         {bulkImport.summary.failed}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             {bulkImport.summary.errors &&
//                                                 bulkImport.summary.errors.length > 0 && (
//                                                     <div className="mt-2">
//                                                         <div className="text-sm text-red-500 font-bold">
//                                                             {t('VOUCHER.ERRORS')}
//                                                         </div>
//                                                         {bulkImport.summary.errors.map(
//                                                             (err: any, idx: number) => (
//                                                                 <div key={idx} className="text-xs text-red-400">
//                                                                     #{err.index + 1}: {err.code} - {err.error}
//                                                                 </div>
//                                                             )
//                                                         )}
//                                                     </div>
//                                                 )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </Dialog>

//                     {/* ============================
//                         Delete Confirmation Dialogs
//                         ============================ */}
//                     <Dialog
//                         visible={deleteVoucherDialog}
//                         style={{ width: '450px' }}
//                         header={t('TABLE.GENERAL.CONFIRM')}
//                         modal
//                         footer={deleteVoucherDialogFooter}
//                         onHide={hideDeleteVoucherDialog}
//                     >
//                         <div className="flex align-items-center justify-content-center">
//                             <i
//                                 className="pi pi-exclamation-triangle mx-3"
//                                 style={{ fontSize: '2rem', color: 'red' }}
//                             />
//                             {voucher && (
//                                 <span>
//                                     {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')}{' '}
//                                     <b>{voucher.voucher_code}</b>
//                                 </span>
//                             )}
//                         </div>
//                     </Dialog>

//                     <Dialog
//                         visible={deleteVouchersDialog}
//                         style={{ width: '450px' }}
//                         header={t('TABLE.GENERAL.CONFIRM')}
//                         modal
//                         footer={deleteVouchersDialogFooter}
//                         onHide={hideDeleteVouchersDialog}
//                     >
//                         <div className="flex align-items-center justify-content-center">
//                             <i
//                                 className="pi pi-exclamation-triangle mx-3"
//                                 style={{ fontSize: '2rem', color: 'red' }}
//                             />
//                             {selectedVouchers && (
//                                 <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>
//                             )}
//                         </div>
//                     </Dialog>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default withAuth(VoucherPage);


import React from 'react'

const page = () => {
  return (
    <div>

    </div>
  )
}

export default page

