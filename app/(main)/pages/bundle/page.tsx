/* eslint-disable @next/next/no-img-element */
'use client';
import { _addBundle, _deleteBundle, _deleteSelectedBundles, _editBundle, _fetchBundleList, _setProvider, _unsetProvider } from '@/app/redux/actions/bundleActions';
import { _fetchCompanies } from '@/app/redux/actions/companyActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchProviders, fetchCategoryProducts, fetchProviderCategories } from '@/app/redux/actions/providerActions';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { _fetchServiceCategories } from '@/app/redux/actions/serviceCategoryActions';
import {
    _fetchSingleProvider,
    _fetchPaystoreOperators,
    _fetchPaystoreProductsByFirm,
    _fetchManshorPayServices,
    _fetchManshorPayProducts
} from '@/app/redux/actions/singleProviderAction';
import { AppDispatch } from '@/app/redux/store';
import i18n from '@/i18n';
import { ApiBinding, Bundle, Category, Product, Provider, RawInternet, Service } from '@/types/interface';
import { PaystoreGroup, PaystoreOperator } from '@/types/interface';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FilterField, FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { RowActions } from '@/components/admin/row-actions';
import { Button as UiButton } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { customCellStyle } from '../../utilities/customRow';
import { isRTL } from '../../utilities/rtlUtil';
import { ManageTranslationsButton } from '@/app/(main)/components/ManageTranslationsButton';

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
    // Presentation-only filter. The admin bundle list is server-paginated;
    // this toggles which rows are visible on the CURRENT loaded page.
    const [bundleSourceFilter, setBundleSourceFilter] = useState<'all' | 'inquiry' | 'regular'>('all');
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
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [filterOpen, setFilterOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({
        filter_status: null as number | null,
        filter_service_category_type: null as string | null,
        filter_company_id: null as number | null,
        filter_service_id: null as number | null
    });

    const [activeFilters, setActiveFilters] = useState({});
    const { providers } = useSelector((state: any) => state.providerReducer);
    const {
        rawInternets,
        rawBundles,
        products,
        operatorGroups,
        totalGroups,
        selectedOpFirm: selectedOpFirmFromRedux,
        loading: singleProviderLoading
    } = useSelector((state: any) => state.singleProviderReducer);

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

    // Paystore operator states
    const [selectedPaystoreGroup, setSelectedPaystoreGroup] = useState<PaystoreGroup | null>(null);
    const [selectedPaystoreOperator, setSelectedPaystoreOperator] = useState<PaystoreOperator | null>(null);

    // INAX: one API request, then all filtering is local to the frontend.
    const [inaxResponseProducts, setInaxResponseProducts] = useState<any[]>([]);
    const [inaxLoading, setInaxLoading] = useState(false);
    const [selectedInaxCategory, setSelectedInaxCategory] = useState<string | null>(null);
    const [selectedInaxOperator, setSelectedInaxOperator] = useState<string | null>(null);
    const [selectedInaxSimType, setSelectedInaxSimType] = useState<string | null>(null);

    const flattenInaxProducts = (payload: any): any[] => {
        // Accept both original INAX data.categories[].bundles and an already
        // flattened Redux response, without making another HTTP request.
        const root = payload?.payload?.data || payload?.data || payload?.payload || payload;
        const categories = root?.categories || payload?.categories;
        if (Array.isArray(categories)) {
            return categories.flatMap((category: any) =>
                (Array.isArray(category.bundles) ? category.bundles : []).map((item: any) => ({
                    ...item,
                    category: item.category || category.code || category.name,
                    table_id: item.table_id || item.provider_table_id,
                    name: item.name || item.title,
                    operator: item.operator || item.meta?.operator,
                    sim_type: item.sim_type || item.meta?.sim_type,
                    internet_type: item.internet_type || item.meta?.internet_type
                }))
            );
        }
        const possible = Array.isArray(root) ? root : (root?.bundles || root?.rawInternets || root?.rawBundles || root?.products || root?.data?.bundles);
        if (!Array.isArray(possible)) return [];
        return possible.map((item: any) => ({
            ...item,
            category: item.category || item.category_name || 'Other',
            table_id: item.table_id || item.provider_table_id,
            name: item.name || item.title,
            operator: item.operator || item.meta?.operator,
            sim_type: item.sim_type || item.meta?.sim_type,
            internet_type: item.internet_type || item.meta?.internet_type
        }));
    };

    const inaxProducts = React.useMemo(() => {
        const primary = inaxResponseProducts.length ? inaxResponseProducts : flattenInaxProducts(rawInternets);
        const fallback = primary.length ? primary : flattenInaxProducts(rawBundles);
        return fallback;
    }, [inaxResponseProducts, rawInternets, rawBundles]);
    const inaxCategories = React.useMemo(() =>
        Array.from(new Set(inaxProducts.map((p: any) => String(p.category || 'Other')))).sort(), [inaxProducts]);
    const inaxCategoryProducts = React.useMemo(() => inaxProducts.filter((p: any) =>
        !selectedInaxCategory || String(p.category || 'Other') === selectedInaxCategory), [inaxProducts, selectedInaxCategory]);
    const inaxOperators = React.useMemo(() =>
        Array.from(new Set(inaxCategoryProducts.map((p: any) => String(p.operator || p.meta?.operator || 'Other')))).sort(), [inaxCategoryProducts]);
    const inaxOperatorProducts = React.useMemo(() => inaxCategoryProducts.filter((p: any) =>
        !selectedInaxOperator || String(p.operator || p.meta?.operator || 'Other') === selectedInaxOperator), [inaxCategoryProducts, selectedInaxOperator]);
    const inaxSimTypes = React.useMemo(() =>
        Array.from(new Set(inaxOperatorProducts.map((p: any) => String(p.sim_type || p.meta?.sim_type || 'Other')))).sort(), [inaxOperatorProducts]);
    const filteredInaxProducts = React.useMemo(() => inaxOperatorProducts.filter((p: any) =>
        !selectedInaxSimType || String(p.sim_type || p.meta?.sim_type || 'Other') === selectedInaxSimType), [inaxOperatorProducts, selectedInaxSimType]);
    const inaxProductLabel = (p: any) => `${p.title || p.name || `Product #${p.id}`} — ${p.sim_type || p.meta?.sim_type || 'SIM N/A'} — ${p.tprice ?? p.price ?? '-'} ${p.currency || 'IRT'}`;

    // ManshorPay states
    const [manshorPayServices, setManshorPayServices] = useState<any[]>([]);
    const [selectedManshorPayService, setSelectedManshorPayService] = useState<any | null>(null);
    const [manshorPayProducts, setManshorPayProducts] = useState<any[]>([]);
    const [manshorPayServicesLoading, setManshorPayServicesLoading] = useState(false);
    const [manshorPayProductsLoading, setManshorPayProductsLoading] = useState(false);

    const getManshorPayServiceLabel = (service: any): string => {
        if (!service) return '';

        if (typeof service._display_name === 'string' && service._display_name) {
            return service._display_name;
        }

        const operator =
            service.operator && typeof service.operator === 'object'
                ? String(service.operator?.name || '')
                : String(service.operator || '');

        const category =
            service.category && typeof service.category === 'object'
                ? String(service.category?.name || '')
                : String(service.category || '');

        const parts = [operator, category].filter(Boolean);

        if (parts.length > 0) {
            return parts.join(' - ');
        }

        if (typeof service.name === 'string' && service.name) {
            return service.name;
        }

        return `Service #${String(service.id || '')}`;
    };

    const getManshorPayProductTitle = (product: any) => {
        if (!product) return '';

        return (
            product.title ||
            product.name ||
            product.api_binding?.title ||
            `Bundle #${product.id}`
        );
    };

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

    // 🔥 FIXED: WHEN PROVIDER IS PAYSTORE - FETCH OPERATORS using the correct action
    useEffect(() => {
        if (selectedProvider && selectedProvider.code === 'paystore') {
            console.log('📦 Fetching operators for paystore provider:', selectedProvider.id);
            dispatch(_fetchPaystoreOperators(selectedProvider.id));
        }
    }, [dispatch, selectedProvider]);

    // WHEN PAYSTORE GROUP IS SELECTED - FETCH PRODUCTS BY OP_FIRM
    useEffect(() => {
        if (selectedProvider && selectedProvider.code === 'paystore' && selectedPaystoreGroup) {
            console.log('📦 Fetching paystore products for firm:', selectedPaystoreGroup.op_firm);
            dispatch(_fetchPaystoreProductsByFirm(
                selectedProvider.id,
                selectedPaystoreGroup.op_firm
            ));
        }
    }, [dispatch, selectedProvider, selectedPaystoreGroup]);

    // ManshorPay - fetch services when provider is selected
    useEffect(() => {
        if (!selectedProvider || selectedProvider.code !== 'manshorpay') {
            setManshorPayServices([]);
            setSelectedManshorPayService(null);
            setManshorPayProducts([]);
            setManshorPayServicesLoading(false);
            setManshorPayProductsLoading(false);
            return;
        }

        const loadManshorPayServices = async () => {
            setManshorPayServicesLoading(true);

            try {
                const result = await dispatch(
                    _fetchManshorPayServices(
                        selectedProvider.id,
                        1,
                        ''
                    )
                );

                const loadedServices = result?.services || [];
                setManshorPayServices(loadedServices);

                if (selectedManshorPayService?.id) {
                    const matchedService = loadedServices.find(
                        (service: any) =>
                            String(service.id) === String(selectedManshorPayService.id)
                    );

                    if (matchedService) {
                        setSelectedManshorPayService(matchedService);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching ManshorPay services:', error);

                toast.current?.show({
                    severity: 'error',
                    summary: t('ERROR'),
                    detail: error.response?.data?.message || 'Failed to fetch ManshorPay services',
                    life: 3000
                });
            } finally {
                setManshorPayServicesLoading(false);
            }
        };

        loadManshorPayServices();
    }, [dispatch, selectedProvider, t]);

    // ManshorPay - fetch products for selected service
    useEffect(() => {
        if (
            !selectedProvider ||
            selectedProvider.code !== 'manshorpay' ||
            !selectedManshorPayService?.id
        ) {
            setManshorPayProducts([]);
            return;
        }

        const loadManshorPayProducts = async () => {
            setManshorPayProductsLoading(true);

            try {
                const result = await dispatch(
                    _fetchManshorPayProducts(
                        selectedProvider.id,
                        selectedManshorPayService.id,
                        1,
                        ''
                    )
                );

                const loadedProducts = result?.products || [];
                setManshorPayProducts(loadedProducts);

                if (bundle.api_provider_bundle_id) {
                    const matchedProduct = loadedProducts.find(
                        (product: any) =>
                            String(product.id) === String(bundle.api_provider_bundle_id)
                    );

                    if (matchedProduct) {
                        setSelectedProviderBundle(matchedProduct);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching ManshorPay products:', error);

                toast.current?.show({
                    severity: 'error',
                    summary: t('ERROR'),
                    detail: error.response?.data?.message || 'Failed to fetch ManshorPay products',
                    life: 3000
                });
            } finally {
                setManshorPayProductsLoading(false);
            }
        };

        loadManshorPayProducts();
    }, [
        dispatch,
        selectedProvider,
        selectedManshorPayService,
        bundle.api_provider_bundle_id,
        t
    ]);

    useEffect(() => {
        if (selectedProvider?.code === 'zoodpay' && selectedCapability !== 'bundles') {
            setSelectedCapability('bundles');
        }
    }, [selectedProvider, selectedCapability]);

    // For other providers (non-paystore, non-mzr, non-manshorpay)
    useEffect(() => {
        if (!selectedProvider || ['mzr', 'paystore', 'manshorpay', 'inax'].includes(selectedProvider.code) || !selectedCapability) return;
        dispatch(_fetchSingleProvider(selectedProvider.id, selectedProvider.code, selectedCapability, bundle.service?.company?.company_name ?? ''));

    }, [dispatch, selectedProvider, selectedCapability, bundle.service?.company?.company_name]);

    // INAX uses existing provider Redux action only once per provider choice.
    // Category/operator/SIM dropdowns filter its returned products in memory.
    useEffect(() => {
        if (selectedProvider?.code !== 'inax') return;
        let active = true;
        const fetchInax = async () => {
            setInaxLoading(true);
            try {
                const result: any = await dispatch(_fetchSingleProvider(
                    selectedProvider.id,
                    selectedProvider.code,
                    (selectedProvider.capabilities && selectedProvider.capabilities[0]) || 'internet',
                    ''
                ));
                if (!active) return;
                const items = flattenInaxProducts(result);
                if (items.length) setInaxResponseProducts(items);
            } catch (error) {
                console.error('INAX products fetch failed:', error);
            } finally {
                if (active) setInaxLoading(false);
            }
        };
        fetchInax();
        return () => { active = false; };
    }, [dispatch, selectedProvider?.id, selectedProvider?.code]);

    // Debug effect
    useEffect(() => {
        console.log('📊 Products in Redux:', products);
        console.log('📊 Products length:', products?.length);
        console.log('📊 Raw Internets in Redux:', rawInternets);
        console.log('📊 Operator Groups:', operatorGroups);
        console.log('📊 Total Groups:', totalGroups);
        console.log('🔍 Selected Provider:', selectedProvider?.code);
        console.log('🔍 Selected Capability:', selectedCapability);
        console.log('🔍 Selected Paystore Group:', selectedPaystoreGroup?.op_firm);
    }, [products, rawInternets, selectedProvider, selectedCapability, operatorGroups, selectedPaystoreGroup, totalGroups]);

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
        setSelectedPaystoreGroup(null);
        setSelectedPaystoreOperator(null);
        setManshorPayServices([]);
        setSelectedManshorPayService(null);
        setManshorPayProducts([]);
        setInaxResponseProducts([]);
        setSelectedInaxCategory(null);
        setSelectedInaxOperator(null);
        setSelectedInaxSimType(null);
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
        setSelectedPaystoreGroup(null);
        setSelectedPaystoreOperator(null);
        setManshorPayServices([]);
        setSelectedManshorPayService(null);
        setManshorPayProducts([]);
        setInaxResponseProducts([]);
        setSelectedInaxCategory(null);
        setSelectedInaxOperator(null);
        setSelectedInaxSimType(null);
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
            <Input
                value={options.value ?? ''}
                onChange={(e) => options.editorCallback(e.target.value)}
                className="w-full"
            />
        );
    };

    const onRowEditChange = (e: any) => {
        setEditingRows(e.data);
    };

    const onCellEditComplete = (e: any) => {
        const { newRowData } = e;
        // Use the stable bundle ID: a source filter changes visible row indices.
        const original = (Array.isArray(bundles) ? bundles : []).find(
            (item: Bundle) => String(item.id) === String(newRowData.id)
        );
        if (!original) return;

        if (newRowData.admin_buying_price !== original.admin_buying_price ||
            newRowData.buying_price !== original.buying_price ||
            newRowData.selling_price !== original.selling_price) {
            dispatch(_editBundle(newRowData.id, newRowData, toast, t));
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

    if (
        selectedProvider &&
        selectedProvider.code === 'manshorpay' &&
        (!selectedManshorPayService || !selectedProviderBundle)
    ) {
        toast.current?.show({
            severity: 'warn',
            summary: t('VALIDATION_WARNING'),
            detail: 'Please select a ManshorPay service and product before saving.',
            life: 3000
        });
        return;
    }

    if (selectedProvider?.code === 'inax' && !selectedProviderBundle) {
        toast.current?.show({ severity: 'warn', summary: t('VALIDATION_WARNING'), detail: 'Please select an INAX product before saving.', life: 3000 });
        return;
    }

    // For mzr provider
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
                description: selectedProviderBundle.description,
                operator: selectedProviderBundle.operator,
                internet_type: selectedProviderBundle.internet_type,
                sim_type: selectedProviderBundle.sim_type,
                table_id: selectedProviderBundle.table_id,
                name: selectedProviderBundle.name,
                days: selectedProviderBundle.days,
                volume: selectedProviderBundle.volume,
                unit: selectedProviderBundle.unit,
                periodicity: selectedProviderBundle.periodicity
            }
        };

        console.log('Provider Data (MZR):', providerData);

        if (bundle.id && bundle.id !== 0) {
            if (selectedProvider) {
                bundle.api_provider_id = selectedProvider.id;
            }
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
            if (selectedProvider) {
                bundle.api_provider_id = selectedProvider.id;
            }
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
    // For paystore with products
    else if (selectedProvider && selectedProvider.code === 'paystore' && selectedProviderBundle) {
        // Get the product data from the selected bundle
        const product = selectedProviderBundle as any;

        // Extract data from product
        const productId = product.id || product.product_id || product.ProductId;
        const operator = product.operator || product.Operator || '';
        const operatorRaw = product.operator_raw || product.Operator || '';
        const opFirm = selectedPaystoreGroup?.op_firm || product.op_firm || product.OpFirm || selectedOpFirmFromRedux || '';
        const opFirmRaw = opFirm;
        const type = product.type || product.Type || '';
        const amount = product.amount || product.Amount || '';
        const packageName = product.title || product.name || product.package_name || product.PackageName || '';
        const price = product.price || product.Price || '';
        const recomPrice = product.recommended_price || product.RecomPrice || '';

        // Extract packet privacy data
        const packetPrivacy = product.packet_privacy || product.PacketPrivacy || product.raw?.PacketPrivacy || {};
        const usableDays = packetPrivacy.UsableDays || product.validity_days || 0;
        const minAbroad = packetPrivacy.MinAbroad || '0.00';
        const minAllDirection = packetPrivacy.MinAllDirection || '0.00';
        const minInNetwork = packetPrivacy.MinInNetwork || '0.00';
        const sms = packetPrivacy.Sms || '0.00';
        const internetMb = packetPrivacy.InternetMb || '0';
        const isSocial = packetPrivacy.isSocial || 0;
        const officialSalePrice = packetPrivacy.officialSalePrice || '0.00';

        const providerData = {
            api_provider_id: selectedProvider.id,
            api_provider_bundle_id: String(productId),
            api_binding: {
                product_id: productId,
                operator: operator,
                operator_raw: operatorRaw,
                op_firm: opFirm,
                op_firm_raw: opFirmRaw,
                type: type,
                amount: amount,
                package_name: packageName,
                price: String(price),
                recom_price: String(recomPrice),
                packet_privacy: {
                    UsableDays: usableDays,
                    MinAbroad: minAbroad,
                    MinAllDirection: minAllDirection,
                    MinInNetwork: minInNetwork,
                    Sms: sms,
                    InternetMb: String(internetMb),
                    isSocial: isSocial,
                    officialSalePrice: officialSalePrice
                }
            }
        };

        console.log('Provider Data (Paystore Product):', providerData);

        if (bundle.id && bundle.id !== 0) {
            if (selectedProvider) {
                bundle.api_provider_id = selectedProvider.id;
            }
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
            if (selectedProvider) {
                bundle.api_provider_id = selectedProvider.id;
            }
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
    // For ManshorPay provider
    else if (
        selectedProvider &&
        selectedProvider.code === 'manshorpay' &&
        selectedManshorPayService &&
        selectedProviderBundle
    ) {
        const product: any = selectedProviderBundle;

        const productId =
            product.id ||
            product.provider_table_id ||
            product.api_binding?.bundle_id;

        const existingApiBinding =
            product.api_binding && typeof product.api_binding === 'object'
                ? product.api_binding
                : {};

        const operatorValue =
            typeof product.operator === 'object'
                ? product.operator?.name
                : product.operator;

        const categoryValue =
            typeof product.category === 'object'
                ? product.category?.name
                : product.category;

        const title =
            product.title ||
            product.name ||
            existingApiBinding.title ||
            existingApiBinding.name ||
            '';

        const providerData = {
            api_provider_id: selectedProvider.id,
            api_provider_bundle_id: String(productId),
            api_binding: {
                ...existingApiBinding,
                provider: 'manshorpay',
                service_id: selectedManshorPayService.id,
                service_name: getManshorPayServiceLabel(selectedManshorPayService),
                bundle_id: String(productId),
                product_id: String(productId),
                name: title,
                title: title,
                operator: operatorValue || existingApiBinding.operator || '',
                category: categoryValue || existingApiBinding.category || '',
                type: product.type || existingApiBinding.type || '',
                validity: product.validity || existingApiBinding.validity || '',
                provider_price:
                    product.price ??
                    existingApiBinding.provider_price ??
                    null,
                provider_currency:
                    product.currency ||
                    existingApiBinding.provider_currency ||
                    null
            }
        };

        console.log('Provider Data (ManshorPay):', providerData);

        if (bundle.id && bundle.id !== 0) {
            bundle.api_provider_id = selectedProvider.id;

            dispatch(_editBundle(bundle.id, bundle, toast, t))
                .then((newBundle) => {
                    if (newBundle) {
                        dispatch(_setProvider(newBundle.id, providerData, toast, t));
                    }
                })
                .catch((err) => {
                    console.error('Edit ManshorPay bundle failed:', err);
                });
        } else {
            bundle.api_provider_id = selectedProvider.id;

            dispatch(_addBundle(bundle, toast, t))
                .then((newBundle) => {
                    if (newBundle) {
                        dispatch(_setProvider(newBundle.id, providerData, toast, t));
                    }
                })
                .catch((err) => {
                    console.error('Add ManshorPay bundle failed:', err);
                });
        }
    }
    // INAX: retain both product ID and unique provider table ID.
    else if (selectedProvider?.code === 'inax' && selectedProviderBundle) {
        const product: any = selectedProviderBundle;
        const providerData = {
            api_provider_id: selectedProvider.id,
            api_provider_bundle_id: String(product.id),
            api_binding: {
                product_id: product.id,
                table_id: product.table_id || product.provider_table_id,
                provider_table_id: product.table_id || product.provider_table_id,
                category: product.category,
                name: product.name || product.title,
                title: product.title || product.name,
                operator: product.operator || product.meta?.operator,
                sim_type: product.sim_type || product.meta?.sim_type,
                internet_type: product.internet_type || product.meta?.internet_type,
                validity: product.validity,
                days: product.meta?.days ?? product.days,
                volume: product.meta?.volume ?? product.volume,
                unit: product.meta?.unit ?? product.unit,
                type_label: product.meta?.type_label,
                price: product.price,
                tprice: product.tprice,
                currency: product.currency,
                amount_rial: product.meta?.amount_rial,
                gross_price_rial: product.meta?.gross_price_rial
            }
        };
        const saveBinding = (newBundle: any) => {
            if (newBundle?.id) dispatch(_setProvider(newBundle.id, providerData, toast, t));
        };
        bundle.api_provider_id = selectedProvider.id;
        if (bundle.id && bundle.id !== 0) {
            dispatch(_editBundle(bundle.id, bundle, toast, t)).then(saveBinding);
        } else {
            dispatch(_addBundle(bundle, toast, t)).then(saveBinding);
        }
    }
    // For non-mzr, non-paystore, non-manshorpay providers (regular bundles)
    else if (
        selectedProvider &&
        selectedProviderBundle &&
        selectedProvider.code !== 'mzr' &&
        selectedProvider.code !== 'paystore' &&
        selectedProvider.code !== 'manshorpay'
    ) {
        const providerData = {
            api_provider_id: selectedProvider.id,
            api_provider_bundle_id: selectedProviderBundle.id,
            api_binding: {
                product_type: selectedProviderBundle.product_type,
                operator: selectedProviderBundle.operator,
                internet_type: selectedProviderBundle.internet_type,
                sim_type: selectedProviderBundle.sim_type,
                product_id: selectedProviderBundle.id,
                table_id: selectedProvider.code === 'zoodpay'
                    ? (selectedProviderBundle.ussd_plan_code || selectedProviderBundle.id)
                    : selectedProviderBundle.table_id,
                name: selectedProviderBundle.name,
                ...(selectedProvider.code === 'zoodpay' ? {
                    ussd_plan_code: selectedProviderBundle.ussd_plan_code || selectedProviderBundle.id,
                    plan_name: selectedProviderBundle.name || selectedProviderBundle.title,
                    plan_amount: selectedProviderBundle.price,
                    currency: selectedProviderBundle.currency,
                    mno: selectedProviderBundle.operator,
                    bundle_id: selectedProviderBundle.bundle_id,
                } : {}),
                days: selectedProviderBundle.days,
                volume: selectedProviderBundle.volume,
                unit: selectedProviderBundle.unit,
                periodicity: selectedProviderBundle.periodicity
            }
        };

        console.log('Provider Data (Regular):', providerData);

        if (bundle.id && bundle.id !== 0) {
            if (selectedProvider) {
                bundle.api_provider_id = selectedProvider.id;
            }
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
            if (selectedProvider) {
                bundle.api_provider_id = selectedProvider.id;
            }
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
        if (selectedProvider) {
            bundle.api_provider_id = selectedProvider.id;
        }
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
        console.log('Editing bundle:', bundle);

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
                    setSelectedCategory({ id: parsedApiBinding.category_id, name: parsedApiBinding.category_name } as Category);
                    setSelectedProviderBundle({ id: parsedApiBinding.product_id, name: parsedApiBinding.product_name, price: parsedApiBinding.price } as RawInternet);
                }
                // Check if provider is paystore with products
                else if (provider.code === 'paystore' && (parsedApiBinding.product_type === 'product' || parsedApiBinding.type)) {
                    // Find the product in the products list
                    const product = products.find((p: any) =>
                        String(p.id) === String(parsedApiBinding.product_id) ||
                        String(p.product_id) === String(parsedApiBinding.product_id)
                    );
                    if (product) {
                        setSelectedProviderBundle(product);
                    } else {
                        setSelectedProviderBundle(parsedApiBinding);
                    }
                    // Set the op_firm if available
                    if (parsedApiBinding.op_firm) {
                        const group = operatorGroups.find((g: PaystoreGroup) => g.op_firm === parsedApiBinding.op_firm);
                        if (group) {
                            setSelectedPaystoreGroup(group);
                        }
                    }
                }
                else if (provider.code === 'manshorpay') {
                    setSelectedCapability('');

                    if (parsedApiBinding.service_id) {
                        setSelectedManshorPayService({
                            id: Number(parsedApiBinding.service_id),
                            name:
                                parsedApiBinding.service_name ||
                                `Service #${parsedApiBinding.service_id}`,
                            operator: parsedApiBinding.operator,
                            category: parsedApiBinding.category
                        });
                    }

                    const manshorBundleId =
                        parsedApiBinding.bundle_id ||
                        parsedApiBinding.product_id ||
                        bundle.api_provider_bundle_id;

                    setSelectedProviderBundle({
                        id: manshorBundleId,
                        provider_table_id: String(manshorBundleId || ''),
                        title:
                            parsedApiBinding.title ||
                            parsedApiBinding.name ||
                            '',
                        name:
                            parsedApiBinding.title ||
                            parsedApiBinding.name ||
                            '',
                        operator: parsedApiBinding.operator || '',
                        category: parsedApiBinding.category || '',
                        type:
                            parsedApiBinding.type ||
                            parsedApiBinding.product_type ||
                            '',
                        validity:
                            parsedApiBinding.validity ||
                            parsedApiBinding.periodicity ||
                            '',
                        price:
                            parsedApiBinding.provider_price ??
                            parsedApiBinding.price ??
                            null,
                        currency:
                            parsedApiBinding.provider_currency ||
                            '',
                        api_binding: parsedApiBinding
                    } as any);
                }
                else if (provider.code === 'inax') {
                    setSelectedInaxCategory(parsedApiBinding.category || null);
                    setSelectedInaxOperator(parsedApiBinding.operator || null);
                    setSelectedInaxSimType(parsedApiBinding.sim_type || null);
                    setSelectedProviderBundle({
                        ...parsedApiBinding,
                        id: parsedApiBinding.product_id || bundle.api_provider_bundle_id,
                        table_id: parsedApiBinding.table_id || parsedApiBinding.provider_table_id,
                        title: parsedApiBinding.title || parsedApiBinding.name
                    } as any);
                }
                else if (provider.code === 'zoodpay') {
                    setSelectedCapability('bundles');
                    setSelectedProviderBundle({
                        ...parsedApiBinding,
                        id: parsedApiBinding.ussd_plan_code || parsedApiBinding.product_id || bundle.api_provider_bundle_id,
                        name: parsedApiBinding.plan_name || parsedApiBinding.name,
                        title: parsedApiBinding.plan_name || parsedApiBinding.name,
                        price: parsedApiBinding.plan_amount ?? parsedApiBinding.price,
                        operator: parsedApiBinding.mno || parsedApiBinding.operator,
                        currency: parsedApiBinding.currency,
                        ussd_plan_code: parsedApiBinding.ussd_plan_code || bundle.api_provider_bundle_id,
                        table_id: parsedApiBinding.ussd_plan_code || parsedApiBinding.product_id || bundle.api_provider_bundle_id,
                    } as any);
                }
                else if (
                    provider.code !== 'mzr' &&
                    provider.code !== 'paystore' &&
                    provider.code !== 'manshorpay'
                ) {
                    // For non-mzr, non-paystore, non-manshorpay providers
                    const capability = provider.capabilities?.find((cap: any) =>
                        cap.toLowerCase().includes(parsedApiBinding.internet_type) ||
                        cap.toLowerCase().includes(parsedApiBinding.sim_type)
                    ) || provider.capabilities?.[0];

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

    const handleSubmitFilter = (nextFilters: {
        filter_status: number | null;
        filter_service_category_type: string | null;
        filter_company_id: number | null;
        filter_service_id: number | null;
    }) => {
        const cleaned = Object.fromEntries(
            Object.entries(nextFilters).filter(([_, value]) => value !== null && value !== '')
        );
        setActiveFilters(cleaned);
    };

    const filterChips = useMemo(() => {
        const list: { key: string; label: string }[] = [];
        if (filters.filter_service_category_type) {
            list.push({
                key: 'filter_service_category_type',
                label: `${t('ORDER.FILTER.BUNDLE_TYPE')}: ${filters.filter_service_category_type}`
            });
        }
        if (filters.filter_company_id) {
            const company = companies.find((c: { id: number }) => c.id === filters.filter_company_id);
            list.push({
                key: 'filter_company_id',
                label: `${t('ORDER.FILTER.COMPANY')}: ${company?.company_name || filters.filter_company_id}`
            });
        }
        if (filters.filter_service_id) {
            const service = services.find((s: Service) => s.id === filters.filter_service_id);
            list.push({
                key: 'filter_service_id',
                label: `${t('ORDER.FILTER.SERVICE')}: ${service?.company?.company_name || filters.filter_service_id}`
            });
        }
        return list;
    }, [filters, companies, services, t]);

    const applyFilters = () => {
        handleSubmitFilter(filters);
        setFilterOpen(false);
    };

    const clearAllFilters = () => {
        const empty = {
            filter_status: null,
            filter_service_category_type: null,
            filter_company_id: null,
            filter_service_id: null
        };
        setFilters(empty);
        setActiveFilters({});
        setFilterOpen(false);
    };

    const removeFilterChip = (key: string) => {
        const next = { ...filters, [key]: null };
        setFilters(next);
        handleSubmitFilter(next);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchBundleList(pagination?.page || 1, searchTag, activeFilters) as any);
        setRefreshing(false);
    };

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

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
            setSelectedPaystoreGroup(null);
            setSelectedPaystoreOperator(null);
            setManshorPayServices([]);
            setSelectedManshorPayService(null);
            setManshorPayProducts([]);
        }
    };

    const bundleRowActions = (rowData: Bundle) => [
        {
            label: t('TABLE.GENERAL.EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editService(rowData)
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteService(rowData),
            danger: true,
            separatorBefore: true
        }
    ];

    // This flag indicates HOW the bundle was created, not which supplier it is bound to.
    // Admin-created bundles can also have an API provider, so api_provider_id alone
    // must not be used to classify packages created by a number-specific inquiry.
    const isAutoInquiryBundle = (rowData: Bundle): boolean => {
        const flag = (rowData as Bundle & { is_auto_imported?: boolean | number | string }).is_auto_imported;
        return flag === true || flag === 1 || flag === '1' || flag === 'true';
    };

    const bundleSourceText: Record<string, { inquiry: string; regular: string; pageOnly: string; empty: string }> = {
        en: { inquiry: 'Inquiry-created', regular: 'Regular / Admin-created', pageOnly: 'Filter applies to this page only', empty: 'No matching bundles on this page' },
        ar: { inquiry: 'أُنشئت بالاستعلام', regular: 'عادية / أنشأها المشرف', pageOnly: 'التصفية للصفحة الحالية فقط', empty: 'لا توجد باقات مطابقة في هذه الصفحة' },
        bn: { inquiry: 'ইনকোয়ারি থেকে তৈরি', regular: 'সাধারণ / অ্যাডমিন তৈরি', pageOnly: 'ফিল্টার শুধু বর্তমান পৃষ্ঠায় প্রযোজ্য', empty: 'এই পৃষ্ঠায় কোনো প্যাকেজ মেলেনি' },
        fa: { inquiry: 'ایجادشده از استعلام', regular: 'عادی / ایجادشده توسط ادمین', pageOnly: 'فیلتر فقط روی همین صفحه اعمال می‌شود', empty: 'در این صفحه بسته‌ای مطابق فیلتر یافت نشد' },
        ps: { inquiry: 'د استعلام له لارې جوړ شوی', regular: 'عادي / د اډمین لخوا جوړ شوی', pageOnly: 'فلټر یوازې په همدې پاڼه پلي کېږي', empty: 'په دې پاڼه کې ورته بسته ونه موندل شوه' },
        tr: { inquiry: 'Sorgudan oluşturulan', regular: 'Normal / Yönetici tarafından oluşturulan', pageOnly: 'Filtre yalnızca bu sayfaya uygulanır', empty: 'Bu sayfada eşleşen paket yok' }
    };
    const sourceText = bundleSourceText[i18n.language.split('-')[0]] || bundleSourceText.en;
    const displayedBundles: Bundle[] = (Array.isArray(bundles) ? bundles : []).filter((item: Bundle) => {
        if (bundleSourceFilter === 'all') return true;
        return isAutoInquiryBundle(item) === (bundleSourceFilter === 'inquiry');
    });

    const bundleTitleBodyTemplate = (rowData: Bundle) => {
        return (
            <>
                <span className="p-column-title">Bundle Title</span>
                <div className="flex flex-column gap-1 align-items-start">
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle_title}</span>
                    {isAutoInquiryBundle(rowData) && (
                        <span className="bundle-inquiry-label">
                            <i className="pi pi-sync" aria-hidden="true" />
                            {sourceText.inquiry}
                        </span>
                    )}
                </div>
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
        let bindingName = '';
        let providerBundleId: string | number | null =
            rowData.api_provider_bundle_id || null;

        try {
            let parsed: ApiBinding | null = null;

            if (typeof rowData.api_binding === 'string') {
                parsed = JSON.parse(rowData.api_binding) as ApiBinding;
            } else {
                parsed = rowData.api_binding as ApiBinding;
            }

            bindingName =
                parsed?.title ||
                parsed?.name ||
                parsed?.product_name ||
                parsed?.package_name ||
                '';

            if (!providerBundleId) {
                providerBundleId =
                    parsed?.bundle_id ||
                    parsed?.product_id ||
                    null;
            }
        } catch (e) {
            console.error('Invalid api_binding:', e);
        }

        if (!rowData.api_provider_id) {
            return (
                <>
                    <span className="p-column-title">Provider</span>
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>
                        N/A
                    </span>
                </>
            );
        }

        return (
            <>
                <span className="p-column-title">Provider</span>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                    }}
                >
                    <span
                        style={{
                            fontSize: '0.8rem',
                            color: '#444',
                            fontWeight: 600
                        }}
                    >
                        {bindingName || 'Bound'}
                    </span>

                    {providerBundleId && (
                        <span
                            style={{
                                fontSize: '0.7rem',
                                color: '#888'
                            }}
                        >
                            #{providerBundleId}
                        </span>
                    )}
                </div>
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

    const actionBodyTemplate = (rowData: Bundle) => <RowActions items={bundleRowActions(rowData)} />;

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

    const onPageChange = (page: number) => {
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

    // Check if provider is paystore
    const isPaystore = selectedProvider?.code === 'paystore';

    return (
        <div className="space-y-4">
            <style>{`
                /* Visual origin indicator: does not change bundle data or behavior. */
                .bundle-source-table .p-datatable-tbody > tr.bundle-auto-inquiry-row > td {
                    background-color: #edf7ff !important;
                }
                .bundle-source-table .p-datatable-tbody > tr.bundle-auto-inquiry-row:hover > td {
                    background-color: #e3f1ff !important;
                }
                .bundle-source-table .p-datatable-tbody > tr.bundle-auto-inquiry-row.p-highlight > td {
                    background-color: #d6e9ff !important;
                }
                .bundle-inquiry-label {
                    display: inline-flex;
                    gap: 5px;
                    align-items: center;
                    align-self: flex-start;
                    color: #1d4ed8;
                    background-color: #dbeafe;
                    border: 1px solid #bfdbfe;
                    border-radius: 999px;
                    padding: 2px 7px;
                    font-size: 0.67rem;
                    font-weight: 600;
                    line-height: 1.35;
                }
                .bundle-inquiry-label .pi {
                    font-size: 0.65rem;
                }
                /* ManshorPay dropdown overlay fixes, especially for RTL languages */
                .manshorpay-dropdown-panel {
                    max-width: calc(100vw - 24px) !important;
                    border-radius: 10px !important;
                    overflow: hidden !important;
                }

                .manshorpay-dropdown-panel .p-dropdown-items-wrapper {
                    max-height: 320px !important;
                }

                .manshorpay-dropdown-panel .p-dropdown-item {
                    white-space: normal !important;
                    overflow: visible !important;
                    line-height: 1.35 !important;
                }

                .manshorpay-dropdown-panel-rtl {
                    direction: rtl !important;
                    text-align: right !important;
                }

                .manshorpay-dropdown-panel-rtl .p-dropdown-header {
                    direction: rtl !important;
                    padding: 0.75rem !important;
                }

                .manshorpay-dropdown-panel-rtl .p-dropdown-filter-container {
                    width: 100% !important;
                    position: relative !important;
                    direction: ltr !important;
                }

                .manshorpay-dropdown-panel-rtl .p-dropdown-filter {
                    width: 100% !important;
                    box-sizing: border-box !important;
                    direction: rtl !important;
                    text-align: right !important;
                    padding-right: 2.75rem !important;
                    padding-left: 2.75rem !important;
                }

                /* Search icon goes to the left in RTL so it never overlaps typed text */
                .manshorpay-dropdown-panel-rtl .p-dropdown-filter-icon {
                    left: 0.9rem !important;
                    right: auto !important;
                    margin-top: -0.5rem !important;
                }

                /* Clear icon stays on the right with its own reserved space */
                .manshorpay-dropdown-panel-rtl .p-dropdown-filter-clear-icon,
                .manshorpay-dropdown-panel-rtl .p-dropdown-clear-icon {
                    right: 0.9rem !important;
                    left: auto !important;
                }

                .manshorpay-dropdown-panel-rtl .p-dropdown-items {
                    direction: rtl !important;
                    text-align: right !important;
                }

                @media (max-width: 768px) {
                    .manshorpay-dropdown-panel {
                        width: calc(100vw - 24px) !important;
                        max-width: calc(100vw - 24px) !important;
                    }

                    .manshorpay-dropdown-panel .p-dropdown-item {
                        padding: 0.7rem !important;
                    }
                }
            `}</style>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.BUNDLE', { defaultValue: 'بسته‌ها' })}
                description="مدیریت بسته‌ها، قیمت و اتصال به تأمین‌کننده"
                loading={loading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <UiButton variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </UiButton>
                        <UiButton size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('BUNDLE.TABLE.CREATEBUNDLE')}
                        </UiButton>
                        <ManageTranslationsButton type="bundle" />
                    </div>
                }
                toolbar={
                    <div className="space-y-3">
                        <FilterBar
                            search={searchInput}
                            onSearchChange={setSearchInput}
                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در بسته‌ها...' })}
                            chips={filterChips}
                            onRemoveChip={removeFilterChip}
                            onClearAll={clearAllFilters}
                            onOpenFilters={() => setFilterOpen(true)}
                        />
                        <div className="flex flex-wrap items-center gap-3 text-sm text-start">
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5" title={sourceText.pageOnly}>
                                <input
                                    type="checkbox"
                                    checked={bundleSourceFilter === 'inquiry'}
                                    onChange={(e) => setBundleSourceFilter(e.target.checked ? 'inquiry' : 'all')}
                                    className="h-4 w-4 cursor-pointer accent-blue-600"
                                />
                                {sourceText.inquiry}
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5" title={sourceText.pageOnly}>
                                <input
                                    type="checkbox"
                                    checked={bundleSourceFilter === 'regular'}
                                    onChange={(e) => setBundleSourceFilter(e.target.checked ? 'regular' : 'all')}
                                    className="h-4 w-4 cursor-pointer accent-slate-600"
                                />
                                {sourceText.regular}
                            </label>
                            <span className="text-xs text-muted-foreground">{sourceText.pageOnly}</span>
                        </div>
                    </div>
                }
                footer={
                    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                            صفحه {pagination?.page || 1} از {totalPages} · مجموع {pagination?.total || 0}
                        </div>
                        <div className="flex items-center gap-2">
                            <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) <= 1} onClick={() => onPageChange((pagination?.page || 1) - 1)}>
                                قبلی
                            </UiButton>
                            <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) >= totalPages} onClick={() => onPageChange((pagination?.page || 1) + 1)}>
                                بعدی
                            </UiButton>
                        </div>
                    </div>
                }
            >
                    <DataTable
                        ref={dt}
                        value={displayedBundles}
                        selection={selectedBundles}
                        onSelectionChange={(e) => setSelectedBundles(e.value as any)}
                        dataKey="id"
                        className="datatable-responsive bundle-source-table"
                        rowClassName={(rowData: Bundle) => ({ 'bundle-auto-inquiry-row': isAutoInquiryBundle(rowData) })}
                        globalFilter={globalFilter}
                        emptyMessage={bundleSourceFilter === 'all' ? t('DATA_TABLE.TABLE.NO_DATA') : sourceText.empty}
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
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '4.5rem' }}
                        />
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
            </ListPage>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t('FILTER', { defaultValue: 'فیلتر بسته‌ها' })}</SheetTitle>
                        <SheetDescription>{t('PAYMENT.FILTER.HINT', { defaultValue: 'فیلترها روی نتایج سرور اعمال می‌شوند.' })}</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <FilterField label={t('ORDER.FILTER.BUNDLE_TYPE')}>
                            <Select
                                value={filters.filter_service_category_type ?? undefined}
                                onValueChange={(v) => setFilters((p) => ({ ...p, filter_service_category_type: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ORDER.FILTER.SELECT_TYPE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="social">{t('ORDER.FILTER.SOCIAL')}</SelectItem>
                                    <SelectItem value="nonsocial">{t('ORDER.FILTER.NONSOCIAL')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <FilterField label={t('ORDER.FILTER.COMPANY')}>
                            <Select
                                value={filters.filter_company_id ? String(filters.filter_company_id) : undefined}
                                onValueChange={(v) => setFilters((p) => ({ ...p, filter_company_id: Number(v) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ORDER.FILTER.SELECT_COMPANY')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(companies || []).map((c: { id: number; company_name: string }) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <FilterField label={t('ORDER.FILTER.SERVICE')}>
                            <Select
                                value={filters.filter_service_id ? String(filters.filter_service_id) : undefined}
                                onValueChange={(v) => setFilters((p) => ({ ...p, filter_service_id: Number(v) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ORDER.FILTER.SELECT_SERVICE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(services || []).map((s: Service) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.service_category?.category_name} — {s.company?.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <div className="flex gap-2 pt-2">
                            <UiButton type="button" variant="outline" className="flex-1" onClick={clearAllFilters}>
                                {t('RESET', { defaultValue: 'بازنشانی' })}
                            </UiButton>
                            <UiButton type="button" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={applyFilters}>
                                {t('APPLY', { defaultValue: 'اعمال' })}
                            </UiButton>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <FormSheet
                open={serviceDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('BUNDLE.DETAILS')}
                description={bundle.id ? 'ویرایش باندل' : 'ثبت باندل جدید'}
                size="full"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveService}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title="اطلاعات پایه" description="عنوان و توضیحات باندل">
                    <FormField
                        label={t('BUNDLE.FORM.INPUT.BUNDLETITLE')}
                        required
                        error={submitted && !bundle.bundle_title ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
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
                    </FormField>
                    <FormField
                        label={t('BUNDLE.FORM.INPUT.BUNDLEDESCRIPTION')}
                        required
                        error={submitted && !bundle.bundle_description ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
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
                    </FormField>
                </FormSection>

                <FormSection title="قیمت‌گذاری" description="قیمت خرید و فروش">
                    <FormField
                        label={t('BUNDLE.FORM.INPUT.ADMINBUYINGPRICE')}
                        required
                        error={submitted && !bundle.admin_buying_price ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
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
                    </FormField>
                    <FormField
                        label={t('BUNDLE.FORM.INPUT.BUYINGPRICE')}
                        required
                        error={submitted && !bundle.buying_price ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
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
                    </FormField>
                    <FormField
                        label={t('BUNDLE.FORM.INPUT.SELLINGPRICE')}
                        required
                        error={submitted && !bundle.selling_price ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
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
                    </FormField>
                </FormSection>

                <FormSection title="نوع و اعتبار" description="مدت اعتبار و نوع باندل">
                    <FormField
                        label={t('BUNDLE.FORM.INPUT.VALIDITYTYPE')}
                        required
                        error={submitted && !bundle.validity_type ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Select
                            value={bundle.validity_type || undefined}
                            onValueChange={(v) =>
                                setBundle((prev) => ({
                                    ...prev,
                                    validity_type: v
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('BUNDLE.FORM.PLACEHOLDER.VALIDITYTYPE')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="nightly">Nightly</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField
                        label={t('ORDER.FILTER.BUNDLE_TYPE')}
                        required
                        error={submitted && !bundle.bundle_type ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Select
                            value={bundle.bundle_type || undefined}
                            onValueChange={(v) => setBundle({ ...bundle, bundle_type: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('ORDER.FILTER.SELECT_TYPE')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credit">{t('BUNDLE.FORM.INPUT.SELECT.BUNDLETYPE.OPTION.CREDIT')}</SelectItem>
                                <SelectItem value="package">{t('BUNDLE.FORM.INPUT.SELECT.BUNDLETYPE.OPTION.PACKAGE')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('BUNDLE.FORM.INPUT.AMOUNT')}>
                        <Input
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
                    </FormField>
                </FormSection>

                <FormSection title="خدمت و ارز">
                    <FormField
                        label={t('BUNDLE.FORM.INPUT.SERVICENAME')}
                        required
                        error={submitted && !bundle.service_id ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={services.find((s: Service) => s.id === bundle.service_id) || bundle.service || null}
                            options={services}
                            onChange={(selected) => {
                                setBundle((prev) => ({
                                    ...prev,
                                    service_id: selected?.id,
                                    service: selected
                                }));
                            }}
                            optionLabel="company_name"
                            placeholder={t('BUNDLE.FORM.PLACEHOLDER.SERVICENAME')}
                            error={submitted && !bundle.service_id}
                            returnFullObject
                            itemTemplate={(option) => (
                                <div className="flex items-center gap-2">
                                    <div>{option.service_category?.category_name}</div>
                                    <div>- {option.company?.company_name}</div>
                                </div>
                            )}
                            valueTemplate={(option) => (
                                <div className="flex items-center gap-2 text-sm">
                                    <span>{option.service_category?.category_name}</span>
                                    <span className="text-muted-foreground">- {option.company?.company_name}</span>
                                </div>
                            )}
                        />
                    </FormField>
                    <FormField
                        label={t('BUNDLE.FORM.INPUT.CURRENCY')}
                        required
                        error={submitted && !bundle.currency ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={bundle.currency}
                            options={currencies || []}
                            onChange={(selected) =>
                                setBundle((prev) => ({
                                    ...prev,
                                    currency: selected
                                }))
                            }
                            optionLabel="name"
                            placeholder={t('CURRENCY.GENERAL.SELECTCURRENCY')}
                            error={submitted && !bundle.currency}
                            returnFullObject
                        />
                    </FormField>
                </FormSection>

                <FormSection title="اتصال تأمین‌کننده API" description="انتخاب provider و محصول">
                    <FormField label={t('BUNDLE_PROVIDER')} fullWidth>
                        <SearchSelect
                            value={selectedProvider}
                            options={providers || []}
                            onChange={(selected) => {
                                setSelectedProvider(selected);
                                setSelectedCapability('');
                                setSelectedProviderBundle(null);
                                setSelectedPaystoreGroup(null);
                                setSelectedPaystoreOperator(null);
                                setSelectedManshorPayService(null);
                                setManshorPayProducts([]);
                                setInaxResponseProducts([]);
                                setSelectedInaxCategory(null);
                                setSelectedInaxOperator(null);
                                setSelectedInaxSimType(null);
                            }}
                            optionLabel="name"
                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                            placeholder={t('SEARCH_PROVIDER')}
                            onSearch={setProviderSearchTag}
                            returnFullObject
                            showClear
                        />
                    </FormField>

                    <div className="sm:col-span-2 w-full space-y-4">
                            {/* Capabilities - Only show for regular providers */}
                            {selectedProvider &&
                                selectedProvider.code !== 'mzr' &&
                                selectedProvider.code !== 'paystore' &&
                                selectedProvider.code !== 'manshorpay' &&
                                selectedProvider.code !== 'inax' &&
                                selectedProvider.code !== 'zoodpay' && (
                                <div className="grid formgrid p-fluid">
                                    <div className="field col-12">
                                        <label htmlFor="capabilities" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                            {t('CAPABILITIES')}
                                        </label>
                                        <Select
                                            value={selectedCapability || undefined}
                                            onValueChange={(v) => {
                                                setSelectedCapability(v);
                                                setSelectedProviderBundle(null);
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={t('SEARCH_CAPABILITIES')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(selectedProvider?.capabilities || []).map((cap: string) => (
                                                    <SelectItem key={cap} value={cap}>
                                                        {cap}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* MZR Provider Section */}
                            {selectedProvider && selectedProvider.code === 'mzr' && (
                                <>
                                    <div className="grid formgrid p-fluid">
                                        <div className="field col-12">
                                            <label htmlFor="category" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                {t('CATEGORIES')}
                                            </label>
                                            <SearchSelect
                                                value={selectedCategory}
                                                options={categories || []}
                                                onChange={(selected) => {
                                                    setSelectedCategory(selected);
                                                    setSelectedProviderBundle(null);
                                                }}
                                                optionLabel="name"
                                                searchPlaceholder={t('SEARCH_CATEGORY')}
                                                placeholder={t('SELECT_CATEGORY')}
                                                returnFullObject
                                                showClear
                                                itemTemplate={(option) => (
                                                    <div className="flex flex-col gap-1">
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
                                                <SearchSelect
                                                    value={selectedProviderBundle}
                                                    options={categoryProducts || []}
                                                    onChange={(selected) => setSelectedProviderBundle(selected)}
                                                    optionLabel="name"
                                                    searchPlaceholder={t('SEARCH_PRODUCT')}
                                                    placeholder={t('SELECT_PRODUCT')}
                                                    returnFullObject
                                                    showClear
                                                    itemTemplate={(option) => (
                                                        <div className="flex flex-col gap-2">
                                                            <div className="font-semibold text-sm">{option.name}</div>
                                                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Price: {option.price}</span>
                                                                {option.stock !== undefined && (
                                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Stock: {option.stock}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    valueTemplate={(option) => (
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">{option.name}</span>
                                                            <span className="text-xs text-gray-600">Price: {option.price}</span>
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* MANSHOR PAY SECTION */}
                            {selectedProvider && selectedProvider.code === 'manshorpay' && (
                                <div
                                    className="grid formgrid p-fluid"
                                    style={{
                                        margin: '0 0 1rem 0',
                                        padding: '18px',
                                        borderRadius: '14px',
                                        border: '1px solid #dbeafe',
                                        background: 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)'
                                    }}
                                >
                                    <div className="col-12 mb-3">
                                        <div
                                            className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-2"
                                            style={{
                                                borderBottom: '1px solid #dbeafe',
                                                paddingBottom: '12px'
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: '1.05rem',
                                                        fontWeight: 700,
                                                        color: '#1e3a8a'
                                                    }}
                                                >
                                                    ManshorPay API Binding
                                                </div>
                                                <div
                                                    style={{
                                                        marginTop: '4px',
                                                        fontSize: '0.8rem',
                                                        color: '#64748b'
                                                    }}
                                                >
                                                    Select the ManshorPay service first, then choose the provider product to bind with this local bundle.
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: '#475569',
                                                    background: '#ffffff',
                                                    border: '1px solid #dbeafe',
                                                    borderRadius: '999px',
                                                    padding: '6px 10px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Provider: <strong>ManshorPay</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label
                                            htmlFor="manshor_service"
                                            style={{
                                                fontWeight: 'bold',
                                                marginBottom: '8px',
                                                display: 'block'
                                            }}
                                        >
                                            ManshorPay Service <span className="text-red-500">*</span>
                                        </label>

                                        <SearchSelect
                                            value={selectedManshorPayService}
                                            options={manshorPayServices || []}
                                            optionLabel="_display_name"
                                            onChange={(selected) => {
                                                setSelectedManshorPayService(selected);
                                                setSelectedProviderBundle(null);
                                                setManshorPayProducts([]);
                                            }}
                                            disabled={manshorPayServicesLoading}
                                            isLoading={manshorPayServicesLoading}
                                            searchPlaceholder="Search service"
                                            placeholder="Select ManshorPay service"
                                            emptyMessage="No ManshorPay services found"
                                            returnFullObject
                                            showClear
                                            itemTemplate={(option: any) => (
                                                <div className="flex flex-column gap-1 p-2">
                                                    <div className="font-semibold">
                                                        {getManshorPayServiceLabel(option)}
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 text-xs">
                                                        {(option.bundles_count !== undefined || option.bundle_count !== undefined) && (
                                                            <span
                                                                style={{
                                                                    background: '#dbeafe',
                                                                    color: '#1d4ed8',
                                                                    borderRadius: '999px',
                                                                    padding: '3px 8px'
                                                                }}
                                                            >
                                                                {option.bundles_count ?? option.bundle_count} products
                                                            </span>
                                                        )}

                                                        {option.starting_price !== undefined && (
                                                            <span
                                                                style={{
                                                                    background: '#dcfce7',
                                                                    color: '#15803d',
                                                                    borderRadius: '999px',
                                                                    padding: '3px 8px'
                                                                }}
                                                            >
                                                                From {option.starting_price} {option.currency || ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            valueTemplate={(option: any) => (
                                                <div className="flex items-center gap-2">
                                                    <span>{getManshorPayServiceLabel(option)}</span>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className="field col-12 md:col-6">
                                        <label
                                            htmlFor="manshor_product"
                                            style={{
                                                fontWeight: 'bold',
                                                marginBottom: '8px',
                                                display: 'block'
                                            }}
                                        >
                                            ManshorPay Product <span className="text-red-500">*</span>
                                        </label>

                                        <SearchSelect
                                            value={selectedProviderBundle}
                                            options={manshorPayProducts || []}
                                            onChange={(selected) => {
                                                console.log('Selected ManshorPay product:', selected);
                                                setSelectedProviderBundle(selected);
                                            }}
                                            disabled={!selectedManshorPayService || manshorPayProductsLoading}
                                            isLoading={manshorPayProductsLoading}
                                            optionLabel="title"
                                            searchPlaceholder="Search product"
                                            placeholder={
                                                selectedManshorPayService ? 'Select ManshorPay product' : 'Select service first'
                                            }
                                            emptyMessage="No ManshorPay products found"
                                            returnFullObject
                                            showClear
                                            itemTemplate={(option: any) => (
                                                <div className="flex flex-column gap-2 p-2">
                                                    <div
                                                        className="flex justify-content-between align-items-start gap-2"
                                                    >
                                                        <div className="font-semibold">
                                                            {getManshorPayProductTitle(option)}
                                                        </div>

                                                        <span
                                                            style={{
                                                                fontSize: '0.72rem',
                                                                color: '#475569',
                                                                background: '#f1f5f9',
                                                                borderRadius: '999px',
                                                                padding: '3px 8px',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            #{option.id}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 text-xs">
                                                        {option.operator && (
                                                            <span
                                                                style={{
                                                                    background: '#dbeafe',
                                                                    color: '#1d4ed8',
                                                                    borderRadius: '999px',
                                                                    padding: '3px 8px'
                                                                }}
                                                            >
                                                                {typeof option.operator === 'object'
                                                                    ? option.operator?.name
                                                                    : option.operator}
                                                            </span>
                                                        )}

                                                        {option.category && (
                                                            <span
                                                                style={{
                                                                    background: '#ede9fe',
                                                                    color: '#6d28d9',
                                                                    borderRadius: '999px',
                                                                    padding: '3px 8px'
                                                                }}
                                                            >
                                                                {typeof option.category === 'object'
                                                                    ? option.category?.name
                                                                    : option.category}
                                                            </span>
                                                        )}

                                                        {option.validity && (
                                                            <span
                                                                style={{
                                                                    background: '#ffedd5',
                                                                    color: '#c2410c',
                                                                    borderRadius: '999px',
                                                                    padding: '3px 8px'
                                                                }}
                                                            >
                                                                {option.validity}
                                                            </span>
                                                        )}

                                                        {option.price !== undefined && option.price !== null && (
                                                            <span
                                                                style={{
                                                                    background: '#dcfce7',
                                                                    color: '#15803d',
                                                                    borderRadius: '999px',
                                                                    padding: '3px 8px'
                                                                }}
                                                            >
                                                                Provider: {option.price} {option.currency || ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            valueTemplate={(option: any) => (
                                                <div>
                                                    <div className="font-semibold">{getManshorPayProductTitle(option)}</div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            color: '#64748b'
                                                        }}
                                                    >
                                                        {typeof option.operator === 'object'
                                                            ? option.operator?.name
                                                            : option.operator || ''}
                                                        {option.price !== undefined && option.price !== null
                                                            ? ` • ${option.price} ${option.currency || ''}`
                                                            : ''}
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    {selectedProviderBundle && (
                                        <div className="field col-12 mb-0">
                                            <div
                                                style={{
                                                    border: '1px solid #bbf7d0',
                                                    background: '#f0fdf4',
                                                    borderRadius: '12px',
                                                    padding: '14px'
                                                }}
                                            >
                                                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
                                                    <div className="flex align-items-center gap-3">
                                                        <div
                                                            className="flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '38px',
                                                                height: '38px',
                                                                borderRadius: '50%',
                                                                background: '#22c55e',
                                                                color: '#ffffff',
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            <i className="pi pi-check" />
                                                        </div>

                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontSize: '0.72rem',
                                                                    color: '#15803d',
                                                                    fontWeight: 600,
                                                                    marginBottom: '2px'
                                                                }}
                                                            >
                                                                Selected provider product
                                                            </div>

                                                            <div style={{ fontWeight: 700 }}>
                                                                {getManshorPayProductTitle(selectedProviderBundle)}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    fontSize: '0.78rem',
                                                                    color: '#64748b',
                                                                    marginTop: '3px'
                                                                }}
                                                            >
                                                                {typeof (selectedProviderBundle as any).operator === 'object'
                                                                    ? (selectedProviderBundle as any).operator?.name
                                                                    : (selectedProviderBundle as any).operator || ''}
                                                                {(selectedProviderBundle as any).validity
                                                                    ? ` • ${(selectedProviderBundle as any).validity}`
                                                                    : ''}
                                                                {` • Product #${(selectedProviderBundle as any).id}`}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            minWidth: '190px',
                                                            background: '#ffffff',
                                                            border: '1px solid #dcfce7',
                                                            borderRadius: '10px',
                                                            padding: '10px 12px'
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: '0.72rem',
                                                                color: '#64748b'
                                                            }}
                                                        >
                                                            ManshorPay provider price
                                                        </div>

                                                        <div
                                                            style={{
                                                                fontSize: '1rem',
                                                                fontWeight: 700,
                                                                marginTop: '2px'
                                                            }}
                                                        >
                                                            {(selectedProviderBundle as any).price ?? '-'}{' '}
                                                            {(selectedProviderBundle as any).currency || ''}
                                                        </div>

                                                        <div
                                                            style={{
                                                                fontSize: '0.68rem',
                                                                color: '#94a3b8',
                                                                marginTop: '2px'
                                                            }}
                                                        >
                                                            Informational only — local Waslat prices stay unchanged.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                             {/* INAX - locally categorized from one provider response */}
                             {selectedProvider?.code === 'inax' && (
                                 <div className="grid formgrid p-fluid" style={{ margin: '0 0 1rem 0', padding: '18px', border: '1px solid #dbeafe', borderRadius: '14px', background: '#f8fbff' }}>
                                     <div className="col-12"><strong>INAX Product Binding</strong><div className="text-sm text-gray-500 mt-1">Filter the loaded catalog locally by category, company, and SIM type.</div></div>
                                     {inaxLoading && <div className="col-12"><ProgressBar mode="indeterminate" style={{ height: '4px' }} /></div>}
                                     <div className="field col-12 md:col-4">
                                         <label>Category</label>
                                         <SearchSelect
                                             value={
                                                 selectedInaxCategory
                                                     ? { label: selectedInaxCategory, value: selectedInaxCategory }
                                                     : null
                                             }
                                             options={inaxCategories.map((v) => ({ label: v, value: v }))}
                                             onChange={(opt: { label: string; value: string } | null) => {
                                                 setSelectedInaxCategory(opt?.value ?? null);
                                                 setSelectedInaxOperator(null);
                                                 setSelectedInaxSimType(null);
                                                 setSelectedProviderBundle(null);
                                             }}
                                             optionLabel="label"
                                             placeholder="All categories"
                                             searchPlaceholder="Filter categories"
                                             returnFullObject
                                             showClear
                                         />
                                     </div>
                                     <div className="field col-12 md:col-4">
                                         <label>Company / Operator</label>
                                         <SearchSelect
                                             value={
                                                 selectedInaxOperator
                                                     ? { label: selectedInaxOperator, value: selectedInaxOperator }
                                                     : null
                                             }
                                             options={inaxOperators.map((v) => ({ label: v, value: v }))}
                                             onChange={(opt: { label: string; value: string } | null) => {
                                                 setSelectedInaxOperator(opt?.value ?? null);
                                                 setSelectedInaxSimType(null);
                                                 setSelectedProviderBundle(null);
                                             }}
                                             optionLabel="label"
                                             placeholder="All companies"
                                             searchPlaceholder="Filter companies"
                                             returnFullObject
                                             showClear
                                         />
                                     </div>
                                     <div className="field col-12 md:col-4">
                                         <label>SIM Type</label>
                                         <SearchSelect
                                             value={
                                                 selectedInaxSimType
                                                     ? { label: selectedInaxSimType, value: selectedInaxSimType }
                                                     : null
                                             }
                                             options={inaxSimTypes.map((v) => ({ label: v, value: v }))}
                                             onChange={(opt: { label: string; value: string } | null) => {
                                                 setSelectedInaxSimType(opt?.value ?? null);
                                                 setSelectedProviderBundle(null);
                                             }}
                                             optionLabel="label"
                                             placeholder="All SIM types"
                                             searchPlaceholder="Filter SIM types"
                                             returnFullObject
                                             showClear
                                         />
                                     </div>
                                     <div className="field col-12">
                                         <label>Provider Product ({filteredInaxProducts.length})</label>
                                         <SearchSelect
                                             value={
                                                 filteredInaxProducts.find(
                                                     (p: any) =>
                                                         String(p.id) === String((selectedProviderBundle as any)?.id) &&
                                                         String(p.table_id || p.provider_table_id) ===
                                                             String(
                                                                 (selectedProviderBundle as any)?.table_id ||
                                                                     (selectedProviderBundle as any)?.provider_table_id
                                                             )
                                                 ) || selectedProviderBundle
                                             }
                                             options={filteredInaxProducts || []}
                                             onChange={(selected) => setSelectedProviderBundle(selected)}
                                             optionLabel="title"
                                             optionValue="table_id"
                                             searchPlaceholder="Search product or package"
                                             placeholder="Select INAX product"
                                             emptyMessage="No products found"
                                             returnFullObject
                                             showClear
                                             itemTemplate={(p: any) => (
                                                 <div className="flex flex-col gap-1">
                                                     <strong>{p.title || p.name}</strong>
                                                     <span className="text-sm text-gray-600">
                                                         {p.operator || p.meta?.operator} · {p.sim_type || p.meta?.sim_type} · {p.validity || '-'} ·{' '}
                                                         {p.meta?.volume ? `${p.meta.volume} ${p.meta.unit || ''}` : ''}
                                                     </span>
                                                     <span className="text-sm text-blue-700">
                                                         Price: {p.price ?? '-'} {p.currency || 'IRT'} · Total: {p.tprice ?? '-'} {p.currency || 'IRT'} · Table #
                                                         {p.table_id || p.provider_table_id}
                                                     </span>
                                                 </div>
                                             )}
                                             valueTemplate={(p: any) => <span>{inaxProductLabel(p)}</span>}
                                         />
                                     </div>
                                     {selectedProviderBundle && <div className="col-12">
                                         <div className="p-3 border-round-lg" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                             <strong>{(selectedProviderBundle as any).title || (selectedProviderBundle as any).name}</strong>
                                             <div className="text-sm mt-2">{(selectedProviderBundle as any).desc || ''}</div>
                                             <div className="flex flex-wrap gap-3 text-sm mt-2">
                                                 <span>Operator: {(selectedProviderBundle as any).operator || (selectedProviderBundle as any).meta?.operator || '-'}</span>
                                                 <span>SIM: {(selectedProviderBundle as any).sim_type || (selectedProviderBundle as any).meta?.sim_type || '-'}</span>
                                                 <span>Validity: {(selectedProviderBundle as any).validity || '-'}</span>
                                                 <span>Volume: {(selectedProviderBundle as any).meta?.volume || '-'} {(selectedProviderBundle as any).meta?.unit || ''}</span>
                                                 <span>Price: {(selectedProviderBundle as any).price ?? '-'} {(selectedProviderBundle as any).currency || 'IRT'}</span>
                                                 <strong>Total price: {(selectedProviderBundle as any).tprice ?? '-'} {(selectedProviderBundle as any).currency || 'IRT'}</strong>
                                             </div>
                                             <div className="text-xs text-gray-500 mt-2">INAX prices are informational; Waslat bundle pricing is configured separately.</div>
                                         </div>
                                     </div>}
                                 </div>
                             )}

                            {/* PAYSTORE SECTION - Show operator list and products based on op_firm */}
                            {isPaystore && (
                                <div className="grid formgrid p-fluid">
                                    {/* Operator Group Dropdown */}
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="operator_group" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                            {t('OPERATOR_GROUP')}
                                        </label>
                                        <SearchSelect
                                            value={selectedPaystoreGroup}
                                            options={operatorGroups || []}
                                            onChange={(selected) => {
                                                setSelectedPaystoreGroup(selected);
                                                setSelectedPaystoreOperator(null);
                                                setSelectedProviderBundle(null);
                                            }}
                                            optionLabel="op_firm"
                                            placeholder={t('SELECT_OPERATOR_GROUP')}
                                            returnFullObject
                                            showClear
                                            itemTemplate={(option: PaystoreGroup) => (
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-semibold">{option.op_firm}</span>
                                                    <span className="text-xs text-gray-500">Products: {option.product_count}</span>
                                                </div>
                                            )}
                                            valueTemplate={(option: PaystoreGroup) => (
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>{option.op_firm}</span>
                                                    <span className="text-xs text-gray-500">({option.product_count} products)</span>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    {/* Operator Dropdown */}
                                    {selectedPaystoreGroup && (
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="operator" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                {t('OPERATOR')}
                                            </label>
                                            <SearchSelect
                                                value={selectedPaystoreOperator}
                                                options={selectedPaystoreGroup.operators || []}
                                                onChange={(selected) => setSelectedPaystoreOperator(selected)}
                                                optionLabel="code"
                                                placeholder={t('SELECT_OPERATOR')}
                                                returnFullObject
                                                showClear
                                                itemTemplate={(option: PaystoreOperator) => (
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span>{option.code}</span>
                                                        <span className="text-xs text-gray-500">Products: {option.product_count}</span>
                                                    </div>
                                                )}
                                                valueTemplate={(option: PaystoreOperator) => (
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span>{option.code}</span>
                                                        <span className="text-xs text-gray-500">({option.product_count} products)</span>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {/* Info Display */}
                                    {selectedPaystoreGroup && (
                                        <div className="field col-12">
                                            <div className="text-sm text-gray-600 p-2 bg-blue-50 rounded">
                                                <strong>{selectedPaystoreGroup.op_firm}</strong> - Total Products: {selectedPaystoreGroup.product_count}
                                                {selectedPaystoreOperator && (
                                                    <span className="ml-3">
                                                        | Selected Operator: <strong>{selectedPaystoreOperator.code}</strong>
                                                        ({selectedPaystoreOperator.product_count} products)
                                                    </span>
                                                )}
                                                {selectedOpFirmFromRedux && (
                                                    <span className="ml-3 text-green-600">
                                                        | ✅ Products loaded for: <strong>{selectedOpFirmFromRedux}</strong> ({products?.length || 0} products)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Products Dropdown - Shows products based on op_firm */}
                                    {selectedPaystoreGroup && (
                                        <div className="field col-12">
                                            <label htmlFor="product_select" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                                {t('PRODUCTS')}
                                            </label>
                                            <SearchSelect
                                                value={selectedProviderBundle}
                                                options={products || []}
                                                onChange={(selected) => {
                                                    console.log('Selected product:', selected);
                                                    setSelectedProviderBundle(selected);
                                                }}
                                                optionLabel="title"
                                                searchPlaceholder={t('SEARCH_PRODUCT')}
                                                placeholder={t('SELECT_PRODUCT')}
                                                emptyMessage="No products found for this operator"
                                                returnFullObject
                                                showClear
                                                itemTemplate={(option: any) => (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="font-semibold text-sm">{option.title || option.name || option.package_name || 'N/A'}</div>
                                                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                            {option.operator && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{option.operator}</span>}
                                                            {option.price && <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Price: {option.price}</span>}
                                                            {option.validity_days && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Validity: {option.validity_days} days</span>}
                                                            {option.type && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Type: {option.type}</span>}
                                                            {option.amount && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Amount: {option.amount}</span>}
                                                        </div>
                                                    </div>
                                                )}
                                                valueTemplate={(option: any) => (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-sm">
                                                            {option.title || option.name || option.package_name || 'N/A'}
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            {option.operator} - {option.price}
                                                        </span>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* BUNDLE DROPDOWN - for regular providers */}
                            {selectedProvider &&
                                selectedProvider.code !== 'mzr' &&
                                selectedProvider.code !== 'paystore' &&
                                selectedProvider.code !== 'manshorpay' &&
                                selectedProvider.code !== 'inax' &&
                                selectedCapability && (
                                <div className="grid formgrid p-fluid">
                                    <div className="field col-12">
                                        <label htmlFor="bundle_select" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                            {t('BUNDLE')}
                                        </label>
                                        <SearchSelect
                                            value={selectedProviderBundle}
                                            options={rawInternets || []}
                                            onChange={(selected) => {
                                                console.log('Selected bundle:', selected);
                                                setSelectedProviderBundle(selected);
                                            }}
                                            optionLabel="name"
                                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                            placeholder={t('SEARCH_BUNDLE')}
                                            emptyMessage="No bundles found"
                                            returnFullObject
                                            showClear
                                            itemTemplate={(option: any) => (
                                                <div className="flex flex-col gap-2">
                                                    <div className="font-semibold text-sm">{option.name || option.title}</div>
                                                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{option.operator}</span>
                                                        {option.validity && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{option.validity}</span>}
                                                        {option.price && <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Price: {option.price}</span>}
                                                    </div>
                                                </div>
                                            )}
                                            valueTemplate={(option: any) => (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-sm">{option.name || option.title}</span>
                                                    <span className="text-xs text-gray-600">
                                                        {option.operator} - {option.price}
                                                    </span>
                                                </div>
                                            )}
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
                </FormSection>
            </FormSheet>

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
    );
};


export default withAuth(BundlePage);
