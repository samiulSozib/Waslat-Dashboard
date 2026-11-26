'use client';

import { _addBalance } from '@/app/redux/actions/balanceActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchHawalaBranchList } from '@/app/redux/actions/hawalaBranchActions';
import { _fetchHawalaCurrencies } from '@/app/redux/actions/hawalaCurrenciesActions';
import { _addHawala } from '@/app/redux/actions/hawalaActions';
import { _addPayment } from '@/app/redux/actions/paymentActions';
import { _fetchPaymentMethods } from '@/app/redux/actions/paymentMethodActions';
import { _editReseller, _fetchResellers, _getResellerById } from '@/app/redux/actions/resellerActions';
import { _fetchResellerGroups } from '@/app/redux/actions/resellerGroupActions';
import { AppDispatch } from '@/app/redux/store';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/date-field';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { currencyFaName } from '@/lib/currency-flags';
import { quoteHawalaDebit } from '@/lib/hawala-quote';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Currency, HawalaBranch, PaymentMethod, Reseller, ResellerGroup } from '@/types/interface';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

export type MoneyKind = 'payment' | 'balance' | 'hawala';

type DeskProps = {
    reseller: Reseller;
    toast: React.RefObject<Toast>;
};

function today() {
    return new Date().toISOString().slice(0, 10);
}

function flagOn(value: unknown) {
    return value === true || value === 1 || value === '1';
}

function editPayload(row: any, parentId?: number | null) {
    const currency = row.currency || row.code;
    const payload: any = {
        ...row,
        code: currency && typeof currency === 'object' ? currency : { id: row.currency_preference_id || currency?.id },
        account_password: '',
        balance: Number(row.balance || 0),
        country_id: row.country_id || row.country?.id,
        province_id: row.province_id || row.province?.id,
        districts_id: row.districts_id || row.districts?.id,
        reseller_group_id: row.reseller_group_id || 0,
        sub_reseller_limit: Number(row.sub_reseller_limit || 0),
        can_create_sub_resellers: flagOn(row.can_create_sub_resellers) ? 1 : 0,
        sub_resellers_can_create_sub_resellers: flagOn(row.sub_resellers_can_create_sub_resellers) ? 1 : 0,
        is_reseller_verified: Number(row.is_reseller_verified || 0),
        status: row.status === 0 || row.status === '0' ? 0 : Number(row.status || 1),
        loan_balance: String(row.loan_balance ?? 0),
        total_payments_received: String(row.total_payments_received ?? 0),
        total_balance_sent: String(row.total_balance_sent ?? 0),
        max_loan_balance_request_amount: Number(row.max_loan_balance_request_amount || 0),
        min_loan_balance_request_amount: Number(row.min_loan_balance_request_amount || 0),
        afg_custom_recharge_adjust_type: row.afg_custom_recharge_adjust_type || 'decrease',
        afg_custom_recharge_adjust_mode: row.afg_custom_recharge_adjust_mode || 'percentage',
        afg_custom_recharge_adjust_value: Number(row.afg_custom_recharge_adjust_value || 0),
        can_set_commission_group: flagOn(row.can_set_commission_group),
        can_set_selling_price_group: flagOn(row.can_set_selling_price_group),
        can_send_payment_request: flagOn(row.can_send_payment_request),
        can_ask_loan_balance: flagOn(row.can_ask_loan_balance),
        can_see_our_contact: flagOn(row.can_see_our_contact),
        can_see_parent_contact: flagOn(row.can_see_parent_contact),
        can_send_hawala: flagOn(row.can_send_hawala)
    };
    if (parentId !== undefined) payload.parent_id = parentId;
    else if ('parent_id' in row) payload.parent_id = row.parent_id ?? null;
    return payload;
}

