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
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { _addHelpArticle, _deleteHelpArticle, _editHelpArticle, _fetchHelpArticles } from '@/app/redux/actions/helpArticlesActions';
import { HelpArticle } from '@/types/interface';
import { helpArticlesReducer } from '../../../redux/reducers/helpArilesReducer';
import { InputTextarea } from 'primereact/inputtextarea';
import { Paginator } from 'primereact/paginator';

const HelpArticles = () => {
    let emptyHelpArticle: HelpArticle = {
        id: 0,
        title: '',
        description: '',
        created_at: '',
        updated_at: ''
    };

    const [helpArticleDialog, setHelpArticleDialog] = useState(false);
    const [deleteHelpArticleDialog, setDeleteHelpArticleDialog] = useState(false);
    const [deleteHelpArticlesDialog, setDeleteHelpArticlesDialog] = useState(false);
    const [helpArticle, setHelpArticle] = useState<HelpArticle>(emptyHelpArticle);
    const [selectedCompanies, setSelectedHelpArticle] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { helpArticles, loading, pagination } = useSelector((state: any) => state.helpArticlesReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchHelpArticles(1));
    }, [dispatch]);

    const openNew = () => {
        setHelpArticle(emptyHelpArticle);
        setSubmitted(false);
        setHelpArticleDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setHelpArticleDialog(false);
    };

    const hideDeleteHelpArticleDialog = () => {
        setDeleteHelpArticleDialog(false);
    };

    const hideDeleteHelpArticlesDialog = () => {
        setDeleteHelpArticlesDialog(false);
    };

    const saveHelpArticle = () => {
        setSubmitted(true);
        if (!helpArticle.title || helpArticle.title.length === 0 || !helpArticle.description || helpArticle.description.length === 0) {
            // Don't proceed if any field is invalid
            return;
        }
        if (helpArticle.id && helpArticle.id !== 0) {
            dispatch(_editHelpArticle(helpArticle.id, helpArticle, toast, t));
        } else {
            dispatch(_addHelpArticle(helpArticle, toast, t));
        }

        setHelpArticleDialog(false);
        setHelpArticle(emptyHelpArticle);
    };

    const editHelpArticle = (helpArticle: HelpArticle) => {
        setHelpArticle({ ...helpArticle });

        setHelpArticleDialog(true);
    };

    const confirmDeleteHelpArticle = (helpArticle: HelpArticle) => {
        setHelpArticle(helpArticle);
        setDeleteHelpArticleDialog(true);
    };

    const deleteHelpArticle = () => {
        if (!helpArticle?.id) {
            console.error('HelpArticle  ID is undefined.');
            return;
        }
        dispatch(_deleteHelpArticle(helpArticle?.id, toast, t));
        setDeleteHelpArticleDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteHelpArticlesDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('CREATE_NEW_ARTICLE')}
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

    const helpArticleTitleBodyTemplate = (rowData: HelpArticle) => {
        return (
            <>
                <span className="p-column-title">Help Article Title</span>
                {rowData.title}
            </>
        );
    };

    const helpArticleDescriptionBodyTemplate = (rowData: HelpArticle) => {
        return (
            <>
                <span className="p-column-title">Help Article Description</span>
                <div
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {rowData.description}
                </div>
            </>
        );
    };

    const actionBodyTemplate = (rowData: HelpArticle) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editHelpArticle(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteHelpArticle(rowData)} />
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

    const helpArticleDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveHelpArticle} />
        </>
    );
    const deleteHelpArticleDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteHelpArticleDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteHelpArticle} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteHelpArticlesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchHelpArticles(page));
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
                        value={helpArticles}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedHelpArticle(e.value as any)}
                        dataKey="id"
                        className="datatable-responsive"
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        paginatorTemplate={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        // header={header}
                        responsiveLayout="scroll"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="name"
                            header={t('HELP_ARTICLE.TABLE.COLUMN.TITLE')}
                            sortable
                            body={helpArticleTitleBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="code"
                            header={t('HELP_ARTICLE.TABLE.COLUMN.DESCRIPTION')}
                            sortable
                            body={helpArticleDescriptionBodyTemplate}
                        ></Column>

                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Paginator
                        first={(pagination?.page - 1) * pagination?.items_per_page}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                    />

                    <Dialog visible={helpArticleDialog} style={{ width: '900px', padding: '5px' }} header={t('CURRENCY.DETAILS')} modal className="p-fluid" footer={helpArticleDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '40px' }}>
                            <div className="field">
                                <label htmlFor="name" style={{ fontWeight: 'bold' }}>
                                    {t('HELP_ARTICLE.TABLE.COLUMN.TITLE')}
                                </label>
                                <InputText
                                    id="title"
                                    inputMode="text"
                                    value={helpArticle.title?.toString()}
                                    onChange={(e) =>
                                        setHelpArticle((prevHelpArticle) => ({
                                            ...prevHelpArticle,
                                            title: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('HELP_ARTICLE.TABLE.COLUMN.TITLE')}
                                    className={classNames({
                                        'p-invalid': submitted && !helpArticle.title
                                    })}
                                />
                                {submitted && !helpArticle.title && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="code" style={{ fontWeight: 'bold' }}>
                                    {t('HELP_ARTICLE.TABLE.COLUMN.DESCRIPTION')}
                                </label>
                                <InputTextarea
                                    id="description"
                                    inputMode="text"
                                    value={helpArticle.description?.toString()}
                                    onChange={(e) =>
                                        setHelpArticle((prevHelpArticle) => ({
                                            ...prevHelpArticle,
                                            description: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('HELP_ARTICLE.TABLE.COLUMN.DESCRIPTION')}
                                    className={classNames({
                                        'p-invalid': submitted && !helpArticle.description
                                    })}
                                />
                                {submitted && !helpArticle.description && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteHelpArticleDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteHelpArticleDialogFooter} onHide={hideDeleteHelpArticleDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {helpArticle && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{helpArticle.title}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteHelpArticlesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteHelpArticlesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {helpArticle && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(HelpArticles);
