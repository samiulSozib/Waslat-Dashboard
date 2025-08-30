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
import { User } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
import { InputTextarea } from 'primereact/inputtextarea';
import { _addUser, _deleteUser, _editUser, _fetchUserList } from '@/app/redux/actions/userListActions';
import { userReducer } from '../../../redux/reducers/userListReducer';
import { rolesReducer } from '../../../redux/reducers/rolesReducer';
import { _fetchRoleList } from '@/app/redux/actions/rolesActions';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const UserListGroupPage = () => {

    let emptyUser:User={
        id: 0,
        uuid: '',
        name: '',
        email: '',
        password:'',
        confirm_password:'',
        phone: '',
        user_type: '',
        email_verified_at: '' ,
        currency_preference_code: '',
        currency_preference_id: 0,
        fcm_token: '',
        deleted_at: '' ,
        created_at: '',
        updated_at: '',
        currency: null,
        roles:null
    }



    const [userListDialog, setUserListDialog] = useState(false);
    const [deleteUserListDialog, setDeleteUserListDialog] = useState(false);
    const [deleteUserListsDialog, setDeleteUserListsDialog] = useState(false);
    const [user,setUser]=useState<any>(emptyUser)
    const [selectedCompanies, setSelectedUserList] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch=useDispatch<AppDispatch>()
    const {currencies}=useSelector((state:any)=>state.currenciesReducer)
    const {roles}=useSelector((state:any)=>state.rolesReducer)
    const {users,loading}=useSelector((state:any)=>state.userReducer)
    const {t}=useTranslation()
    const [searchTag,setSearchTag]=useState("")



    useEffect(()=>{
        dispatch(_fetchUserList(searchTag))
        dispatch(_fetchCurrencies())
        dispatch(_fetchRoleList())
    },[dispatch,searchTag])

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
        if (!user.name || ! user.password || !user.confirm_password || !user.phone || !user.email || !user.roles || !user.currency_preference_id) {

            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000,
            });
        return;
    }
        if (user.id && user.id !== 0) {
            dispatch(_editUser(user.id,user,toast,t));

        } else {
            dispatch(_addUser(user,toast,t));
        }

        setUserListDialog(false);
        setUser(emptyUser);
        setSubmitted(false)
    };

    const editUserList = (user: User) => {
        //console.log(user)
        setUser({ ...user});

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
        dispatch(_deleteUser(user?.id,toast,t))
        setDeleteUserListDialog(false);

    };


    const confirmDeleteSelected = () => {
        setDeleteUserListsDialog(true);
    };



    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button style={{ gap: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? '0.5rem' : '' }} label={t('CREATE.NEWUSER')} icon="pi pi-plus" severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"} onClick={openNew} />
                    {/* <Button style={{ gap: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? '0.5rem' : '' }} label={t("APP.GENERAL.DELETE")} icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedCompanies || !(selectedCompanies as any).length} /> */}
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
                <span style={{color:'green'}}>{rowData.roles && rowData.roles.length > 0
                    ? rowData.roles.map((role) => role.name).join(', ')
                    : 'No roles assigned'}</span>
            </>
        );
    };









    const actionBodyTemplate = (rowData: User) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"}  onClick={()=>editUserList(rowData)}/>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteUserList(rowData)} />
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

    const userListDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''} onClick={saveUserList} />
        </>
    );
    const deleteUserListDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteUserListDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''} onClick={deleteUserList} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteUserListsDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''}  />
        </>
    );




    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

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
                        style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        // header={header}
                        responsiveLayout="scroll"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{...customCellStyle,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="name" header={t('USER.TABLE.FIRSTNAME')} sortable body={userNameBodyTemplate}></Column>
                        <Column style={{...customCellStyle,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="guard_name" header={t('USER.TABLE.EMAIL')} body={emailBodyTemplate} sortable></Column>
                        <Column style={{...customCellStyle,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="guard_name" header={t('USER.TABLE.PHONENUMBER')} body={phoneNumberBodyTemplate} sortable></Column>
                        <Column style={{...customCellStyle,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="guard_name" header={t('USER.TABLE.ROLE')} body={roleBodyTemplate} sortable></Column>
                        <Column style={{...customCellStyle,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>


                    <Dialog visible={userListDialog}  style={{ width: '900px',padding:'5px' }} header={t('USER.DETAILS')} modal className="p-fluid" footer={userListDialogFooter} onHide={hideDialog}>
                        <div className="card flex flex-wrap p-fluid mt-3 gap-4">
                            <div className='flex-1 col-12 lg:col-6'>
                                <div className="field ">
                                    <label htmlFor="supplier" style={{fontWeight:'bold'}}>{t('USER.FORM.LABEL.USERNAME')}</label>
                                    <InputText
                                        id="name"
                                        value={user.name}
                                        onChange={(e) =>
                                            setUser((prev:any) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('USER.FORM.PLACEHOLDER.USERNAME')}
                                        className={classNames({
                                            'p-invalid': submitted && !user.name
                                        })}
                                    />
                                    {submitted && !user.name && (<small style={{ color: "red", fontSize: "12px" }}>{t('THIS_FIELD_IS_REQUIRED')}</small>)}
                                </div>

                                <div className="field ">
                                    <label htmlFor="supplier" style={{fontWeight:'bold'}}>{t('USER.FORM.LABEL.PASSWORD')}</label>
                                    <InputText
                                        id="sub_reseller_limit"
                                        value={user.password}
                                        onChange={(e) =>
                                            setUser((prev:any) => ({
                                                ...prev,
                                                password: e.target.value,
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('USER.FORM.PLACEHOLDER.PASSWORD')}
                                        className={classNames({
                                            'p-invalid': submitted
                                        })}
                                    />
                                    {submitted && !user.password && (<small style={{ color: "red", fontSize: "12px" }}>{t('THIS_FIELD_IS_REQUIRED')}</small>)}
                                </div>

                                <div className="field ">
                                    <label htmlFor="supplier" style={{fontWeight:'bold'}}>{t('USER.FORM.LABEL.CONFIRMPASSWORD')}</label>
                                    <InputText
                                        id="confirm_password"
                                        value={user.confirm_password}
                                        onChange={(e) =>
                                            setUser((prev:any) => ({
                                                ...prev,
                                                confirm_password: e.target.value,
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('USER.FORM.PLACEHOLDER.CONFIRMPASSWORD')}
                                        className={classNames({
                                            'p-invalid': submitted && !user.confirm_password
                                        })}
                                    />
                                    {submitted && !user.confirm_password && (<small style={{ color: "red", fontSize: "12px" }}>{t('THIS_FIELD_IS_REQUIRED')}</small>)}
                                </div>
                                <div className="field ">
                                    <label htmlFor="discount_type" style={{fontWeight:'bold'}}>{t('USER.FORM.LABEL.ROLE')}</label>
                                    <Dropdown
                                        id="discount_type"
                                        value={user.roles}
                                        options={roles}
                                        onChange={(e) =>
                                            setUser((prev:any) => ({
                                                ...prev,
                                                roles: e.value,
                                            }))
                                        }
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder={t('USER.FORM.PLACEHOLDER.ROLE')}
                                        className="w-full"
                                    />
                                    {submitted && !user.roles && (<small style={{ color: "red", fontSize: "12px" }}>{t('THIS_FIELD_IS_REQUIRED')}.</small>)}
                                </div>

                            </div>
                            <div className='flex-1 col-12 lg:col-6'>
                                <div className="field ">
                                    <label htmlFor="supplier" style={{fontWeight:'bold'}}>{t('USER.FORM.LABEL.EMAIL')}</label>
                                    <InputText
                                        id="email"
                                        value={user.email}
                                        onChange={(e) =>
                                            setUser((prev:any) => ({
                                                ...prev,
                                                email: e.target.value,
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('USER.FORM.PLACEHOLDER.EMAIL')}
                                        className={classNames({
                                            'p-invalid': submitted && !user.email
                                        })}
                                    />
                                    {submitted && !user.email && (<small style={{ color: "red", fontSize: "12px" }}>{t('THIS_FIELD_IS_REQUIRED')}</small>)}
                                </div>
                                <div className="field ">
                                    <label htmlFor="supplier" style={{fontWeight:'bold'}}>{t('USER.FORM.LABEL.PHONENUMBER')}</label>
                                    <InputText
                                        id="phone"
                                        value={user.phone}
                                        onChange={(e) =>
                                            setUser((prev:any) => ({
                                                ...prev,
                                                phone: e.target.value,
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('USER.FORM.PLACEHOLDER.PHONENUMBER')}
                                        className={classNames({
                                            'p-invalid': submitted && !user.phone
                                        })}
                                    />
                                    {submitted && !user.phone && (<small style={{ color: "red", fontSize: "12px" }}>{t('THIS_FIELD_IS_REQUIRED')}</small>)}
                                </div>

                                <div className="field ">
                                    <label htmlFor="status" style={{fontWeight:'bold'}}>{t('USER.FORM.LABEL.CURRENCY')}</label>
                                    <Dropdown
                                        id="currency_preference_id"
                                        value={user.currency_preference_id}
                                        options={currencies}
                                        onChange={(e) =>
                                            setUser((prev:any) => ({
                                                ...prev,
                                                currency_preference_id: e.value,
                                            }))
                                        }
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder={t('USER.FORM.PLACEHOLDER.CURRENCY')}
                                        className="w-full"
                                    />
                                    {submitted && !user.currency_preference_id && (<small style={{ color: "red", fontSize: "12px" }}>{t('THIS_FIELD_IS_REQUIRED')}</small>)}
                                </div>

                            </div>


                        </div>
                    </Dialog>

                    <Dialog visible={deleteUserListDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUserListDialogFooter} onHide={hideDeleteUserListDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {user && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{user.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUserListsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteUserListsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {user && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default UserListGroupPage;