export function ResellerMoneySheets({
    kind,
    onClose,
    reseller,
    toast,
    onSaved
}: DeskProps & { kind: MoneyKind | null; onClose: () => void; onSaved: (kind: MoneyKind) => void }) {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { paymentMethods } = useSelector((state: any) => state.paymentMethodsReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { hawalaBranches } = useSelector((state: any) => state.hawalaBranchReducer);
    const { hawala_currencies } = useSelector((state: any) => state.hawalaCurrenciesReducer);
    const [busy, setBusy] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [amount, setAmount] = useState<number | null>(null);
    const [operation, setOperation] = useState('credit');
    const [method, setMethod] = useState<PaymentMethod | null>(null);
    const [currency, setCurrency] = useState<Currency | null>(null);
    const [date, setDate] = useState(today());
    const [note, setNote] = useState('');
    const [sender, setSender] = useState('');
    const [receiver, setReceiver] = useState('');
    const [branch, setBranch] = useState<HawalaBranch | null>(null);
    const [commission, setCommission] = useState<number | null>(null);
    const [commissionPaidBy, setCommissionPaidBy] = useState<'sender' | 'receiver'>('sender');

    useEffect(() => {
        if (!kind) return;
        setSubmitted(false);
        setAmount(null);
        setOperation('credit');
        setMethod(null);
        setCurrency(null);
        setDate(today());
        setNote('');
        setSender(reseller.reseller_name || '');
        setReceiver('');
        setBranch(null);
        setCommission(null);
        setCommissionPaidBy('sender');
        dispatch(_fetchPaymentMethods());
        dispatch(_fetchCurrencies());
        dispatch(_fetchHawalaBranchList(1, ''));
        dispatch(_fetchHawalaCurrencies());
    }, [kind, dispatch, reseller.reseller_name]);

    const missing = (ok: boolean) => (submitted && !ok ? t('THIS_FIELD_IS_REQUIRED', { defaultValue: 'این فیلد لازم است' }) : null);

    const savePayment = async () => {
        setSubmitted(true);
        if (!amount || !operation || !method || !currency || !date || !note.trim()) return;
        setBusy(true);
        const ok = await dispatch(
            _addPayment(
                {
                    reseller,
                    payment_method: method,
                    currency,
                    amount: String(amount),
                    notes: note,
                    payment_date: date,
                    operation_type: operation
                } as any,
                toast,
                t
            )
        );
        setBusy(false);
        if (ok) {
            onSaved('payment');
            onClose();
        }
    };

    const saveBalance = async () => {
        setSubmitted(true);
        if (!amount || !operation || !currency || !note.trim()) return;
        setBusy(true);
        const ok = await dispatch(
            _addBalance(
                {
                    reseller,
                    transaction_type: operation,
                    amount: String(amount),
                    currency_id: currency.id,
                    description: note
                } as any,
                toast,
                t
            )
        );
        setBusy(false);
        if (ok) {
            onSaved('balance');
            onClose();
        }
    };

    const wallet = reseller.currency && typeof reseller.currency === 'object' ? reseller.currency : null;
    const walletId = Number(wallet?.id || (reseller as any).currency_preference_id || 0);
    const walletCode = wallet?.code || wallet?.symbol || '';
    const commissionAmount = Math.max(0, Number(commission || 0));
    const hawalaQuote = useMemo(
        () =>
            quoteHawalaDebit(
                walletId,
                Number(currency?.id || 0),
                Number(amount || 0),
                hawala_currencies || [],
                walletCode,
                commissionAmount,
                currency?.code,
                commissionPaidBy
            ),
        [walletId, walletCode, currency?.id, currency?.code, amount, hawala_currencies, commissionAmount, commissionPaidBy]
    );
    const formatQuote = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 4 });

    const saveHawala = async () => {
        setSubmitted(true);
        if (
            !sender.trim() ||
            !receiver.trim() ||
            !amount ||
            !currency ||
            !branch?.id ||
            hawalaQuote.missingRate ||
            hawalaQuote.invalidCommission ||
            hawalaQuote.debit == null
        ) {
            return;
        }
        setBusy(true);
        const ok = await dispatch(
            _addHawala(
                {
                    reseller_id: reseller.id,
                    hawala_branch_id: branch.id,
                    sender_name: sender,
                    receiver_name: receiver,
                    hawala_amount: amount,
                    hawala_amount_currency_id: currency.id,
                    commission_amount: commissionAmount,
                    commission_paid_by_sender: commissionPaidBy === 'sender',
                    commission_paid_by_receiver: commissionPaidBy === 'receiver',
                    admin_note: note || null
                },
                toast,
                t
            )
        );
        setBusy(false);
        if (ok) {
            onSaved('hawala');
            onClose();
        }
    };

    return (
        <>
            <FormSheet
                open={kind === 'payment'}
                onOpenChange={(open) => !open && onClose()}
                title={t('RESELLER.PROFILE.ADD_PAYMENT', { defaultValue: 'ثبت پرداخت' })}
                description={reseller.reseller_name}
                size="md"
                side="left"
                footer={<FormActions onCancel={onClose} onSubmit={savePayment} loading={busy} submitLabel={t('RESELLER.PROFILE.ADD_PAYMENT', { defaultValue: 'ثبت پرداخت' })} />}
            >
                <FormSection>
                    <FormField label={t('BALANCE.FORM.RESELLER.LABEL', { defaultValue: 'فروشنده' })}>
                        <Input value={reseller.reseller_name || ''} disabled />
                    </FormField>
                    <FormField label={t('PAYMENT.FORM.INPUT.AMOUNT', { defaultValue: 'مبلغ' })} required error={missing(!!amount)}>
                        <NumberInput value={amount} onValueChange={setAmount} min={0.01} step={0.01} />
                    </FormField>
                    <FormField label={t('PAYMENT.FORM.INPUT.OPRATIONTYPE', { defaultValue: 'نوع' })} required error={missing(!!operation)}>
                        <Select value={operation} onValueChange={setOperation}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credit">{t('CREDIT', { defaultValue: 'بستانکار' })}</SelectItem>
                                <SelectItem value="debit">{t('DEBIT', { defaultValue: 'بدهکار' })}</SelectItem>
                                <SelectItem value="credit_full">{t('CREDIT_FULL', { defaultValue: 'بستانکار کامل' })}</SelectItem>
                                <SelectItem value="debit_full">{t('DEBIT_FULL', { defaultValue: 'بدهکار کامل' })}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('PAYMENT.FORM.INPUT.PAYMENTMETHOD', { defaultValue: 'روش پرداخت' })} required error={missing(!!method)}>
                        <SearchSelect value={method} options={paymentMethods || []} onChange={setMethod} optionLabel="method_name" returnFullObject placeholder={t('RESELLER.PROFILE.SELECT_METHOD', { defaultValue: 'انتخاب روش' })} />
                    </FormField>
                    <FormField label={t('PAYMENT.FORM.INPUT.CURRENCY', { defaultValue: 'ارز' })} required error={missing(!!currency)}>
                        <SearchSelect value={currency} options={currencies || []} onChange={setCurrency} optionLabel="code" returnFullObject placeholder={t('SELECT_CURRENCY', { defaultValue: 'انتخاب ارز' })} />
                    </FormField>
                    <FormField label={t('PAYMENT.FORM.INPUT.PAYMENTDATE', { defaultValue: 'تاریخ' })} required error={missing(!!date)}>
                        <DateField value={date} onValueChange={setDate} />
                    </FormField>
                    <FormField label={t('PAYMENT.FORM.INPUT.NOTES', { defaultValue: 'یادداشت' })} required error={missing(!!note.trim())} fullWidth>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
                    </FormField>
                </FormSection>
            </FormSheet>

            <FormSheet
                open={kind === 'balance'}
                onOpenChange={(open) => !open && onClose()}
                title={t('RESELLER.PROFILE.ADD_BALANCE', { defaultValue: 'ثبت موجودی' })}
                description={reseller.reseller_name}
                size="md"
                side="left"
                footer={<FormActions onCancel={onClose} onSubmit={saveBalance} loading={busy} submitLabel={t('RESELLER.PROFILE.ADD_BALANCE', { defaultValue: 'ثبت موجودی' })} />}
            >
                <FormSection>
                    <FormField label={t('BALANCE.FORM.RESELLER.LABEL', { defaultValue: 'فروشنده' })}>
                        <Input value={reseller.reseller_name || ''} disabled />
                    </FormField>
                    <FormField label={t('BALANCE.FORM.INPUT.AMOUNT', { defaultValue: 'مبلغ' })} required error={missing(!!amount)}>
                        <NumberInput value={amount} onValueChange={setAmount} min={0.01} step={0.01} />
                    </FormField>
                    <FormField label={t('BALANCE.FORM.INPUT.TRANSACTIONTYPE', { defaultValue: 'نوع تراکنش' })} required error={missing(!!operation)}>
                        <Select value={operation} onValueChange={setOperation}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credit">{t('CREDIT', { defaultValue: 'واریز' })}</SelectItem>
                                <SelectItem value="debit">{t('DEBIT', { defaultValue: 'برداشت' })}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('CURRENCY', { defaultValue: 'ارز' })} required error={missing(!!currency)}>
                        <SearchSelect value={currency} options={currencies || []} onChange={setCurrency} optionLabel="code" returnFullObject placeholder={t('SELECT_CURRENCY', { defaultValue: 'انتخاب ارز' })} />
                    </FormField>
                    <FormField label={t('DESCRIPTION', { defaultValue: 'شرح' })} required error={missing(!!note.trim())} fullWidth>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
                    </FormField>
                </FormSection>
            </FormSheet>

            <FormSheet
                open={kind === 'hawala'}
                onOpenChange={(open) => !open && onClose()}
                title={t('RESELLER.PROFILE.ADD_HAWALA', { defaultValue: 'ثبت حواله' })}
                description={reseller.reseller_name}
                size="full"
                side="left"
                footer={
                    <FormActions
                        onCancel={onClose}
                        onSubmit={saveHawala}
                        loading={busy}
                        submitDisabled={Boolean(amount && currency && (hawalaQuote.missingRate || hawalaQuote.invalidCommission))}
                        submitLabel={t('RESELLER.PROFILE.ADD_HAWALA', { defaultValue: 'ثبت حواله' })}
                    />
                }
            >
                <FormSection className="gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField label={t('RESELLER.PROFILE.WALLET_BALANCE', { defaultValue: 'موجودی کیف' })}>
                        <Input value={`${formatQuote(Number(reseller.balance || 0))} ${currencyFaName(wallet)}`} disabled />
                    </FormField>
                    <FormField label={t('SENDER_NAME', { defaultValue: 'فرستنده' })} required error={missing(!!sender.trim())}>
                        <Input value={sender} onChange={(e) => setSender(e.target.value)} />
                    </FormField>
                    <FormField label={t('RECEIVER_NAME', { defaultValue: 'گیرنده' })} required error={missing(!!receiver.trim())}>
                        <Input value={receiver} onChange={(e) => setReceiver(e.target.value)} />
                    </FormField>
                    <FormField label={t('HAWALA_AMOUNT', { defaultValue: 'مبلغ حواله' })} required error={missing(!!amount)}>
                        <NumberInput value={amount} onValueChange={setAmount} min={0.01} step={0.01} />
                    </FormField>
                    <FormField
                        label={t('CURRENCY', { defaultValue: 'ارز' })}
                        required
                        error={
                            missing(!!currency) ||
                            (submitted && hawalaQuote.missingRate
                                ? t('RESELLER.PROFILE.NO_BOARD_RATE', { defaultValue: 'نرخ این جفت ارز در تابلو ثبت نشده' })
                                : undefined)
                        }
                    >
                        <SearchSelect
                            value={currency}
                            options={currencies || []}
                            onChange={setCurrency}
                            optionLabel="code"
                            returnFullObject
                            placeholder={t('SELECT_CURRENCY', { defaultValue: 'انتخاب ارز' })}
                        />
                    </FormField>
                    <FormField
                        label={t('COMMISSION_AMOUNT', { defaultValue: 'کارمزد' })}
                        error={
                            hawalaQuote.invalidCommission
                                ? t('HAWALA_COMMISSION_TOO_HIGH', { defaultValue: 'کارمزد باید کمتر از مبلغ حواله باشد' })
                                : null
                        }
                    >
                        <NumberInput value={commission} onValueChange={setCommission} min={0} step={0.01} />
                    </FormField>
                    <FormField label={t('COMMISSION_PAID_BY', { defaultValue: 'کارمزد توسط' })}>
                        <div className="flex flex-wrap items-center gap-3 pt-1.5">
                            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                                <input
                                    type="radio"
                                    name="deskCommissionPaidBy"
                                    value="sender"
                                    checked={commissionPaidBy === 'sender'}
                                    onChange={() => setCommissionPaidBy('sender')}
                                />
                                {t('SENDER', { defaultValue: 'فرستنده' })}
                            </label>
                            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                                <input
                                    type="radio"
                                    name="deskCommissionPaidBy"
                                    value="receiver"
                                    checked={commissionPaidBy === 'receiver'}
                                    onChange={() => setCommissionPaidBy('receiver')}
                                />
                                {t('RECEIVER', { defaultValue: 'گیرنده' })}
                            </label>
                        </div>
                    </FormField>
                    <FormField label={t('BRANCH', { defaultValue: 'شعبه' })} required error={missing(!!branch)}>
                        <SearchSelect
                            value={branch}
                            options={hawalaBranches || []}
                            onChange={setBranch}
                            optionLabel="name"
                            returnFullObject
                            placeholder={t('RESELLER.PROFILE.SELECT_BRANCH', { defaultValue: 'انتخاب شعبه' })}
                        />
                    </FormField>
                    {(hawalaQuote.debit != null || hawalaQuote.payout != null || hawalaQuote.missingRate || hawalaQuote.invalidCommission) && (
                        <div className="col-span-full rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                                {hawalaQuote.debit != null ? (
                                    <div className="text-sm">
                                        <div className="text-[11px] text-muted-foreground">
                                            {t('RESELLER.PROFILE.DEBIT_FROM_BALANCE', { defaultValue: 'از موجودی کم می‌شود' })}
                                        </div>
                                        <div className="font-semibold tabular-nums">
                                            {formatQuote(hawalaQuote.debit)} {currencyFaName(wallet)}
                                        </div>
                                    </div>
                                ) : null}
                                {hawalaQuote.payout != null ? (
                                    <div className="text-sm">
                                        <div className="text-[11px] text-muted-foreground">
                                            {t('RESELLER.PROFILE.RECEIVER_GETS', { defaultValue: 'گیرنده می‌گیرد' })}
                                        </div>
                                        <div className="font-semibold tabular-nums text-emerald-800">
                                            {formatQuote(hawalaQuote.payout)} {currencyFaName({ code: hawalaQuote.payoutCurrencyCode })}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            {commissionPaidBy === 'receiver' && commissionAmount > 0 && hawalaQuote.payout != null ? (
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    {t('HAWALA_RECEIVER_PAYS_HINT', {
                                        defaultValue: 'کارمزد از مبلغ حواله کم می‌شود؛ گیرنده مبلغ خالص را می‌گیرد'
                                    })}
                                </p>
                            ) : null}
                            {hawalaQuote.missingRate ? (
                                <p className="mt-1 text-[11px] text-destructive">
                                    {t('RESELLER.PROFILE.NO_BOARD_RATE', { defaultValue: 'نرخ این جفت ارز در تابلو ثبت نشده' })}
                                </p>
                            ) : null}
                        </div>
                    )}
                    <FormField label={t('NOTE', { defaultValue: 'یادداشت' })} fullWidth>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
                    </FormField>
                </FormSection>
            </FormSheet>
        </>
    );
}

