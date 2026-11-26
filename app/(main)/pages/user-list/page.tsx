/* eslint-disable @next/next/no-img-element */
'use client';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchRoleList } from '@/app/redux/actions/rolesActions';
import { _addUser, _deleteUser, _editUser, _fetchUserList } from '@/app/redux/actions/userListActions';
import { AppDispatch } from '@/app/redux/store';
import i18n from '@/i18n';
import { User } from '@/types/interface';
import { Button as PrimeButton } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { SearchSelect } from '@/components/admin/search-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { customCellStyle } from '../../utilities/customRow';
import { isRTL } from '../../utilities/rtlUtil';

const UserListGroupPage = () => {

    let emptyUser: User = {
        id: 0,
        uuid: '',
        name: '',
        email: '',
        password: '',
        confirm_password: '',
        phone: '',
        user_type: '',
        email_verified_at: '',
        currency_preference_code: '',
        currency_preference_id: 0,
        fcm_token: '',
        deleted_at: '',
        created_at: '',
        updated_at: '',
        currency: null,
        roles: null
    }



    const [userListDialog, setUserListDialog] = useState(false);
    const [deleteUserListDialog, setDeleteUserListDialog] = useState(false);
    const [deleteUserListsDialog, setDeleteUserListsDialog] = useState(false);
    const [user, setUser] = useState<any>(emptyUser)
    const [selectedCompanies, setSelectedUserList] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [refreshing, setRefreshing] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>()
    const { currencies } = useSelector((state: any) => state.currenciesReducer)
    const { roles } = useSelector((state: any) => state.rolesReducer)
    const { users, loading } = useSelector((state: any) => state.userReducer)
    const { t } = useTranslation()

    useEffect(() => {
        dispatch(_fetchUserList(searchTag))
        dispatch(_fetchCurrencies())
        dispatch(_fetchRoleList())
    }, [dispatch, searchTag])

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchUserList(searchTag) as any);
        setRefreshing(false);
    };

    const openNew = () => {
        setUser(emptyUser)
        setSubmitted(false);
        setUserListDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserListDialog(false);
    };

    const hideDeleteUserListDialog = () => {
        setDeleteUserListDialog(false);
    };

    const hideDeleteUserListsDialog = () => {
        setDeleteUserListsDialog(false);
    };



    const saveUserList = () => {
        setSubmitted(true);
        //console.log(user)
        if (!user.name || !user.password || !user.confirm_password || !user.phone || !user.email || !user.roles || !user.currency_preference_id) {

            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000,
            });
            return;
        }
        if (user.id && user.id !== 0) {
            dispatch(_editUser(user.id, user, toast, t));

        } else {
            dispatch(_addUser(user, toast, t));
        }

        setUserListDialog(false);
        setUser(emptyUser);
        setSubmitted(false)
    };

    const editUserList = (user: User) => {
        //console.log(user)
        setUser({ ...user });

        setUserListDialog(true);
    };

    const confirmDeleteUserList = (user: User) => {
        setUser(user);
        setDeleteUserListDialog(true);
    };

    const deleteUserList = () => {
        if (!user?.id) {
            console.error("UserList  ID is undefined.");
            return;
        }
        dispatch(_deleteUser(user?.id, toast, t))
        setDeleteUserListDialog(false);

    };


    const confirmDeleteSelected = () => {
        setDeleteUserListsDialog(true);
    };



    const userRowActions = (rowData: User) => [
        {
            label: t('TABLE.GENERAL.EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editUserList(rowData)
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteUserList(rowData),
            danger: true,
            separatorBefore: true
        }
    ];




    const userNameBodyTemplate = (rowData: User) => {
        return (
            <>
                <span className="p-column-title">First Name</span>
                {rowData.name}
            </>
        );
    };

    const emailBodyTemplate = (rowData: User) => {
        return (
            <>
                <span className="p-column-title">Email</span>
                {rowData.email}
            </>
        );
    };

    const phoneNumberBodyTemplate = (rowData: User) => {
        return (
            <>
                <span className="p-column-title">Phone Number</span>
                {rowData.phone}
            </>
        );
    };

    const roleBodyTemplate = (rowData: User) => {
        return (
            <>
                <span className="p-column-title">Role</span>
                <span style={{ color: 'green' }}>{rowData.roles && rowData.roles.length > 0
                    ? rowData.roles.map((role) => role.name).join(', ')
                    : 'No roles assigned'}</span>
            </>
        );
    };









    const actionBodyTemplate = (rowData: User) => <RowActions items={userRowActions(rowData)} />;

    // const header = (
    //     <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
    //         <h5 className="m-0">Manage Products</h5>
    //         <span className="block mt-2 md:mt-0 p-input-icon-left">
    //             <i className="pi pi-search" />
    //             <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
    //         </span>
    //     </div>
    // );

    const deleteUserListDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteUserListDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteUserList} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteUserListsDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.USERLIST', { defaultValue: 'کاربران' })}
                description="مدیریت کاربران پنل و نقش‌ها"
                loading={loading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('CREATE.NEWUSER')}
                        </Button>
                    </div>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در کاربران...' })}
                    />
                }
            >
                    <DataTable
                        ref={dt}
                        value={users}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedUserList(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate={
                            isRTL()
                                ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink'
                                : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`  // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        responsiveLayout="scroll"
                    >
                        <Column
                            style={{ ...customCellStyle, textAlign: 'start' }}
                            header={t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '4.5rem' }}
                        />
                        <Column style={{ ...customCellStyle, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="name" header={t('USER.TABLE.FIRSTNAME')} sortable body={userNameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="guard_name" header={t('USER.TABLE.EMAIL')} body={emailBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="guard_name" header={t('USER.TABLE.PHONENUMBER')} body={phoneNumberBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? "right" : "left" }} field="guard_name" header={t('USER.TABLE.ROLE')} body={roleBodyTemplate} sortable></Column>
                    </DataTable>
            </ListPage>

                    <FormSheet
                        open={userListDialog}
                        onOpenChange={(open) => {
                            if (!open) hideDialog();
                        }}
                        title={t('USER.DETAILS')}
                        description={user.id ? 'ویرایش کاربر' : 'ثبت کاربر جدید'}
                        size="xl"
                        side="left"
                        footer={
                            <FormActions
                                onCancel={hideDialog}
                                onSubmit={saveUserList}
                                cancelLabel={t('APP.GENERAL.CANCEL')}
                                submitLabel={t('FORM.GENERAL.SUBMIT')}
                            />
                        }
                    >
                        <FormSection title="اطلاعات ورود" description="نام کاربری، رمز عبور و نقش">
                            <FormField
                                label={t('USER.FORM.LABEL.USERNAME')}
                                required
                                error={submitted && !user.name ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Input
                                    id="name"
                                    value={user.name}
                                    onChange={(e) =>
                                        setUser((prev: any) => ({
                                            ...prev,
                                            name: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('USER.FORM.PLACEHOLDER.USERNAME')}
                                    className={cn('w-full', submitted && !user.name && 'border-rose-300')}
                                />
                            </FormField>
                            <FormField
                                label={t('USER.FORM.LABEL.ROLE')}
                                required
                                error={submitted && !user.roles ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Select
                                    value={user.roles != null ? String(user.roles) : undefined}
                                    onValueChange={(v) =>
                                        setUser((prev: any) => ({
                                            ...prev,
                                            roles: Number(v)
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('USER.FORM.PLACEHOLDER.ROLE')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(roles || []).map((role: any) => (
                                            <SelectItem key={role.id} value={String(role.id)}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField
                                label={t('USER.FORM.LABEL.PASSWORD')}
                                required
                                error={submitted && !user.password ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Input
                                    id="password"
                                    type="password"
                                    value={user.password}
                                    onChange={(e) =>
                                        setUser((prev: any) => ({
                                            ...prev,
                                            password: e.target.value
                                        }))
                                    }
                                    required
                                    placeholder={t('USER.FORM.PLACEHOLDER.PASSWORD')}
                                    className={cn('w-full', submitted && !user.password && 'border-rose-300')}
                                />
                            </FormField>
                            <FormField
                                label={t('USER.FORM.LABEL.CONFIRMPASSWORD')}
                                required
                                error={submitted && !user.confirm_password ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={user.confirm_password}
                                    onChange={(e) =>
                                        setUser((prev: any) => ({
                                            ...prev,
                                            confirm_password: e.target.value
                                        }))
                                    }
                                    required
                                    placeholder={t('USER.FORM.PLACEHOLDER.CONFIRMPASSWORD')}
                                    className={cn('w-full', submitted && !user.confirm_password && 'border-rose-300')}
                                />
                            </FormField>
                        </FormSection>
                        <FormSection title="تماس و ارز" description="ایمیل، تلفن و ارز ترجیحی">
                            <FormField
                                label={t('USER.FORM.LABEL.EMAIL')}
                                required
                                error={submitted && !user.email ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Input
                                    id="email"
                                    value={user.email}
                                    onChange={(e) =>
                                        setUser((prev: any) => ({
                                            ...prev,
                                            email: e.target.value
                                        }))
                                    }
                                    required
                                    placeholder={t('USER.FORM.PLACEHOLDER.EMAIL')}
                                    className={cn('w-full', submitted && !user.email && 'border-rose-300')}
                                />
                            </FormField>
                            <FormField
                                label={t('USER.FORM.LABEL.PHONENUMBER')}
                                required
                                error={submitted && !user.phone ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Input
                                    id="phone"
                                    value={user.phone}
                                    onChange={(e) =>
                                        setUser((prev: any) => ({
                                            ...prev,
                                            phone: e.target.value
                                        }))
                                    }
                                    required
                                    placeholder={t('USER.FORM.PLACEHOLDER.PHONENUMBER')}
                                    className={cn('w-full', submitted && !user.phone && 'border-rose-300')}
                                />
                            </FormField>
                            <FormField
                                label={t('USER.FORM.LABEL.CURRENCY')}
                                required
                                error={submitted && !user.currency_preference_id ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <SearchSelect
                                    value={(currencies || []).find((c: any) => c.id === user.currency_preference_id) || null}
                                    options={currencies || []}
                                    onChange={(selected) =>
                                        setUser((prev: any) => ({
                                            ...prev,
                                            currency_preference_id: selected?.id
                                        }))
                                    }
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder={t('USER.FORM.PLACEHOLDER.CURRENCY')}
                                    error={submitted && !user.currency_preference_id}
                                    returnFullObject={false}
                                />
                            </FormField>
                        </FormSection>
                    </FormSheet>

                    <Dialog visible={deleteUserListDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUserListDialogFooter} onHide={hideDeleteUserListDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {user && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{user.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUserListsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteUserListsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {user && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
        </div>
    );
};

export default UserListGroupPage;
