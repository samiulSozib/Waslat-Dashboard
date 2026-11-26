/* eslint-disable @next/next/no-img-element */
'use client';
import { ListPage } from '@/components/admin/list-page';
import { RowActions } from '@/components/admin/row-actions';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Button as UiButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../utilities/rtlUtil';
import { _addHelpArticle, _deleteHelpArticle, _editHelpArticle, _fetchHelpArticles } from '@/app/redux/actions/helpArticlesActions';
import { HelpArticle } from '@/types/interface';
import { Pencil, Plus, Trash2 } from 'lucide-react';

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
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { helpArticles, loading, pagination } = useSelector((state: any) => state.helpArticlesReducer);
    const { t } = useTranslation();
    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

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

    const onPageChange = (page: number) => {
        dispatch(_fetchHelpArticles(page));
    };

    const getRowActions = (row: HelpArticle) => [
        { label: t('TABLE.GENERAL.EDIT'), icon: <Pencil className="h-4 w-4" />, onClick: () => editHelpArticle(row) },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            danger: true,
            separatorBefore: true,
            onClick: () => confirmDeleteHelpArticle(row)
        }
    ];

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

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.HELP_ARTICLES', { defaultValue: 'راهنما' })}
                description={t('HELP_ARTICLE.PAGE.DESCRIPTION', { defaultValue: 'مدیریت مقالات راهنمای کاربران' })}
                loading={loading}
                actions={
                    <UiButton variant="default" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('CREATE_NEW_ARTICLE')}
                    </UiButton>
                }
                footer={
                    <div className="flex flex-col gap-2 border-t border-emerald-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                            {t('DATA_TABLE.TABLE.PAGINATOR.SHOWING', { defaultValue: 'صفحه' })}{' '}
                            {pagination?.page || 1} / {totalPages} · {pagination?.total || 0}
                        </div>
                        <div className="flex items-center gap-2">
                            <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) <= 1} onClick={() => onPageChange((pagination?.page || 1) - 1)}>
                                {t('PREVIOUS', { defaultValue: 'قبلی' })}
                            </UiButton>
                            <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) >= totalPages} onClick={() => onPageChange((pagination?.page || 1) + 1)}>
                                {t('NEXT', { defaultValue: 'بعدی' })}
                            </UiButton>
                        </div>
                    </div>
                }
            >
                <table className="w-full min-w-[720px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HELP_ARTICLE.TABLE.COLUMN.TITLE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HELP_ARTICLE.TABLE.COLUMN.DESCRIPTION')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(helpArticles || []).length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (helpArticles || []).map((row: HelpArticle) => (
                                <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                    <td className="px-2 py-1.5 align-middle">
                                        <RowActions items={getRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5 font-medium text-start">{row.title || '—'}</td>
                                    <td className="max-w-[28rem] truncate px-2 py-1.5 text-start text-muted-foreground" title={row.description || ''}>
                                        {row.description || '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ListPage>

            <FormSheet
                open={helpArticleDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={helpArticle.id ? t('TABLE.GENERAL.EDIT') : t('CREATE_NEW_ARTICLE')}
                description={t('HELP_ARTICLE.FORM.HINT', { defaultValue: 'عنوان و متن راهنما را وارد کنید.' })}
                size="lg"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveHelpArticle}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('HELP_ARTICLE.DETAILS', { defaultValue: 'جزئیات مقاله' })}>
                    <FormField
                        label={t('HELP_ARTICLE.TABLE.COLUMN.TITLE')}
                        required
                        fullWidth
                        error={submitted && !helpArticle.title ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="title"
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
                            className={cn('w-full', submitted && !helpArticle.title && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('HELP_ARTICLE.TABLE.COLUMN.DESCRIPTION')}
                        required
                        fullWidth
                        error={submitted && !helpArticle.description ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Textarea
                            id="description"
                            value={helpArticle.description?.toString()}
                            onChange={(e) =>
                                setHelpArticle((prevHelpArticle) => ({
                                    ...prevHelpArticle,
                                    description: e.target.value
                                }))
                            }
                            required
                            rows={6}
                            placeholder={t('HELP_ARTICLE.TABLE.COLUMN.DESCRIPTION')}
                            className={cn('w-full', submitted && !helpArticle.description && 'border-rose-300')}
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

            <Dialog visible={deleteHelpArticleDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteHelpArticleDialogFooter} onHide={hideDeleteHelpArticleDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {helpArticle && (
                        <span>
                            {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{helpArticle.title}</b>
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={deleteHelpArticlesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteHelpArticlesDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {helpArticle && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default withAuth(HelpArticles);