const PERMISSIONS: { key: string; labelKey: string; fallback: string; numeric?: boolean }[] = [
    { key: 'can_create_sub_resellers', labelKey: 'RESELLER.FORM.LABEL.CANCREATESUBRESELLER', fallback: 'می‌تواند زیرفروشنده ایجاد کند', numeric: true },
    { key: 'sub_resellers_can_create_sub_resellers', labelKey: 'RESELLER.FORM.LABEL.SUBRESELLERCANCREATESUBRESELLER', fallback: 'زیرفروشنده می‌تواند زیرفروشنده ایجاد کند', numeric: true },
    { key: 'can_set_commission_group', labelKey: 'RESELLER.FORM.LABEL.CAN_SET_COMMISSION_GROUP', fallback: 'می‌تواند گروه کمیسیون را تنظیم کند' },
    { key: 'can_set_selling_price_group', labelKey: 'RESELLER.FORM.LABEL.CAN_SET_SELLING_PRICE_GROUP', fallback: 'می‌تواند گروه قیمت فروش را تنظیم کند' },
    { key: 'can_send_payment_request', labelKey: 'RESELLER.FORM.LABEL.CAN_SEND_PAYMENT_REQUEST', fallback: 'می‌تواند درخواست پرداخت ارسال کند' },
    { key: 'can_ask_loan_balance', labelKey: 'RESELLER.FORM.LABEL.CAN_ASK_LOAN_BALANCE', fallback: 'می‌تواند موجودی وام را درخواست کند' },
    { key: 'can_see_our_contact', labelKey: 'RESELLER.FORM.LABEL.CAN_SEE_OUR_CONTACT', fallback: 'می‌تواند اطلاعات تماس ما را ببیند' },
    { key: 'can_see_parent_contact', labelKey: 'RESELLER.FORM.LABEL.CAN_SEE_PARENT_CONTACT', fallback: 'می‌تواند اطلاعات تماس والد را ببیند' },
    { key: 'can_send_hawala', labelKey: 'RESELLER.FORM.LABEL.CAN_SEND_HAWALA', fallback: 'می‌تواند حواله ارسال کند' }
];

