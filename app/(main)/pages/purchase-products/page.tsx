/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { SearchSelect } from '@/components/admin/search-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { PurchasedProduct } from '@/types/interface';
import { _addPurchasedProduct, _deletePurchasedProduct, _editPurchasedProduct, _fetchPurchasedProducts } from '@/app/redux/actions/purchasedProductsActions';
import { _fetchSuppliers } from '@/app/redux/actions/supplierActions';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../utilities/rtlUtil';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { DateField } from '@/components/ui/date-field';
import { cn } from '@/lib/utils';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { Button as UiButton } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Pencil, Plus, Trash2 } from 'lucide-react';

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
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const toast = useRef<Toast>(null);
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

    const filteredProducts = useMemo(() => {
        const search = searchTag.trim().toLocaleLowerCase();
        const list: PurchasedProduct[] = Array.isArray(purchasedProducts) ? purchasedProducts : [];
        if (!search) return list;
        return list.filter((row) =>
            [row.product_name, row.supplier?.supplier_name, row.service?.company?.company_name, row.purchase_price, row.quantity]
                .filter((v) => v !== null && v !== undefined)
                .join(' ')
                .toLocaleLowerCase()
                .includes(search)
        );
    }, [purchasedProducts, searchTag]);

    const formatPurchaseDate = (dateString: string) => {
        if (!dateString) return '—';
        try {
            return new Date(dateString).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
        } catch {
            return dateString;
        }
    };

    const getPurchasedProductRowActions = (row: PurchasedProduct) => [
        { label: t('EDIT', { defaultValue: 'ویرایش' }), icon: <Pencil className="h-4 w-4" />, onClick: () => editPurchasedProduct(row) },
        { label: t('APP.GENERAL.DELETE', { defaultValue: 'حذف' }), icon: <Trash2 className="h-4 w-4" />, onClick: () => confirmDeletePurchasedProduct(row), danger: true }
    ];

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
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.PURCHASEDPRODUCTS', { defaultValue: 'محصولات خریداری‌شده' })}
                description={t('PURCHASEDPRODUCT.PAGE.DESCRIPTION', { defaultValue: 'ثبت و مدیریت خرید محصول از تأمین‌کنندگان' })}
                loading={loading}
                actions={
                    <UiButton size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('PURCHASEDPRODUCT.TABLE.CREATEPURCHASEDPRODUCT', { defaultValue: 'افزودن خرید' })}
                    </UiButton>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو...' })}
                    />
                }
                footer={
                    <div className="border-t border-emerald-100 px-3 py-2 text-xs text-muted-foreground">
                        {t('TOTAL', { defaultValue: 'مجموع' })}: {filteredProducts.length}
                    </div>
                }
            >
                <table className="w-full min-w-[960px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">
                                {t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            </th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PURCHASEDPRODUCT.TABLE.COLUMN.SUPPLIER')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PURCHASEDPRODUCT.TABLE.COLUMN.PRODUCTNAME')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PURCHASEDPRODUCT.TABLE.COLUMN.QUANTITY')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PURCHASEDPRODUCT.TABLE.COLUMN.PURCHASEPRICE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('PURCHASEDPRODUCT.TABLE.COLUMN.PURCHASEDATE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PURCHASEDPRODUCT.TABLE.COLUMN.SERVICE')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((row) => (
                                <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                    <td className="px-2 py-1.5 align-middle">
                                        <RowActions items={getPurchasedProductRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5 text-start">{row.supplier?.supplier_name || '—'}</td>
                                    <td className="px-2 py-1.5 text-start">{row.product_name || '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.quantity ?? '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.purchase_price ?? '—'}</td>
                                    <td className="px-2 py-1.5 whitespace-nowrap tabular-nums text-muted-foreground">{formatPurchaseDate(row.purchase_date)}</td>
                                    <td className="px-2 py-1.5 text-start">{row.service?.company?.company_name || '—'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ListPage>

            <FormSheet
                open={purchasedProductDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('PURCHASEDPRODUCTS.DETAILS')}
                description={purchasedProduct.id ? 'ویرایش خرید' : 'ثبت خرید جدید'}
                size="xl"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={savePurchasedProduct}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title="اطلاعات خرید" description="تأمین‌کننده، محصول و قیمت">
                    <FormField
                        label={t('PURCHASEDPRODUCT.FORM.INPUT.SUPPLIER')}
                        required
                        error={submitted && !purchasedProduct.supplier ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={purchasedProduct.supplier}
                            options={suppliers || []}
                            onChange={(selected) =>
                                setPurchasedProduct((prev) => ({
                                    ...prev,
                                    supplier: selected
                                }))
                            }
                            optionLabel="supplier_name"
                            placeholder={t('PURCHASEDPRODUCTS.FORM.PLACEHOLDER.CHOOSE.A.SUPPLIER')}
                            error={submitted && !purchasedProduct.supplier}
                            returnFullObject
                        />
                    </FormField>
                    <FormField
                        label={t('PURCHASEDPRODUCT.FORM.INPUT.SERVICE')}
                        required
                        error={submitted && !purchasedProduct.service ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={purchasedProduct.service}
                            options={services || []}
                            onChange={(selected) =>
                                setPurchasedProduct((prev) => ({
                                    ...prev,
                                    service: selected
                                }))
                            }
                            optionLabel="company_name"
                            placeholder={t('PURCHASEDPRODUCTS.FORM.PLACEHOLDER.CHOOSE.A.SERVICE')}
                            error={submitted && !purchasedProduct.service}
                            returnFullObject
                            itemTemplate={(option) => (
                                <div className="flex gap-2">
                                    <div>{option.service_category?.category_name}</div>
                                    <div>{option.company?.company_name}</div>
                                </div>
                            )}
                            valueTemplate={(option) => (
                                <div className="flex gap-2 text-sm">
                                    <span>{option.service_category?.category_name}</span>
                                    <span>{option.company?.company_name}</span>
                                </div>
                            )}
                        />
                    </FormField>
                    <FormField
                        label={t('PURCHASEDPRODUCT.FORM.INPUT.PRODUCTNAME')}
                        required
                        error={submitted && !purchasedProduct.product_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
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
                            className={cn('w-full', submitted && !purchasedProduct.product_name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('PURCHASEDPRODUCT.FORM.INPUT.QUANTITY')}
                        required
                        error={submitted && !purchasedProduct.quantity ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <NumberInput
                            id="quantity"
                            value={purchasedProduct.quantity || null}
                            onValueChange={(v) =>
                                setPurchasedProduct((prev) => ({
                                    ...prev,
                                    quantity: v ?? 0
                                }))
                            }
                            min={0}
                            step={1}
                            allowNull={false}
                            className={cn('w-full', submitted && !purchasedProduct.quantity && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('PURCHASEDPRODUCT.FORM.INPUT.PURCHASEPRICE')}
                        required
                        error={submitted && !purchasedProduct.purchase_price ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="purchase_price"
                            value={purchasedProduct.purchase_price}
                            onChange={(e) =>
                                setPurchasedProduct((prev) => ({
                                    ...prev,
                                    purchase_price: e.target.value
                                }))
                            }
                            required
                            placeholder={t('PURCHASEDPRODUCTS.FORM.PLACEHOLDER.PURCHASE.PRICE')}
                            className={cn('w-full', submitted && !purchasedProduct.purchase_price && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('PURCHASEDPRODUCT.FORM.INPUT.PURCHASEDATE')}
                        required
                        error={submitted && !purchasedProduct.purchase_date ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <DateField
                            id="purchase_date"
                            value={purchasedProduct.purchase_date || ''}
                            onValueChange={(v) =>
                                setPurchasedProduct((prev) => ({
                                    ...prev,
                                    purchase_date: v
                                }))
                            }
                            required
                            className={cn('w-full', submitted && !purchasedProduct.purchase_date && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField label={t('PURCHASEDPRODUCT.FORM.INPUT.STATUS')}>
                        <Select
                            value={purchasedProduct.status != null ? String(purchasedProduct.status) : undefined}
                            onValueChange={(v) =>
                                setPurchasedProduct((prev) => ({
                                    ...prev,
                                    status: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Active</SelectItem>
                                <SelectItem value="0">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                </FormSection>
            </FormSheet>

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
    );
};

export default withAuth(PurchasedProductPage);
