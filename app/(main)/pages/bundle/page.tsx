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
import { _fetchCompanies, _deleteCompany, _addCompany, _editCompany } from '@/app/redux/actions/companyActions';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { _addService, _deleteService, _editService, _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { _fetchServiceCategories } from '@/app/redux/actions/serviceCategoryActions';
import { _addBundle, _deleteBundle, _deleteSelectedBundles, _editBundle, _fetchBundleList, _setProvider, _unsetProvider } from '@/app/redux/actions/bundleActions';
import { Paginator } from 'primereact/paginator';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { currenciesReducer } from '../../../redux/reducers/currenciesReducer';
import { AppDispatch } from '@/app/redux/store';
import { ApiBinding, Bundle, Category, Product, Provider, RawInternet, Service } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { _fetchProviders } from '@/app/redux/actions/providerActions';
import { _fetchSingleProvider } from '@/app/redux/actions/singleProviderAction';
import { singleProviderReducer } from '../../../redux/reducers/singleProviderReducer';
import BundleForm from '../../components/Form/BundleForm';
import { fetchProviderCategories, fetchCategoryProducts, clearSelectedCategory } from '@/app/redux/actions/providerActions';

const BundlePage = () => {
    let emptyBundle: Bundle = {
        id: 0,
        bundle_code: '',
        service_id: 0,
        bundle_title: '',
        bundle_description: '',
        bundle_type: '',
        validity_type: '',
        admin_buying_price: '',
        buying_price: '',
        selling_price: '',
        amount: '',
        bundle_image_url: '',
        currency_id: 0,
        expired_date: '',
        deleted_at: '',
        created_at: '',
        updated_at: '',
        service: null,
        currency: null,
        api_provider_id: null,
        api_provider_bundle_id: null,
        api_binding: null
    };

    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [selectedCapability, setSelectedCapability] = useState('');
    const [selectedProviderBundle, setSelectedProviderBundle] = useState<RawInternet | null>(null);

    const [serviceDialog, setServiceDialog] = useState(false);
    const [deleteServiceDialog, setDeleteServiceDialog] = useState(false);
    const [deleteServicesDialog, setDeleteServicesDialog] = useState(false);
    const [bundle, setBundle] = useState<Bundle>(emptyBundle);
    const [selectedBundles, setSelectedBundles] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { companies } = useSelector((state: any) => state.companyReducer);
    const { services } = useSelector((state: any) => state.serviceReducer);
    const { serviceCategories } = useSelector((state: any) => state.serviceCategoryReducer);
    const { bundles, pagination, loading } = useSelector((state: any) => state.bundleReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');
    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_status: null as number | null,
        filter_service_category_type: null as string | null,
        filter_company_id: null as number | null,
        filter_service_id: null as number | null
    });

    const [activeFilters, setActiveFilters] = useState({});
    const { providers } = useSelector((state: any) => state.providerReducer);
    const { rawInternets, rawBundles } = useSelector((state: any) => state.singleProviderReducer);

    const [providerSearchTag, setProviderSearchTag] = useState('');

    const [unsetDialogVisible, setUnsetDialogVisible] = useState(false);
    const [bundleToUnset, setBundleToUnset] = useState<Bundle | null>(null);
    const [editingRows, setEditingRows] = useState({});

    // State for mzr provider categories and products
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        dispatch(_fetchBundleList(1, searchTag));
        dispatch(_fetchCurrencies());
        dispatch(_fetchServiceList());
        dispatch(_fetchCompanies());
        dispatch(_fetchServiceCategories());
    }, [dispatch, searchTag]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (providerSearchTag) {
                dispatch(_fetchProviders(1, providerSearchTag));
            } else {
                dispatch(_fetchProviders(1, ''));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [providerSearchTag, dispatch]);

    // Fetch categories when mzr provider is selected
    useEffect(() => {
        if (selectedProvider && selectedProvider.code === 'mzr') {
            const loadCategories = async () => {
                setLoadingCategories(true);
                try {
                    const result = await dispatch(fetchProviderCategories(selectedProvider.code));
                    setCategories(result || []);
                    setSelectedCategory(null);
                    setCategoryProducts([]);
                    setSelectedCapability(''); // Clear capability for mzr
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    toast.current?.show({
                        severity: 'error',
                        summary: t('ERROR'),
                        detail: t('FAILED_TO_FETCH_CATEGORIES'),
                        life: 3000
                    });
                } finally {
                    setLoadingCategories(false);
                }
            };
            loadCategories();
        } else {
            setCategories([]);
            setSelectedCategory(null);
            setCategoryProducts([]);
        }
    }, [selectedProvider, dispatch, t]);

    // Fetch products when category is selected for mzr provider
    useEffect(() => {
        if (selectedProvider && selectedProvider.code === 'mzr' && selectedCategory) {
            const loadProducts = async () => {
                setLoadingProducts(true);
                try {
                    const result = await dispatch(fetchCategoryProducts(selectedProvider.code, selectedCategory.id));
                    if (result && result.products) {
                        setCategoryProducts(result.products);
                    }
                } catch (error) {
                    console.error('Error fetching products:', error);
                    toast.current?.show({
                        severity: 'error',
                        summary: t('ERROR'),
                        detail: t('FAILED_TO_FETCH_PRODUCTS'),
                        life: 3000
                    });
                } finally {
                    setLoadingProducts(false);
                }
            };
            loadProducts();
        } else {
            setCategoryProducts([]);
        }
    }, [selectedCategory, selectedProvider, dispatch, t]);

    // Fetch rawInternets for non-mzr providers
    useEffect(() => {
        if (selectedProvider && selectedCapability && selectedProvider.code !== 'mzr') {
            dispatch(_fetchSingleProvider(selectedProvider?.id, selectedProvider?.code, selectedCapability, bundle.service?.company?.company_name ?? ""));
        }
    }, [dispatch, selectedProvider, selectedCapability, bundle.service?.company?.company_name]);

    useEffect(() => {
        if (Object.keys(activeFilters).length > 0) {
            dispatch(_fetchBundleList(1, searchTag, activeFilters));
        }
    }, [dispatch, activeFilters, searchTag]);

    const openNew = () => {
        setBundle(emptyBundle);
        setSubmitted(false);
        setServiceDialog(true);
        setSelectedProvider(null);
        setSelectedCapability('');
        setSelectedProviderBundle(null);
        setSelectedCategory(null);
        setCategories([]);
        setCategoryProducts([]);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setServiceDialog(false);
        setBundle(emptyBundle);
        setSelectedProvider(null);
        setSelectedCapability('');
        setSelectedProviderBundle(null);
        setSelectedCategory(null);
        setCategories([]);
        setCategoryProducts([]);
    };

    const hideDeleteServiceDialog = () => {
        setDeleteServiceDialog(false);
        setBundle(emptyBundle);
    };

    const hideDeleteServicesDialog = () => {
        setDeleteServicesDialog(false);
        setBundle(emptyBundle);
    };

    const priceEditor = (options: any) => {
        return (
            <InputText
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
                className="w-full"
            />
        );
    };

    const onRowEditChange = (e: any) => {
        setEditingRows(e.data);
    };

    const onCellEditComplete = (e: any) => {
        const { newRowData, index } = e;

        if (newRowData.admin_buying_price !== bundles[index]?.admin_buying_price ||
            newRowData.buying_price !== bundles[index]?.buying_price ||
            newRowData.selling_price !== bundles[index]?.selling_price) {
            dispatch(_editBundle(newRowData.id, newRowData, toast, t))
        }
    };

    const saveService = () => {
        setSubmitted(true);
        if (!bundle.bundle_title || !bundle.bundle_description || !bundle.admin_buying_price || !bundle.buying_price || !bundle.selling_price || !bundle.validity_type || !bundle.service || !bundle.currency) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        // For mzr provider, use selectedCategory and categoryProducts
        if (selectedProvider && selectedProvider.code === 'mzr' && selectedCategory && selectedProviderBundle) {
            const providerData = {
                api_provider_id: selectedProvider.id,
                api_provider_bundle_id: selectedProviderBundle.id,
                api_binding: {
                    product_type: selectedCategory.purchase_type,
                    category_id: selectedCategory.id,
                    category_name: selectedCategory.name,
                    product_id: selectedProviderBundle.id,
                    product_name: selectedProviderBundle.name,
                    price: selectedProviderBundle.price,
                    stock: selectedProviderBundle.stock,
                    description: selectedProviderBundle.description
                }
            };

            if (bundle.id && bundle.id !== 0) {
                dispatch(_editBundle(bundle.id, bundle, toast, t))
                    .then((newBundle) => {
                        if (newBundle) {
                            dispatch(_setProvider(newBundle.id, providerData, toast, t));
                        }
                    })
                    .catch((err) => {
                        console.error('Edit bundle failed:', err);
                    });
            } else {
                dispatch(_addBundle(bundle, toast, t))
                    .then((newBundle) => {
                        if (newBundle) {
                            dispatch(_setProvider(newBundle.id, providerData, toast, t));
                        }
                    })
                    .catch((err) => {
                        console.error('Add bundle failed:', err);
                    });
            }
        }
        // For non-mzr providers
        else if (selectedProvider && selectedProviderBundle && selectedProvider.code !== 'mzr') {
            const providerData = {
                api_provider_id: selectedProvider.id,
                api_provider_bundle_id: selectedProviderBundle.id,
                api_binding: {
                    product_type: selectedProviderBundle.product_type,
                    operator: selectedProviderBundle.operator,
                    internet_type: selectedProviderBundle.internet_type,
                    sim_type: selectedProviderBundle.sim_type,
                    product_id: selectedProviderBundle.id,
                    table_id: selectedProviderBundle.table_id,
                    name: selectedProviderBundle.name,
                    days: selectedProviderBundle.days,
                    volume: selectedProviderBundle.volume,
                    unit: selectedProviderBundle.unit,
                    periodicity: selectedProviderBundle.periodicity
                }
            };

            if (bundle.id && bundle.id !== 0) {
                dispatch(_editBundle(bundle.id, bundle, toast, t))
                    .then((newBundle) => {
                        if (newBundle) {
                            dispatch(_setProvider(newBundle.id, providerData, toast, t));
                        }
                    })
                    .catch((err) => {
                        console.error('Edit bundle failed:', err);
                    });
            } else {
                dispatch(_addBundle(bundle, toast, t))
                    .then((newBundle) => {
                        if (newBundle) {
                            dispatch(_setProvider(newBundle.id, providerData, toast, t));
                        }
                    })
                    .catch((err) => {
                        console.error('Add bundle failed:', err);
                    });
            }
        } else {
            // Save without provider binding
            if (bundle.id && bundle.id !== 0) {
                dispatch(_editBundle(bundle.id, bundle, toast, t));
            } else {
                dispatch(_addBundle(bundle, toast, t));
            }
        }

        setServiceDialog(false);
        setBundle(emptyBundle);
        setSubmitted(false);
        hideDialog();
    };

    const editService = (bundle: Bundle) => {
        console.log(bundle);

        let parsedApiBinding: any = null;
        if (bundle.api_binding) {
            try {
                parsedApiBinding = typeof bundle.api_binding === 'string' ? JSON.parse(bundle.api_binding) : bundle.api_binding;
            } catch (e) {
                console.error('Failed to parse api_binding:', e);
            }
        }

        setBundle({
            ...bundle,
            service_id: bundle.service?.id || 0
        });

        if (bundle.api_provider_id && parsedApiBinding) {
            const provider = providers.find((p: any) => p.id == bundle.api_provider_id);
            if (provider) {
                setSelectedProvider(provider);

                // Check if provider is mzr
                if (provider.code === 'mzr' && parsedApiBinding.category_id) {
                    // For mzr provider, set category and product
                    setSelectedCategory({ id: parsedApiBinding.category_id, name: parsedApiBinding.category_name } as Category);
                    setSelectedProviderBundle({ id: parsedApiBinding.product_id, name: parsedApiBinding.product_name, price: parsedApiBinding.price } as RawInternet);
                } else {
                    // For non-mzr providers
                    const capability = provider.capabilities.find((cap: any) =>
                        cap.toLowerCase().includes(parsedApiBinding.internet_type) ||
                        cap.toLowerCase().includes(parsedApiBinding.sim_type)
                    ) || provider.capabilities[0];

                    setSelectedCapability(capability);

                    const providerBundle = rawInternets.find((b: any) =>
                        String(b.table_id) === String(parsedApiBinding.table_id) &&
                        String(b.id) === String(parsedApiBinding.product_id)
                    );

                    if (providerBundle) {
                        setSelectedProviderBundle(providerBundle);
                    } else {
                        setSelectedProviderBundle(parsedApiBinding);
                    }
                }
            }
        }

        setServiceDialog(true);
    };

    const confirmDeleteService = (bundle: Bundle) => {
        setBundle(bundle);
        setDeleteServiceDialog(true);
    };

    const deleteService = () => {
        if (!bundle?.id) {
            console.error('Service ID is undefined.');
            return;
        }
        dispatch(_deleteBundle(bundle?.id, toast, t));
        setDeleteServiceDialog(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.p-dropdown-panel')) {
                return;
            }
            if (filterDialogVisible && filterRef.current && !filterRef.current.contains(target)) {
                setFilterDialogVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [filterDialogVisible]);

    const filterRef = useRef<HTMLDivElement>(null);

    const handleSubmitFilter = (filters: any) => {
        setActiveFilters(filters);
    };

    const confirmDeleteSelected = () => {
        if (!selectedBundles || (selectedBundles as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteServicesDialog(true);
    };

    const deleteSelectedBundles = async () => {
        if (!selectedBundles || (selectedBundles as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        const selectedIds = (selectedBundles as Bundle[]).map((bundle) => bundle.id);

        await _deleteSelectedBundles(selectedIds, toast, t);
        dispatch(_fetchBundleList());

        setSelectedBundles(null);
        setDeleteServicesDialog(false);
    };

    const confirmUnsetBundle = (bundle: Bundle) => {
        setBundleToUnset(bundle);
        setUnsetDialogVisible(true);
    };

    const unsetBundle = () => {
        if (bundleToUnset?.id) {
            dispatch(_unsetProvider(bundleToUnset.id, toast, t));
            setUnsetDialogVisible(false);
            setBundleToUnset(null);
            setSelectedProvider(null);
            setSelectedCapability('');
            setSelectedProviderBundle(null);
            setSelectedCategory(null);
            setCategories([]);
            setCategoryProducts([]);
        }
    };

    const rightToolbarTemplate = () => {
        const hasSelectedBundles = selectedBundles && (selectedBundles as any).length > 0;
        return (
            <React.Fragment>
                <div className="my-2" style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                    <div className="flex-shrink-0 h-10 min-w-0" ref={filterRef} style={{ position: 'relative' }}>
                        <Button style={{ gap: '8px' }} label={t('ORDER.FILTER.FILTER')} icon="pi pi-filter" className="p-button-info" onClick={() => setFilterDialogVisible(!filterDialogVisible)} />
                        {filterDialogVisible && (
                            <div
                                className="p-card p-fluid"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: isRTL() ? '-100%' : '-20%',
                                    right: isRTL() ? '-20%' : '-100%',
                                    width: '300px',
                                    zIndex: 1000,
                                    marginTop: '0.5rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div className="p-card-body" style={{ padding: '1rem' }}>
                                    <div className="grid">
                                        <div className="col-12">
                                            <label htmlFor="bundleTypeFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('ORDER.FILTER.BUNDLE_TYPE')}
                                            </label>
                                            <Dropdown
                                                id="bundleTypeFilter"
                                                options={[
                                                    { label: t('ORDER.FILTER.SOCIAL'), value: 'social' },
                                                    { label: t('ORDER.FILTER.NONSOCIAL'), value: 'nonsocial' }
                                                ]}
                                                value={filters.filter_service_category_type}
                                                onChange={(e) => setFilters({ ...filters, filter_service_category_type: e.value })}
                                                placeholder={t('ORDER.FILTER.SELECT_TYPE')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="companyFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('ORDER.FILTER.COMPANY')}
                                            </label>
                                            <Dropdown
                                                id="companyFilter"
                                                options={companies}
                                                value={filters.filter_company_id}
                                                onChange={(e) => setFilters({ ...filters, filter_company_id: e.value })}
                                                optionLabel="company_name"
                                                optionValue="id"
                                                placeholder={t('ORDER.FILTER.SELECT_COMPANY')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="serviceFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('ORDER.FILTER.SERVICE')}
                                            </label>
                                            <Dropdown
                                                id="serviceFilter"
                                                value={services.find((s: Service) => s.id === filters.filter_service_id) || null}
                                                options={services}
                                                onChange={(e) => {
                                                    console.log(e.value.id), setFilters({ ...filters, filter_service_id: e.value.id });
                                                }}
                                                optionLabel="company.company_name"
                                                placeholder={t('ORDER.FILTER.SELECT_SERVICE')}
                                                style={{ width: '100%' }}
                                                itemTemplate={(option) => (
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <div>{option.service_category?.category_name}</div>
                                                        <div>- {option.company?.company_name}</div>
                                                    </div>
                                                )}
                                                valueTemplate={(option) => {
                                                    if (!option) return t('BUNDLE.FORM.PLACEHOLDER.SERVICENAME');
                                                    return (
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <div>{option.service_category?.category_name}</div>
                                                            <div>- {option.company?.company_name}</div>
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </div>

                                        <div className="col-12 mt-3 flex justify-content-between gap-2">
                                            <Button
                                                label={t('RESET')}
                                                icon="pi pi-times"
                                                className="p-button-secondary p-button-sm"
                                                onClick={() => {
                                                    setFilters({
                                                        filter_status: null,
                                                        filter_service_category_type: null,
                                                        filter_service_id: null,
                                                        filter_company_id: null
                                                    });
                                                }}
                                            />
                                            <Button
                                                label={t('APPLY')}
                                                icon="pi pi-check"
                                                className="p-button-sm"
                                                onClick={() => {
                                                    handleSubmitFilter(filters);
                                                    setFilterDialogVisible(false);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('BUNDLE.TABLE.CREATEBUNDLE')}
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
                    <InputText type="search" onInput={(e) => setSearchTag(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} className="w-full md:w-auto" />
                </span>
            </div>
        );
    };

    const bundleTitleBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Bundle Title</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle_title}</span>
            </>
        );
    };

    const descriptionBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Description</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle_description}</span>
            </>
        );
    };

    const validityTypeBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Validity Type</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.validity_type}</span>
            </>
        );
    };

    const adminBuyingPriceBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Admin Buying Price</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.admin_buying_price}</span>
            </>
        );
    };

    const buyingPriceBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Buying Price</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.buying_price}</span>
            </>
        );
    };

    const sellingPriceBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Selling Price</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.selling_price}</span>
            </>
        );
    };

    const currencyBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Currency</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.currency?.name}</span>
            </>
        );
    };

    const serviceNameBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Service Name</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                        src={`${rowData.service?.company?.company_logo}`}
                        alt={rowData.service?.company?.company_name || 'Company Logo'}
                        style={{
                            padding: '2px',
                            width: '35px',
                            height: '35px',
                            borderRadius: '50%',
                            objectFit: 'contain'
                        }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.service?.company?.company_name}</span>
                </div>
            </>
        );
    };

    const serviceCategoryBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Service Category</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.service?.service_category?.category_name}</span>
            </>
        );
    };

    const providerInfoBodyTemplate = (rowData: Bundle) => {
        let bindingName = "";

        try {
            let parsed: ApiBinding;

            if (typeof rowData.api_binding === "string") {
                parsed = JSON.parse(rowData.api_binding) as ApiBinding;
            } else {
                parsed = rowData.api_binding as ApiBinding;
            }

            bindingName = parsed?.name || parsed?.product_name || "N/A";
        } catch (e) {
            console.error("Invalid api_binding:", e);
        }

        return (
            <>
                <span className="p-column-title">Provider</span>
                <span style={{ fontSize: "0.8rem", color: "#666" }}>
                    {bindingName}
                </span>
            </>
        );
    };

    const createdAtBodyTemplate = (rowData: Bundle) => {
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

        const { formattedDate, formattedTime } = formatDate(rowData.created_at);

        return (
            <>
                <span className="p-column-title">Created At</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editService(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteService(rowData)} />
            </>
        );
    };

    const companyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveService} />
        </>
    );
    const deleteCompanyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteServiceDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteService} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteServicesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedBundles} />
        </>
    );

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchBundleList(page, searchTag, activeFilters));
    };

    useEffect(() => {
        if (bundle.service_id) {
            const selectedService = services.find((service: Service) => service.id === bundle.service_id);
            if (selectedService) {
                setBundle((prev) => ({
                    ...prev,
                    service: selectedService
                }));
            }
        }
    }, [bundle.service_id, services]);

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={bundles}
                        selection={selectedBundles}
                        onSelectionChange={(e) => setSelectedBundles(e.value as any)}
                        dataKey="id"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        scrollHeight='flex'
                        scrollable
                        responsiveLayout="scroll"
                        paginator={false}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        currentPageReportTemplate={isRTL() ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`}
                        editMode="cell"
                    >
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Bundle Title" header={t('BUNDLE.TABLE.COLUMN.BUNDLENAME')} body={bundleTitleBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Description" header={t('BUNDLE.TABLE.COLUMN.BUNDLEDESCRIPTION')} body={descriptionBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Validity Type" header={t('BUNDLE.TABLE.COLUMN.VALIDITYTYPE')} body={validityTypeBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="admin_buying_price" header={t('BUNDLE.TABLE.COLUMN.ADMINBUYINGPRICE')} body={adminBuyingPriceBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }} editor={(options) => priceEditor(options)} onCellEditComplete={onCellEditComplete}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="buying_price" header={t('BUNDLE.TABLE.COLUMN.BUYINGPRICE')} body={buyingPriceBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }} editor={(options) => priceEditor(options)} onCellEditComplete={onCellEditComplete}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="selling_price" header={t('BUNDLE.TABLE.COLUMN.SELLINGPRICE')} body={sellingPriceBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }} editor={(options) => priceEditor(options)} onCellEditComplete={onCellEditComplete}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Currency" header={t('BUNDLE.TABLE.COLUMN.CURRENCYNAME')} body={currencyBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Service" header={t('BUNDLE.TABLE.FILTER.SERVICE')} body={serviceNameBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Category" header={t('BUNDLE.TABLE.COLUMN.SERVICECATEGORY')} body={serviceCategoryBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Created" header={t('BUNDLE_PROVIDER')} body={providerInfoBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Created" header={t('TABLE.GENERAL.CREATEDAT')} body={createdAtBodyTemplate} headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}></Column>
                    </DataTable>
                    <Paginator
                        first={(pagination?.page - 1) * pagination?.items_per_page}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={isRTL() ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'}
                        currentPageReportTemplate={isRTL() ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`}
                        firstPageLinkIcon={isRTL() ? "pi pi-angle-double-right" : "pi pi-angle-double-left"}
                        lastPageLinkIcon={isRTL() ? "pi pi-angle-double-left" : "pi pi-angle-double-right"}
                    />

                    <Dialog
                        visible={serviceDialog}
                        style={{ width: '95%', maxWidth: '1200px', padding: '5px' }}
                        header={t('BUNDLE.DETAILS')}
                        modal
                        className="p-fluid"
                        footer={companyDialogFooter}
                        onHide={hideDialog}
                        
                        breakpoints={{ '960px': '95vw', '640px': '95vw' }}
                    >
                        <div className="card" style={{ padding: '20px' }}>
                            {/* Basic Information Section */}
                            <div className="grid formgrid p-fluid">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="bundle_title" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE.FORM.INPUT.BUNDLETITLE')} <span className="text-red-500">*</span>
                                    </label>
                                    <InputText
                                        id="bundle_title"
                                        value={bundle.bundle_title}
                                        onChange={(e) =>
                                            setBundle((perv) => ({
                                                ...perv,
                                                bundle_title: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('BUNDLE.FORM.PLACEHOLDER.BUNDLETITLE')}
                                        className={classNames('w-full', {
                                            'p-invalid': submitted && !bundle.bundle_title
                                        })}
                                    />
                                    {submitted && !bundle.bundle_title && (
                                        <small className="p-invalid text-red-500">
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label htmlFor="bundle_description" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE.FORM.INPUT.BUNDLEDESCRIPTION')} <span className="text-red-500">*</span>
                                    </label>
                                    <InputText
                                        id="bundle_description"
                                        value={bundle.bundle_description}
                                        onChange={(e) =>
                                            setBundle((perv) => ({
                                                ...perv,
                                                bundle_description: e.target.value
                                            }))
                                        }
                                        required
                                        placeholder={t('BUNDLE.FORM.PLACEHOLDER.BUNDLEDESCRIPTION')}
                                        className={classNames('w-full', {
                                            'p-invalid': submitted && !bundle.bundle_description
                                        })}
                                    />
                                    {submitted && !bundle.bundle_description && (
                                        <small className="p-invalid text-red-500">
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="grid formgrid p-fluid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="admin_buying_price" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE.FORM.INPUT.ADMINBUYINGPRICE')} <span className="text-red-500">*</span>
                                    </label>
                                    <InputText
                                        id="admin_buying_price"
                                        value={bundle.admin_buying_price}
                                        onChange={(e) =>
                                            setBundle((perv) => ({
                                                ...perv,
                                                admin_buying_price: e.target.value
                                            }))
                                        }
                                        required
                                        placeholder={t('BUNDLE.FORM.PLACEHOLDER.ADMINBUYINGPRICE')}
                                        className={classNames('w-full', {
                                            'p-invalid': submitted && !bundle.admin_buying_price
                                        })}
                                    />
                                    {submitted && !bundle.admin_buying_price && (
                                        <small className="p-invalid text-red-500">
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label htmlFor="buying_price" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE.FORM.INPUT.BUYINGPRICE')} <span className="text-red-500">*</span>
                                    </label>
                                    <InputText
                                        id="buying_price"
                                        value={bundle.buying_price}
                                        onChange={(e) =>
                                            setBundle((perv) => ({
                                                ...perv,
                                                buying_price: e.target.value
                                            }))
                                        }
                                        required
                                        placeholder={t('BUNDLE.FORM.PLACEHOLDER.BUYINGPRICE')}
                                        className={classNames('w-full', {
                                            'p-invalid': submitted && !bundle.buying_price
                                        })}
                                    />
                                    {submitted && !bundle.buying_price && (
                                        <small className="p-invalid text-red-500">
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label htmlFor="selling_price" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE.FORM.INPUT.SELLINGPRICE')} <span className="text-red-500">*</span>
                                    </label>
                                    <InputText
                                        id="selling_price"
                                        value={bundle.selling_price}
                                        onChange={(e) =>
                                            setBundle((perv) => ({
                                                ...perv,
                                                selling_price: e.target.value
                                            }))
                                        }
                                        required
                                        placeholder={t('BUNDLE.FORM.PLACEHOLDER.SELLINGPRICE')}
                                        className={classNames('w-full', {
                                            'p-invalid': submitted && !bundle.selling_price
                                        })}
                                    />
                                    {submitted && !bundle.selling_price && (
                                        <small className="p-invalid text-red-500">
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Validity and Bundle Type Section */}
                            <div className="grid formgrid p-fluid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="validity_type" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE.FORM.INPUT.VALIDITYTYPE')} <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                        id="validity_type"
                                        value={bundle.validity_type}
                                        options={[
                                            { label: 'Unlimited', value: 'unlimited' },
                                            { label: 'Daily', value: 'daily' },
                                            { label: 'Nightly', value: 'nightly' },
                                            { label: 'Weekly', value: 'weekly' },
                                            { label: 'Monthly', value: 'monthly' },
                                            { label: 'Yearly', value: 'yearly' }
                                        ]}
                                        onChange={(e) =>
                                            setBundle((prev) => ({
                                                ...prev,
                                                validity_type: e.value
                                            }))
                                        }
                                        placeholder={t('BUNDLE.FORM.PLACEHOLDER.VALIDITYTYPE')}
                                        className="w-full"
                                    />
                                    {submitted && !bundle.validity_type && (
                                        <small className="p-invalid text-red-500">
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label htmlFor="bundle_type" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('ORDER.FILTER.BUNDLE_TYPE')} <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                        id="bundle_type"
                                        options={[
                                            { label: t('BUNDLE.FORM.INPUT.SELECT.BUNDLETYPE.OPTION.CREDIT'), value: 'credit' },
                                            { label: t('BUNDLE.FORM.INPUT.SELECT.BUNDLETYPE.OPTION.PACKAGE'), value: 'package' }
                                        ]}
                                        value={bundle.bundle_type}
                                        onChange={(e) => setBundle({ ...bundle, bundle_type: e.value })}
                                        placeholder={t('ORDER.FILTER.SELECT_TYPE')}
                                        className="w-full"
                                    />
                                    {submitted && !bundle.bundle_type && (
                                        <small className="p-invalid text-red-500">
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label htmlFor="amount" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE.FORM.INPUT.AMOUNT')}
                                    </label>
                                    <InputText
                                        id="amount"
                                        value={bundle.amount?.toString()}
                                        onChange={(e) =>
                                            setBundle((perv) => ({
                                                ...perv,
                                                amount: e.target.value
                                            }))
                                        }
                                        placeholder={t('BUNDLE.FORM.PLACEHOLDER.AMOUNT')}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Service and Currency Section */}
                            <div className="grid formgrid p-fluid">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="service" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE.FORM.INPUT.SERVICENAME')} <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                        id="service"
                                        value={services.find((s: Service) => s.id === bundle.service_id) || null}
                                        options={services}
                                        onChange={(e) => {
                                            setBundle((prev) => ({
                                                ...prev,
                                                service_id: e.value.id,
                                                service: e.value
                                            }));
                                        }}
                                        optionLabel="company.company_name"
                                        placeholder={t('BUNDLE.FORM.PLACEHOLDER.SERVICENAME')}
                                        className="w-full"
                                        itemTemplate={(option) => (
                                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                <div>{option.service_category?.category_name}</div>
                                                <div>- {option.company?.company_name}</div>
                                            </div>
                                        )}
                                        valueTemplate={(option) => {
                                            if (!option) return t('BUNDLE.FORM.PLACEHOLDER.SERVICENAME');
                                            return (
                                                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                    <div>{option.service_category?.category_name}</div>
                                                    <div>- {option.company?.company_name}</div>
                                                </div>
                                            );
                                        }}
                                    />
                                    {submitted && !bundle.service_id && (
                                        <small className="p-invalid text-red-500">
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label htmlFor="currency" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE.FORM.INPUT.CURRENCY')} <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                        id="currency"
                                        value={bundle.currency}
                                        options={currencies}
                                        onChange={(e) =>
                                            setBundle((prev) => ({
                                                ...prev,
                                                currency: e.value
                                            }))
                                        }
                                        optionLabel="name"
                                        placeholder={t('CURRENCY.GENERAL.SELECTCURRENCY')}
                                        className="w-full"
                                    />
                                    {submitted && !bundle.currency && (
                                        <small className="p-invalid text-red-500">
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Provider Section */}
                            <div className="grid formgrid p-fluid">
                                <div className="field col-12">
                                    <label htmlFor="provider" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                        {t('BUNDLE_PROVIDER')}
                                    </label>
                                    <Dropdown
                                        id="provider"
                                        value={selectedProvider}
                                        options={providers}
                                        onChange={(e) => {
                                            setSelectedProvider(e.value);
                                        }}
                                        optionLabel="name"
                                        filter
                                        filterBy="name"
                                        filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                        showFilterClear
                                        placeholder={t('SEARCH_PROVIDER')}
                                        className=""
                                        panelClassName=""
                                        onFilter={(e) => {
                                            setProviderSearchTag(e.filter);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Dynamic Provider Fields - Capabilities or Categories */}
                            {selectedProvider && selectedProvider.code !== 'mzr' && (
                                <div className="grid formgrid p-fluid">
                                    <div className="field col-12">
                                        <label htmlFor="capabilities" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                            {t('CAPABILITIES')}
                                        </label>
                                        <Dropdown
                                            id="capabilities"
                                            value={selectedCapability}
                                            options={selectedProvider?.capabilities}
                                            onChange={(e) => {
                                                setSelectedCapability(e.value);
                                            }}
                                            placeholder={t('SEARCH_CAPABILITIES')}
                                            className=""
                                            panelClassName=""
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedProvider && selectedProvider.code === 'mzr' && (
                                <>
                                    <div className="grid formgrid p-fluid">
                                        <div className="field col-12">
                                            <label htmlFor="category" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                {t('CATEGORIES')}
                                            </label>
                                            <Dropdown
                                                id="category"
                                                value={selectedCategory}
                                                options={categories}
                                                onChange={(e) => {
                                                    setSelectedCategory(e.value);
                                                    setSelectedProviderBundle(null);
                                                }}
                                                optionLabel="name"
                                                filter
                                                filterBy="name"
                                                filterPlaceholder={t('SEARCH_CATEGORY')}
                                                showFilterClear
                                                placeholder={t('SELECT_CATEGORY')}
                                                className=""
                                                panelClassName=""
                                                // loading={loadingCategories}
                                                itemTemplate={(option) => (
                                                    <div className="flex flex-col p-2 gap-1">
                                                        <div className="font-semibold">{option.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Products: {option.product_count} | Type: {option.purchase_type}
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {selectedCategory && (
                                        <div className="grid formgrid p-fluid">
                                            <div className="field col-12">
                                                <label htmlFor="product" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                    {t('PRODUCTS')}
                                                </label>
                                                <Dropdown
                                                    id="product"
                                                    value={selectedProviderBundle}
                                                    options={categoryProducts}
                                                    onChange={(e) => {
                                                        setSelectedProviderBundle(e.value);
                                                    }}
                                                    optionLabel="name"
                                                    filter
                                                    filterBy="name"
                                                    filterPlaceholder={t('SEARCH_PRODUCT')}
                                                    showFilterClear
                                                    placeholder={t('SELECT_PRODUCT')}
                                                    className=""
                                                    panelClassName=""
                                                    // loading={loadingProducts}
                                                    itemTemplate={(option) => (
                                                        <div className="flex flex-col p-2 gap-2">
                                                            <div className="font-semibold text-sm">{option.name}</div>
                                                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Price: {option.price}</span>
                                                                {option.stock !== undefined && (
                                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Stock: {option.stock}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    valueTemplate={(option) => {
                                                        if (!option) return t('SELECT_PRODUCT');
                                                        return (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-sm">{option.name}</span>
                                                                <span className="text-xs text-gray-600">Price: {option.price}</span>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {selectedProvider && selectedProvider.code !== 'mzr' && selectedCapability && (
                                <div className="grid formgrid p-fluid">
                                    <div className="field col-12">
                                        <label htmlFor="bundle_select" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                            {t('BUNDLE')}
                                        </label>
                                        <Dropdown
                                            id="bundle_select"
                                            value={selectedProviderBundle}
                                            options={rawInternets}
                                            onChange={(e) => {
                                                setSelectedProviderBundle(e.value);
                                            }}
                                            optionLabel="name"
                                            filter
                                            filterBy="title,operator,validity"
                                            filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                            showFilterClear
                                            placeholder={t('SEARCH_BUNDLE')}
                                            className="w-full"
                                            panelClassName="w-full"
                                            itemTemplate={(option) => (
                                                <div className="flex flex-col p-2 gap-2">
                                                    <div className="font-semibold text-sm">{option.name || option.title}</div>
                                                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{option.operator}</span>
                                                        {option.validity && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{option.validity}</span>}
                                                        {option.price && <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Price: {option.price}</span>}
                                                    </div>
                                                </div>
                                            )}
                                            valueTemplate={(option) => {
                                                if (!option) return t('SEARCH_BUNDLE');
                                                return (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">{option.name || option.title}</span>
                                                        <span className="text-xs text-gray-600">{option.operator}</span>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Unset Bundle Button */}
                            {bundle.api_provider_id && (
                                <div className="grid formgrid p-fluid">
                                    <div className="field col-12">
                                        <Button
                                            label={t('UNSET_BUNDLE')}
                                            icon="pi pi-times"
                                            severity="danger"
                                            className="w-full"
                                            onClick={() => confirmUnsetBundle(bundle)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteServiceDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompanyDialogFooter} onHide={hideDeleteServiceDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {bundle && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{bundle.bundle_title}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteServicesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteServicesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {selectedBundles && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')} </span>}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={unsetDialogVisible}
                        style={{ width: '450px' }}
                        header={t('TABLE.GENERAL.CONFIRM')}
                        modal
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="secondary" className={isRTL() ? 'rtl-button' : ''} onClick={() => setUnsetDialogVisible(false)} />
                                <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={unsetBundle} />
                            </>
                        }
                        onHide={() => setUnsetDialogVisible(false)}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: 'orange' }} />
                            {bundleToUnset && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_UNSET_PROVIDER')} <b>{bundleToUnset.bundle_title}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(BundlePage);