export function ResellerSettingsPanel({ reseller, toast }: DeskProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { reseller_groups } = useSelector((state: any) => state.resellerGroupReducer);
    const [form, setForm] = useState<any>(() => editPayload(reseller));
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        dispatch(_fetchResellerGroups());
    }, [dispatch]);

    useEffect(() => {
        setForm(editPayload(reseller));
    }, [reseller]);

    const set = (patch: Record<string, unknown>) => setForm((prev: any) => ({ ...prev, ...patch }));

    const save = async () => {
        setBusy(true);
        const ok = await dispatch(_editReseller(Number(reseller.id), form, toast, t));
        setBusy(false);
        if (ok) dispatch(_getResellerById(Number(reseller.id)));
    };

    return (
        <section className="waslat-panel space-y-4 p-4">
            <h3 className="text-sm font-semibold">{t('RESELLER.PROFILE.GROUPS_AND_LIMITS', { defaultValue: 'گروه و سقف‌ها' })}</h3>
            <FormSection>
                <FormField label={t('RESELLER.FORM.LABEL.RESELLERGROUP', { defaultValue: 'گروه فروشنده' })}>
                    <SearchSelect
                        value={(reseller_groups || []).find((group: ResellerGroup) => group.id === form.reseller_group_id) || null}
                        options={reseller_groups || []}
                        onChange={(selected: ResellerGroup | null) => set({ reseller_group_id: selected?.id ?? 0 })}
                        optionLabel="name"
                        returnFullObject
                        placeholder={t('RESELLER.PROFILE.SELECT_GROUP', { defaultValue: 'انتخاب گروه' })}
                    />
                </FormField>
                <FormField label={t('RESELLER.FORM.LABEL.SUBRESELLERLIMIT', { defaultValue: 'سقف زیرفروشنده' })}>
                    <NumberInput value={Number(form.sub_reseller_limit) || 0} onValueChange={(v) => set({ sub_reseller_limit: v ?? 0 })} min={0} />
                </FormField>
                <FormField label={t('RESELLER.FORM.PLACEHOLDER.MIN_LOAN_BALANCE_REQUEST_AMOUNT', { defaultValue: 'حداقل درخواست قرض' })}>
                    <NumberInput value={Number(form.min_loan_balance_request_amount) || 0} onValueChange={(v) => set({ min_loan_balance_request_amount: v ?? 0 })} min={0} />
                </FormField>
                <FormField label={t('RESELLER.FORM.PLACEHOLDER.MAX_LOAN_BALANCE_REQUEST_AMOUNT', { defaultValue: 'حداکثر درخواست قرض' })}>
                    <NumberInput value={Number(form.max_loan_balance_request_amount) || 0} onValueChange={(v) => set({ max_loan_balance_request_amount: v ?? 0 })} min={0} />
                </FormField>
            </FormSection>
            <h3 className="text-sm font-semibold">{t('RESELLER.PROFILE.AFG_RECHARGE', { defaultValue: 'تنظیم شارژ افغانستان' })}</h3>
            <FormSection>
                <FormField label={t('RECHARGE_ADJUST_TYPE', { defaultValue: 'نوع' })}>
                    <Select value={form.afg_custom_recharge_adjust_type} onValueChange={(v) => set({ afg_custom_recharge_adjust_type: v })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="increase">{t('INCREASE', { defaultValue: 'افزایش' })}</SelectItem>
                            <SelectItem value="decrease">{t('DECREASE', { defaultValue: 'کاهش' })}</SelectItem>
                        </SelectContent>
                    </Select>
                </FormField>
                <FormField label={t('RECHARGE_ADJUST_MODE', { defaultValue: 'حالت' })}>
                    <Select value={form.afg_custom_recharge_adjust_mode} onValueChange={(v) => set({ afg_custom_recharge_adjust_mode: v })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">{t('PERCENTAGE', { defaultValue: 'درصد' })}</SelectItem>
                            <SelectItem value="fixed">{t('FIXED', { defaultValue: 'مبلغ ثابت' })}</SelectItem>
                        </SelectContent>
                    </Select>
                </FormField>
                <FormField label={t('RECHARGE_ADJUST_VALUE', { defaultValue: 'مقدار' })}>
                    <NumberInput value={Number(form.afg_custom_recharge_adjust_value) || 0} onValueChange={(v) => set({ afg_custom_recharge_adjust_value: v ?? 0 })} min={0} />
                </FormField>
            </FormSection>
            <h3 className="text-sm font-semibold">{t('RESELLER.PROFILE.PERMISSIONS', { defaultValue: 'دسترسی‌ها' })}</h3>
            <FormSection>
                {PERMISSIONS.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2.5 sm:col-span-2">
                        <label htmlFor={item.key} className="text-sm font-medium">
                            {t(item.labelKey, { defaultValue: item.fallback })}
                        </label>
                        <Switch
                            id={item.key}
                            checked={flagOn(form[item.key])}
                            onCheckedChange={(value) => set({ [item.key]: item.numeric ? (value ? 1 : 0) : value })}
                        />
                    </div>
                ))}
            </FormSection>
            <div className="flex justify-end">
                <Button type="button" onClick={save} disabled={busy}>
                    {busy ? t('SAVING', { defaultValue: 'در حال ذخیره...' }) : t('RESELLER.PROFILE.SAVE_SETTINGS', { defaultValue: 'ذخیره تنظیمات' })}
                </Button>
            </div>
        </section>
    );
}

