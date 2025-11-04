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
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { PurchasedProduct } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { InputTextarea } from 'primereact/inputtextarea';
import { _addPurchasedProduct, _deletePurchasedProduct, _editPurchasedProduct, _fetchPurchasedProducts } from '@/app/redux/actions/purchasedProductsActions';
import { purchasedProductsReducer } from '../../../redux/reducers/purchasedProductsReducer';
import { _fetchSuppliers } from '@/app/redux/actions/supplierActions';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { suppliersReducer } from '../../../redux/reducers/supplierReducer';
import serviceReducer from '../../../redux/reducers/serviceReducer';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const PurchasedProductPage = () => {
    let emptyPurchasedProduct: PurchasedProduct = {
        id: 0,
        supplier_id: 0,
        service_id: 0,
        product_name: '',
        quantity: 0,
        purchase_price: '',
        purchase_date: '',
        status: 1,
        created_at: '',
        updated_at: '',
        supplier: null,
        service: null
    };

    const [purchasedProductDialog, setPurchasedProductDialog] = useState(false);
    const [deletePurchasedProductDialog, setDeletePurchasedProductDialog] = useState(false);
    const [deletePurchasedProductsDialog, setDeletePurchasedProductsDialog] = useState(false);
    const [purchasedProduct, setPurchasedProduct] = useState<PurchasedProduct>(emptyPurchasedProduct);
    const [selectedCompanies, setSelectedPurchasedProduct] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { purchasedProducts, loading } = useSelector((state: any) => state.purchasedProductsReducer);
    const { suppliers } = useSelector((state: any) => state.suppliersReducer);
    const { services } = useSelector((state: any) => state.serviceReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchPurchasedProducts());
        dispatch(_fetchSuppliers());
        dispatch(_fetchServiceList());
    }, [dispatch]);

    const openNew = () => {
        setPurchasedProduct(emptyPurchasedProduct);
        setSubmitted(false);
        setPurchasedProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPurchasedProductDialog(false);
    };

    const hideDeletePurchasedProductDialog = () => {
        setDeletePurchasedProductDialog(false);
    };

    const hideDeletePurchasedProductsDialog = () => {
        setDeletePurchasedProductsDialog(false);
    };

    const savePurchasedProduct = () => {
        setSubmitted(true);
        if (!purchasedProduct.supplier || !purchasedProduct.product_name || !purchasedProduct.purchase_price || !purchasedProduct.service || !purchasedProduct.quantity || !purchasedProduct.purchase_date) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (purchasedProduct.id && purchasedProduct.id !== 0) {
            dispatch(_editPurchasedProduct(purchasedProduct.id, purchasedProduct, toast, t));
        } else {
            dispatch(_addPurchasedProduct(purchasedProduct, toast, t));
        }

        setPurchasedProductDialog(false);
        setPurchasedProduct(emptyPurchasedProduct);
        setSubmitted(false);
    };

    const editPurchasedProduct = (purchasedProduct: PurchasedProduct) => {
        setPurchasedProduct({ ...purchasedProduct });

        setPurchasedProductDialog(true);
    };

    const confirmDeletePurchasedProduct = (purchasedProduct: PurchasedProduct) => {
        setPurchasedProduct(purchasedProduct);
        setDeletePurchasedProductDialog(true);
    };

    const deletePurchasedProduct = () => {
        if (!purchasedProduct?.id) {
            console.error('PurchasedProduct  ID is undefined.');
            return;
        }
        dispatch(_deletePurchasedProduct(purchasedProduct?.id, toast, t));
        setDeletePurchasedProductDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeletePurchasedProductsDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('PURCHASEDPRODUCT.TABLE.CREATEPURCHASEDPRODUCT')}
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

    const supplierNameBodyTemplate = (rowData: PurchasedProduct) => {
        return (
            <>
                <span className="p-column-title">Supplier</span>
                {rowData.supplier?.supplier_name}
            </>
        );
    };

    const productNameBodyTemplate = (rowData: PurchasedProduct) => {
        return (
            <>
                <span className="p-column-title">Product Name</span>
                {rowData.product_name}
            </>
        );
    };

    const quantityBodyTemplate = (rowData: PurchasedProduct) => {
        return (
            <>
                <span className="p-column-title">Quantity</span>
                {rowData.quantity}
            </>
        );
    };

    const purchasePriceBodyTemplate = (rowData: PurchasedProduct) => {
        return (
            <>
                <span className="p-column-title">Purchase Price</span>
                {rowData.purchase_price}
            </>
        );
    };

    const serviceBodyTemplate = (rowData: PurchasedProduct) => {
        return (
            <>
                <span className="p-column-title">Service</span>
                {rowData.service?.company?.company_name}
            </>
        );
    };

    const purchasedProductDateBodyTemplate = (rowData: PurchasedProduct) => {
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const optionsDate: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const optionsTime: Intl.DateTimeFormatOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            const formattedDate = date.toLocaleDateString('en-US', optionsDate);
            const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

            return { formattedDate, formattedTime };
        };

        const { formattedDate, formattedTime } = formatDate(rowData.purchase_date);

        return (
            <>
                <span className="p-column-title">Created At</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: PurchasedProduct) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editPurchasedProduct(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeletePurchasedProduct(rowData)} />
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

    const purchasedProductDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={savePurchasedProduct} />
        </>
    );
    const deletePurchasedProductDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeletePurchasedProductDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deletePurchasedProduct} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeletePurchasedProductsDialog} />
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
                        value={purchasedProducts}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedPurchasedProduct(e.value as any)}
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
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PURCHASEDPRODUCT.TABLE.COLUMN.SUPPLIER')} body={supplierNameBodyTemplate} ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PURCHASEDPRODUCT.TABLE.COLUMN.PRODUCTNAME')} body={productNameBodyTemplate} ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PURCHASEDPRODUCT.TABLE.COLUMN.QUANTITY')} body={quantityBodyTemplate} ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('PURCHASEDPRODUCT.TABLE.COLUMN.PURCHASEPRICE')}
                            body={purchasePriceBodyTemplate}
                            
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('PURCHASEDPRODUCT.TABLE.COLUMN.PURCHASEDATE')}
                            body={purchasedProductDateBodyTemplate}
                            
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PURCHASEDPRODUCT.TABLE.COLUMN.SERVICE')} body={serviceBodyTemplate} ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={purchasedProductDialog} style={{ width: '900px', padding: '5px' }} header={t('PURCHASEDPRODUCTS.DETAILS')} modal className="p-fluid" footer={purchasedProductDialogFooter} onHide={hideDialog}>
                        <div className="card flex flex-wrap p-fluid mt-3 gap-4">
                            <div className=" flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="supplier" style={{ fontWeight: 'bold' }}>
                                        {t('PURCHASEDPRODUCT.FORM.INPUT.SUPPLIER')}
                                    </label>
                                    <Dropdown
                                        id="supplier"
                                        value={purchasedProduct.supplier}
                                        options={suppliers}
                                        onChange={(e) =>
                                            setPurchasedProduct((prev) => ({
                                                ...prev,
                                                supplier: e.value
                                            }))
                                        }
                                        optionLabel="supplier_name"
                                        // optionValue='id'
                                        placeholder={t('PURCHASEDPRODUCTS.FORM.PLACEHOLDER.CHOOSE.A.SUPPLIER')}
                                        className="w-full"
                                    />
                                    {submitted && !purchasedProduct.supplier && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                           {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="product_name" style={{ fontWeight: 'bold' }}>
                                        {t('PURCHASEDPRODUCT.FORM.INPUT.PRODUCTNAME')}
                                    </label>
                                    <InputText
                                        id="product_name"
                                        value={purchasedProduct.product_name}
                                        onChange={(e) =>
                                            setPurchasedProduct((prev) => ({
                                                ...prev,
                                                product_name: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('PURCHASEDPRODUCTS.FORM.PLACEHOLDER.PRODUCT.NAME')}
                                        className={classNames({
                                            'p-invalid': submitted && !purchasedProduct.product_name
                                        })}
                                    />
                                    {submitted && !purchasedProduct.product_name && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field">
                                    <label htmlFor="purchase_price" style={{ fontWeight: 'bold' }}>
                                        {t('PURCHASEDPRODUCT.FORM.INPUT.PURCHASEPRICE')}
                                    </label>
                                    <InputText
                                        id="purchase_price"
                                        value={purchasedProduct.purchase_price}
                                        onChange={(e) =>
                                            setPurchasedProduct((prev) => ({
                                                ...prev,
                                                purchase_price: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('PURCHASEDPRODUCTS.FORM.PLACEHOLDER.PURCHASE.PRICE')}
                                        className={classNames({
                                            'p-invalid': submitted && !purchasedProduct.purchase_price
                                        })}
                                    />
                                    {submitted && !purchasedProduct.purchase_price && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field">
                                    <label htmlFor="status" style={{ fontWeight: 'bold' }}>
                                        {t('PURCHASEDPRODUCT.FORM.INPUT.STATUS')}
                                    </label>
                                    <Dropdown
                                        id="status"
                                        value={purchasedProduct.status}
                                        options={[
                                            { label: 'Active', value: 1 },
                                            { label: 'Inactive', value: 0 }
                                        ]}
                                        onChange={(e) =>
                                            setPurchasedProduct((prev) => ({
                                                ...prev,
                                                status: e.value
                                            }))
                                        }
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Choose a status"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <br />
                            <div className=" flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="service" style={{ fontWeight: 'bold' }}>
                                        {t('PURCHASEDPRODUCT.FORM.INPUT.SERVICE')}
                                    </label>
                                    <Dropdown
                                        id="service"
                                        value={purchasedProduct.service}
                                        options={services}
                                        onChange={(e) =>
                                            setPurchasedProduct((prev) => ({
                                                ...prev,
                                                service: e.value
                                            }))
                                        }
                                        optionLabel="company.company_name"
                                        // optionValue='id'
                                        placeholder={t('PURCHASEDPRODUCTS.FORM.PLACEHOLDER.CHOOSE.A.SERVICE')}
                                        className="w-full"
                                        itemTemplate={(option) => (
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <div>{option.service_category?.category_name}</div>
                                                <div>{option.company?.company_name}</div>
                                            </div>
                                        )}
                                    />
                                    {submitted && !purchasedProduct.service && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="purchasedProduct_date" style={{ fontWeight: 'bold' }}>
                                        {t('PURCHASEDPRODUCT.FORM.INPUT.QUANTITY')}
                                    </label>
                                    <InputText
                                        id="quantity"
                                        value={purchasedProduct.quantity.toString()}
                                        onChange={(e) =>
                                            setPurchasedProduct((prev) => ({
                                                ...prev,
                                                quantity: parseInt(e.target.value)
                                            }))
                                        }
                                        required
                                        autoFocus
                                        className={classNames({
                                            'p-invalid': submitted && !purchasedProduct.quantity
                                        })}
                                    />
                                    {submitted && !purchasedProduct.quantity && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="purchase_date" style={{ fontWeight: 'bold' }}>
                                        {t('PURCHASEDPRODUCT.FORM.INPUT.PURCHASEDATE')}
                                    </label>
                                    <InputText
                                        id="purchase_date"
                                        value={purchasedProduct.purchase_date}
                                        onChange={(e) =>
                                            setPurchasedProduct((prev) => ({
                                                ...prev,
                                                purchase_date: e.target.value
                                            }))
                                        }
                                        type="date"
                                        required
                                        autoFocus
                                        placeholder={t('PURCHASEDPRODUCTS.FORM.PLACEHOLDER.PURCHASE.DATE')}
                                        className={classNames({
                                            'p-invalid': submitted && !purchasedProduct.purchase_date
                                        })}
                                    />
                                    {submitted && !purchasedProduct.purchase_date && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deletePurchasedProductDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deletePurchasedProductDialogFooter} onHide={hideDeletePurchasedProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {purchasedProduct && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b></b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePurchasedProductsDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeletePurchasedProductsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {purchasedProduct && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(PurchasedProductPage);
