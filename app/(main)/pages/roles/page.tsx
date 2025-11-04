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
import { Permission, Roles } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addRole, _deleteRole, _editRole, _fetchRoleList, _fetchSingleRole, clearRole } from '@/app/redux/actions/rolesActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
import { FileUpload } from 'primereact/fileupload';
import { rolesReducer } from '../../../redux/reducers/rolesReducer';
import { permissionsReducer } from '../../../redux/reducers/permissionReducer';
import { _fetchPermissions } from '@/app/redux/actions/permissionActions';
import { Checkbox } from 'primereact/checkbox';
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
    const [globalFilter, setGlobalFilter] = useState('');
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

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('ROLES.CREATENEW')}
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

    const actionBodyTemplate = (rowData: Roles) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editRole(rowData.id)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteRole(rowData)} />
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

    const roleDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveRole} />
        </>
    );
    const deleteRoleDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteRoleDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteRole} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteRolesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
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

    // Handle Select All toggle
    const handleSelectAll = () => {
        if (selectedPermissions.length === permissions.length) {
            setSelectedPermissions([]); // Unselect all
        } else {
            setSelectedPermissions(permissions); // Select all
        }
    };

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

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
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog
                        visible={roleDialog}
                        style={{
                            width: '90vw',
                            maxWidth: '900px',
                            borderRadius: '10px',
                            padding: '1rem',
                            margin: '5px'
                        }}
                        header={t('ROLE.DETAILS')}
                        modal
                        className="p-fluid"
                        footer={roleDialogFooter}
                        onHide={hideDialog}
                    >
                        {/* Role Name Field */}
                        <div
                            style={{
                                marginBottom: '1.5rem'
                            }}
                        >
                            <label
                                htmlFor="name"
                                style={{
                                    display: 'block',
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem',
                                    fontSize: '14px'
                                }}
                            >
                                {t('ROLE.FORM.ROLENAME')}
                            </label>
                            <InputText
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
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: submitted && !role.name ? '1px solid red' : '1px solid #ced4da',
                                    borderRadius: '5px'
                                }}
                            />
                            {submitted && !role.name && <small style={{ color: 'red', fontSize: '12px' }}>{t('THIS_FIELD_IS_REQUIRED')}</small>}
                        </div>

                        <h5>{t('PERMISSIONS')}</h5>
                        {/* Select All Checkbox */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '1rem'
                            }}
                        >
                            <Checkbox
                                inputId="selectAll"
                                onChange={handleSelectAll}
                                checked={selectedPermissions.length === permissions.length}
                                style={{
                                    marginRight: '0.5rem'
                                }}
                            />
                            <label
                                htmlFor="selectAll"
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                {t('SELECTALL')}
                            </label>
                        </div>
                        <hr />
                        {/* Permissions Grid */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                padding: '0.5rem'
                            }}
                        >
                            {permissions.map((permission: Permission) => (
                                <div
                                    key={permission.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Checkbox
                                        value={permission}
                                        onChange={() => togglePermission(permission)}
                                        checked={isSelected(permission)}
                                        style={{
                                            marginRight: '0.5rem'
                                        }}
                                    />
                                    <label
                                        htmlFor={permission.name}
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {permission.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </Dialog>

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
            </div>
        </div>
    );
};

export default RolesPage;