export function ResellerParentSheet({ reseller, toast, open, onClose }: DeskProps & { open: boolean; onClose: () => void }) {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { resellers, loading } = useSelector((state: any) => state.resellerReducer);
    const [picked, setPicked] = useState<Reseller | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (open) {
            setPicked(null);
            dispatch(_fetchResellers(1, '', {}, 20));
        }
    }, [open, dispatch]);

    const choices = (resellers || []).filter((row: Reseller) => row.id !== reseller.id);

    const save = async (parentId: number | null) => {
        setBusy(true);
        const ok = await dispatch(_editReseller(Number(reseller.id), editPayload(reseller, parentId), toast, t));
        setBusy(false);
        if (ok) {
            dispatch(_getResellerById(Number(reseller.id)));
            onClose();
        }
    };

    return (
        <FormSheet
            open={open}
            onOpenChange={(next) => !next && onClose()}
            title={t('RESELLER.PROFILE.PARENT_TITLE', { defaultValue: 'والد این فروشنده' })}
            description={reseller.reseller_name}
            size="md"
            side="left"
            footer={<FormActions onCancel={onClose} onSubmit={() => save(picked?.id ? Number(picked.id) : null)} loading={busy} submitDisabled={!picked} submitLabel={t('RESELLER.PROFILE.SET_UNDER_PARENT', { defaultValue: 'گذاشتن زیر این والد' })} />}
        >
            <FormSection>
                <FormField label={t('RESELLER.PROFILE.NEW_PARENT', { defaultValue: 'والد جدید' })} fullWidth>
                    <SearchSelect
                        value={picked}
                        options={choices}
                        onChange={setPicked}
                        optionLabel="reseller_name"
                        returnFullObject
                        isLoading={loading}
                        onSearch={(term) => dispatch(_fetchResellers(1, term, {}, 20))}
                        placeholder={t('RESELLER.PROFILE.SEARCH_RESELLER', { defaultValue: 'جستجوی فروشنده' })}
                    />
                </FormField>
                <div className="sm:col-span-2">
                    <Button type="button" variant="outline" disabled={busy} onClick={() => save(null)}>
                        {t('RESELLER.PROFILE.NO_PARENT', { defaultValue: 'بدون والد، سطح بالا' })}
                    </Button>
                </div>
            </FormSection>
        </FormSheet>
    );
}

