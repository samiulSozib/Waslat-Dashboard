/* eslint-disable @next/next/no-img-element */
'use client';
import { Button as PrimeButton } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Permission, Roles } from '@/types/interface';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { _addRole, _deleteRole, _editRole, _fetchRoleList, _fetchSingleRole, clearRole } from '@/app/redux/actions/rolesActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
import { rolesReducer } from '../../../redux/reducers/rolesReducer';
import { permissionsReducer } from '../../../redux/reducers/permissionReducer';
import { _fetchPermissions } from '@/app/redux/actions/permissionActions';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const RolesPage = () => {
    let emptyRole: Roles = {
        id: 0,
        name: '',
        guard_name: '',
        created_at: '',
        updated_at: ''
    };

    const [roleDialog, setRoleDialog] = useState(false);
    const [deleteRoleDialog, setDeleteRoleDialog] = useState(false);
    const [deleteRolesDialog, setDeleteRolesDialog] = useState(false);
    const [role, setRole] = useState<Roles>(emptyRole);
    const [selectedCompanies, setSelectedRole] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const globalFilter = useDebouncedValue(searchInput, 350);
    const [refreshing, setRefreshing] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { roles, loading, singleRole } = useSelector((state: any) => state.rolesReducer);
    const { permissions } = useSelector((state: any) => state.permissionsReducer);
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchRoleList());
        dispatch(_fetchPermissions());
    }, [dispatch]);

    dispatch(() => {
        //console.log(selectedPermissions)
    }, [dispatch, selectedPermissions]);

    const openNew = () => {
        setRole(emptyRole);
        setSubmitted(false);
        setRoleDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setRoleDialog(false);
        setSelectedPermissions([]);
    };

    const hideDeleteRoleDialog = () => {
        setDeleteRoleDialog(false);
        setSelectedPermissions([]);
    };

    const hideDeleteRolesDialog = () => {
        setDeleteRolesDialog(false);
        setSelectedPermissions([]);
    };

    const saveRole = () => {
        setSubmitted(true);
        if (!role.name) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (role.id && role.id !== 0) {
            dispatch(_editRole(role.id, role, selectedPermissions, toast, t));
        } else {
            dispatch(_addRole(role, selectedPermissions, toast, t));
        }

        setRoleDialog(false);
        setRole(emptyRole);
        setSelectedPermissions([]);
        setSubmitted(false);
    };

    const editRole = (id: number) => {
        //console.log(id)
        dispatch(_fetchSingleRole(id));
        //setRole({ ...role,id:singleRole?.id,name:singleRole?.name,guard_name:singleRole?.guard_name,created_at:singleRole?.created_at,updated_at:singleRole?.updated_at});
        //setSelectedPermissions(singleRole.permissions)
        setRoleDialog(true);
    };
    useEffect(() => {
        // Once `singleRole` is fetched, update the state
        if (singleRole) {
            setRole({
                id: singleRole.id,
                name: singleRole.name,
                guard_name: singleRole.guard_name,
                created_at: singleRole.created_at,
                updated_at: singleRole.updated_at
            });
            setSelectedPermissions(singleRole.permissions); // Set permissions
        }
    }, [singleRole]);

    const confirmDeleteRole = (role: Roles) => {
        setRole(role);
        setDeleteRoleDialog(true);
    };

    const deleteRole = () => {
        if (!role?.id) {
            console.error('Role  ID is undefined.');
            return;
        }
        dispatch(_deleteRole(role?.id, toast, t));
        setDeleteRoleDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteRolesDialog(true);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchRoleList() as any);
        setRefreshing(false);
    };

    const roleRowActions = (rowData: Roles) => [
        {
            label: t('TABLE.GENERAL.EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editRole(rowData.id)
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteRole(rowData),
            danger: true,
            separatorBefore: true
        }
    ];

    const roleNameBodyTemplate = (rowData: Roles) => {
        return (
            <>
                <span className="p-column-title">Role</span>
                {rowData.name}
            </>
        );
    };

    const guardNameBodyTemplate = (rowData: Roles) => {
        return (
            <>
                <span className="p-column-title">Guard Name</span>
                {rowData.guard_name}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Roles) => <RowActions items={roleRowActions(rowData)} />;

    // const header = (
    //     <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
    //         <h5 className="m-0">Manage Products</h5>
    //         <span className="block mt-2 md:mt-0 p-input-icon-left">
    //             <i className="pi pi-search" />
    //             <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
    //         </span>
    //     </div>
    // );

    const deleteRoleDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteRoleDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteRole} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteRolesDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    const togglePermission = (permission: Permission) => {
        setSelectedPermissions((prev) => (prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]));
    };

    // Check if a permission is selected
    const isSelected = (permission: Permission): boolean => {
        //console.log(selectedPermissions.some((selected) => selected.id === permission.id))
        return selectedPermissions.some((selected) => selected.id === permission.id);
    };

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.ROLES', { defaultValue: 'نقش‌ها' })}
                description="مدیریت نقش‌ها و دسترسی‌های پنل"
                loading={loading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('ROLES.CREATENEW')}
                        </Button>
                    </div>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در نقش‌ها...' })}
                    />
                }
            >
                    <DataTable
                        ref={dt}
                        value={roles}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedRole(e.value as any)}
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
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="name" header={t('ROLES.TABLE.ROLE')} sortable body={roleNameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="guard_name" header={t('ROLES.TABLE.GUARDNAME')} body={guardNameBodyTemplate} sortable></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: 'start' }}
                            header={t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '4.5rem' }}
                        ></Column>
                    </DataTable>
            </ListPage>

                    <FormSheet
                        open={roleDialog}
                        onOpenChange={(open) => {
                            if (!open) hideDialog();
                        }}
                        title={t('ROLE.DETAILS')}
                        description={role.id ? 'ویرایش نقش' : 'ثبت نقش جدید'}
                        size="xl"
                        side="left"
                        footer={
                            <FormActions
                                onCancel={hideDialog}
                                onSubmit={saveRole}
                                cancelLabel={t('APP.GENERAL.CANCEL')}
                                submitLabel={t('FORM.GENERAL.SUBMIT')}
                            />
                        }
                    >
                        <FormSection title={t('ROLE.FORM.ROLENAME')} description="نام نقش و دسترسی‌ها">
                            <FormField
                                label={t('ROLE.FORM.ROLENAME')}
                                required
                                fullWidth
                                error={submitted && !role.name ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Input
                                    id="name"
                                    value={role.name}
                                    onChange={(e) =>
                                        setRole((prevRole) => ({
                                            ...prevRole,
                                            name: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('ROLE.FORM.PLACEHOLDER.ROLENAME')}
                                    className={classNames('w-full', {
                                        'p-invalid': submitted && !role.name
                                    })}
                                />
                            </FormField>
                            <div className="sm:col-span-2 space-y-4 border-t border-emerald-50 pt-4">
                                <h4 className="text-sm font-semibold text-emerald-950">{t('PERMISSIONS')}</h4>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="selectAll"
                                        onCheckedChange={(checked) => {
                                            if (checked === true) setSelectedPermissions(permissions);
                                            else setSelectedPermissions([]);
                                        }}
                                        checked={selectedPermissions.length === permissions.length && permissions.length > 0}
                                    />
                                    <label htmlFor="selectAll" className="text-sm font-medium">
                                        {t('SELECTALL')}
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {permissions.map((permission: Permission) => (
                                        <div key={permission.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`perm-${permission.id}`}
                                                onCheckedChange={() => togglePermission(permission)}
                                                checked={isSelected(permission)}
                                            />
                                            <label htmlFor={`perm-${permission.id}`} className="text-sm font-medium">
                                                {permission.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FormSection>
                    </FormSheet>

                    <Dialog visible={deleteRoleDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteRoleDialogFooter} onHide={hideDeleteRoleDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {role && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{role.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteRolesDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteRolesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {role && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
        </div>
    );
};

export default RolesPage;