export function ResellerAttachSheet({
    resellerId,
    toast,
    open,
    onClose,
    onSaved
}: {
    resellerId: number;
    toast: React.RefObject<Toast>;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { resellers, loading } = useSelector((state: any) => state.resellerReducer);
    const [picked, setPicked] = useState<Reseller | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (open) {
            setPicked(null);
            dispatch(_fetchResellers(1, '', {}, 20));
        }
    }, [open, dispatch]);

    const choices = (resellers || []).filter((row: Reseller) => row.id !== resellerId);

    const save = async () => {
        if (!picked?.id) return;
        setBusy(true);
        try {
            const token = localStorage.getItem('api_token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${picked.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const row = response.data?.data?.reseller;
            const ok = await dispatch(_editReseller(Number(picked.id), editPayload(row, resellerId), toast, t));
            if (ok) {
                onSaved();
                onClose();
            }
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR', { defaultValue: 'خطا' }),
                detail: error?.response?.data?.message || t('RESELLER.PROFILE.LOAD_FAILED', { defaultValue: 'خواندن فروشنده ناموفق بود' }),
                life: 3000
            });
        } finally {
            setBusy(false);
        }
    };

    return (
        <FormSheet
            open={open}
            onOpenChange={(next) => !next && onClose()}
            title={t('RESELLER.PROFILE.ATTACH_TITLE', { defaultValue: 'آوردن فروشنده زیر این نماینده' })}
            size="md"
            side="left"
            footer={<FormActions onCancel={onClose} onSubmit={save} loading={busy} submitDisabled={!picked} submitLabel={t('RESELLER.PROFILE.MOVE_UNDER', { defaultValue: 'انتقال به زیرمجموعه' })} />}
        >
            <FormSection>
                <FormField label={t('RESELLER.PROFILE.EXISTING_RESELLER', { defaultValue: 'فروشنده موجود' })} fullWidth>
                    <SearchSelect
                        value={picked}
                        options={choices}
                        onChange={setPicked}
                        optionLabel="reseller_name"
                        returnFullObject
                        isLoading={loading}
                        onSearch={(term) => dispatch(_fetchResellers(1, term, {}, 20))}
                        placeholder={t('RESELLER.PROFILE.SEARCH_RESELLER', { defaultValue: 'جستجوی فروشنده' })}
                    />
                </FormField>
            </FormSection>
        </FormSheet>
    );
}

const HAWALA_STATUS: Record<string, string> = {
    pending: 'ORDER.STATUS.PENDING',
    confirmed: 'ORDER.STATUS.CONFIRMED',
    rejected: 'ORDER.STATUS.REJECTED',
    under_process: 'ORDER.STATUS.UNDER_PROCESS',
    cancelled: 'ORDER.STATUS.CANCELLED'
};

export function ResellerHawalaList({ resellerId, refreshKey }: { resellerId: number; refreshKey: number }) {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('api_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page: 1, items_per_page: 20, reseller_id: resellerId }
                });
                const all = response.data?.data?.hawalas || [];
                if (alive) {
                    setRows(all.filter((row: any) => Number(row.reseller_id ?? row.reseller?.id) === Number(resellerId)));
                }
            } catch {
                if (alive) setRows([]);
            } finally {
                if (alive) setLoading(false);
            }
        };
        load();
        return () => {
            alive = false;
        };
    }, [resellerId, refreshKey]);

    const { t } = useTranslation();
    if (loading) return <div className="waslat-panel p-4 text-sm text-muted-foreground">{t('RESELLER.PROFILE.HAWALA_LOADING', { defaultValue: 'در حال بارگذاری حواله‌ها...' })}</div>;
    if (!rows.length) return <div className="waslat-panel p-4 text-sm text-muted-foreground">{t('RESELLER.PROFILE.HAWALA_EMPTY', { defaultValue: 'حواله‌ای برای این فروشنده نیست.' })}</div>;

    return (
        <div className="waslat-panel overflow-x-auto">
            <table className="w-full min-w-[36rem] text-start text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
                    <tr>
                        <th className="px-3 py-2 font-medium">{t('HAWALA.TABLE.COLUMN.HAWALA_NUMBER', { defaultValue: 'شماره' })}</th>
                        <th className="px-3 py-2 font-medium">{t('HAWALA.TABLE.COLUMN.SENDER_NAME', { defaultValue: 'فرستنده' })}</th>
                        <th className="px-3 py-2 font-medium">{t('HAWALA.TABLE.COLUMN.RECEIVER_NAME', { defaultValue: 'گیرنده' })}</th>
                        <th className="px-3 py-2 font-medium">{t('HAWALA.TABLE.COLUMN.AMOUNT', { defaultValue: 'مبلغ' })}</th>
                        <th className="px-3 py-2 font-medium">{t('HAWALA.TABLE.COLUMN.STATUS', { defaultValue: 'وضعیت' })}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="border-b border-border/70">
                            <td className="px-3 py-2">{row.hawala_number || row.id}</td>
                            <td className="px-3 py-2">{row.sender_name}</td>
                            <td className="px-3 py-2">{row.receiver_name}</td>
                            <td className="px-3 py-2 tabular-nums">{row.hawala_amount}</td>
                            <td className="px-3 py-2">{HAWALA_STATUS[row.status] ? t(HAWALA_STATUS[row.status]) : row.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
