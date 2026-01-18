export interface Admin {
    id: number;
    user_id: number;
    name: string;
    email: string;
    phone: string;
    user_type: string;
    email_verified_at: string | null;
    profile_image_url: string;
    status: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    ignore_digits_count: string;
    exchange_rate_per_usd: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserInfo {
    id: number;
    uuid: string;
    name: string;
    email: string;
    phone: string;
    user_type: string;
    email_verified_at: string | null;
    currency_preference_code: string;
    currency_preference_id: number;
    fcm_token: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    admin: Admin | null;
    currency: Currency | null;
}

export interface Bundle {
    id: number;
    bundle_code: string;
    service_id: number;
    bundle_title: string;
    bundle_description: string;
    bundle_type: string | null;
    validity_type: string;
    admin_buying_price: string;
    buying_price: string;
    selling_price: string;
    amount: string | null;
    bundle_image_url: string | null;
    currency_id: number;
    expired_date: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    service: Service | null;
    currency: Currency | null;
    api_provider_id?: number | string | null,
    api_provider_bundle_id?: number | string | null,
    api_binding?: ApiBinding | null | string
}

export interface ApiBinding {
    product_type: string;
    operator: string;
    internet_type: string;
    sim_type: string;
    product_id: number | string;
    table_id: number | string;
    name: string;
    days: number | string;
    volume: number | string;
    unit: string;
    periodicity: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
    page: number | null;
}

export interface Pagination {
    page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    links: PaginationLink[];
    items_per_page: number;
    total: number;
}

export interface CompanyCode {
    id: number;
    company_id: number;
    reserved_digit: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    company: Company | null;
}

export interface Telegram_Chat_Id {
    id: number,
    chat_id: number,
    group_name: string,
    created_at: string,
    updated_at: string
}

export interface Company {
    id: number;
    company_name: string;
    company_logo: File | string;
    country_id: number | null;
    telegram_chat_id: Telegram_Chat_Id | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    country: Country | null;
    input_form_schema?: string | CustomField[] | null
}

export interface Country {
    id: number;
    country_name: string;
    country_flag_image_url: string | File;
    language_id: number;
    country_telecom_code: string;
    phone_number_length: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    currency: Currency | null;
    language: Language | null
    currency_id: number
}

export interface Language {
    id: number;
    language_name: string;
    language_code: string;
    direction: 'rtl' | 'ltr';
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    ignore_digits_count: string;
    exchange_rate_per_usd: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface MoneyTransaction {
    id: number;
    reseller_id: number;
    amount: string;
    remaining_balance: string | null;
    transaction_type: string | null;
    transaction_source: string | null;
    currency_code: string | null;
    currency_id: number;
    status: string;
    initiator_id: number;
    initiator_type: string;
    transaction_reason: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    sub_reseller_id: string | null;
    reseller: Reseller | null;
    currency: Currency | null;
    order?: Order;
}

export interface Reseller {
    id: number;
    user_id: number;
    parent_id: number | null;
    uuid: string;
    reseller_name: string;
    contact_name: string;
    reseller_type: string;
    email_verified_at: string | null;
    account_password: string;
    personal_pin: string;
    remember_token: string | null;
    profile_image_url: string | File;
    email: string;
    phone: string;
    country_id: number | string;
    province_id: number | string;
    districts_id: number | string;
    is_reseller_verified: number;
    status: number;
    payment: string;
    balance: number;
    loan_balance: string;
    total_payments_received: string;
    total_balance_sent: string;
    net_payment_balance: string;
    fcm_token: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user: User | null;
    code: Currency | string | null,
    country?: Country | null | string;
    province: string | null;
    district: string | null;
    reseller_group_id: number,
    can_create_sub_resellers: number,
    sub_reseller_limit: number | string,
    sub_resellers_can_create_sub_resellers: number,
    total_earning_balance?: number | string,
    parent_reseller_id?: number | null | string,
    parent_reseller_name?: string | null,
    parent_reseller_profile_image_url?: string | null,
    parent_reseller_phone?: string | null
    reseller_identity_attachment?: File | string | null,
    extra_optional_proof?: File | string | null,
    can_set_commission_group?: boolean,
    can_set_selling_price_group?: boolean,
    can_send_payment_request?: boolean,
    can_ask_loan_balance?: boolean,
    can_see_our_contact?: boolean,
    can_see_parent_contact?: boolean,
    can_send_hawala?: boolean,
    max_loan_balance_request_amount?: number | string,
    min_loan_balance_request_amount?: number | string,
    afg_custom_recharge_adjust_type: string;
    afg_custom_recharge_adjust_mode: string;
    afg_custom_recharge_adjust_value: number;
}

export interface User {
    id: number;
    uuid: string;
    name: string;
    email: string;
    phone: string;
    user_type: string;
    email_verified_at: string | null;
    currency_preference_code: string;
    currency_preference_id: number;
    fcm_token: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    currency: Currency | null;
    roles?: Roles[] | null,
    password?: string,
    confirm_password?: string
}

// export interface PaymentMethod {
//     id: number;
//     method_name: string;
//     account_details: string;
//     account_image: File | string;
//     status: number;
//     created_at: string;
//     updated_at: string;
// }

export interface PaymentMethod {
    id: number;
    method_name: string;
    account_details: string;
    account_image: File | string;
    status: number;
    created_at: string;
    updated_at: string;
    
    // New fields from migration (nullable)
    bank_name?: string | null;
    account_holder_name?: string | null;
    card_number?: string | null;
    account_number?: string | null;
    sheba_number?: string | null;
    
    
    
    // New notes field from migration
    notes?: string | null;
    
   
}

export interface Supplier {
    id: number;
    supplier_name: string;
    contact_details: string | null;
    address: string;
    status: number;
    created_at: string;
    updated_at: string;
}

export interface PurchasedProduct {
    id: number;
    supplier_id: number;
    service_id: number;
    product_name: string;
    quantity: number;
    purchase_price: string;
    purchase_date: string;
    status: number;
    created_at: string;
    updated_at: string;
    supplier: Supplier | null;
    service: Service | null;
}

export interface ServiceCategory {
    id: number;
    category_name: string;
    type: string;
    service_category_sub_type_id: number | null;
    category_image_url: string | File;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    input_form_schema?: string | CustomField[] | null
}

export interface Service {
    id: number;
    service_category_id: number;
    service_name: string,
    company_id: number;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    service_category: ServiceCategory | null;
    company: Company | null;
    input_form_schema?: string | CustomField[] | null;
    telegram_chat_id?: Telegram_Chat_Id | null;
}

export interface Supplier {
    id: number;
    supplier_name: string;
    contact_details: string | null;
    address: string;
    status: number;
    created_at: string;
    updated_at: string;
}

export interface TelegramChat {
    id: number;
    chat_id: number;
    group_name: string;
    created_at: string;
    updated_at: string;
}


export interface Province {
    id: number,
    province_name: string,
    country_id: number,
    deleted_at: string,
    created_at: string,
    updated_at: string,
    country: Country | null
}

export interface District {
    id: number,
    district_name: string,
    province_id: number,
    delete_at: string,
    created_at: string,
    updated_at: string,
    province: Province | null
}


export interface Order {
    id: number;
    reseller_id: number;
    rechargeble_account: string;
    bundle: Bundle | null;
    is_custom_recharge: number;
    order_type: string;
    transaction_id: string | null;
    is_paid: number;
    status: number | string | null;
    reject_reason: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    vpn_activation_qr_code_image: string | null;
    vpn_activation_link: string | null;
    reseller: Reseller | null;
    performed_by_name?: string | null
}


export interface Advertisement {
    id: number,
    advertisement_title: string,
    ad_slider_image_url: string | File,
    status: number,
    deleted_at: string | null,
    created_at: string | null,
    updated_at: string | null
}


export interface Balance {
    id: number,
    reseller_id: number,
    transaction_type: string,
    payment_id: number | null,
    amount: string,
    remaining_balance: string,
    currency_id: number,
    description: string,
    created_at: string,
    updated_at: string,
    reseller: Reseller | null,
    currency: Currency | null,
    payment_method_id?: number | null,
    payment_amount?: string,
    payment_currency_id?: number,
    payment_status?: string,
    payment_notes?: string,
    payment_date?: string,
    performed_by_name?: string | null,
    status?: string | null,
    is_reseller_loan_request?: string | null
}

export interface Payment {
    id: number,
    reseller_id: number,
    payment_method_id: number,
    amount: string,
    remaining_payment_amount: string,
    currency_id: number,
    transaction_id: number | null,
    status: string,
    notes: string,
    payment_date: string,
    created_at: string,
    updated_date: string,
    reseller: Reseller | null,
    payment_method: PaymentMethod | null,
    currency: Currency | null,
    performed_by_name?: string | null,
    operation_type?: string | null,
    payment_image?: string | null,
    extra_image_1?: string | null,
    extra_image_2?: string | null
}

export interface Roles {
    id: number,
    name: string,
    guard_name: string,
    created_at: string,
    updated_at: string
}


export interface ResellerGroup {
    id: number,
    name: string,
    discount_type: string,
    discount_value: string,
    can_create_sub_resellers: number,
    can_sub_reseller_create_subs: number,
    sub_reseller_limit: number | string,
    status: string,
    notes: string,
    created_at: string,
    updated_at: string,
    afg_custom_recharge_adjust_type: string;
    afg_custom_recharge_adjust_mode: string;
    afg_custom_recharge_adjust_value: number;
}

export interface Permission {
    id: number,
    name: string,
    guard_name: string,
    created_at: string,
    updated_at: string,
    pivot: null
}

export interface GroupDiscount {
    id: number,
    reseller_group_id: number,
    service_id: number,
    bundle_id: number,
    discount_type: string,
    discount_value: string,
    created_at: string | null,
    updated_at: string | null,
    reseller_group: ResellerGroup | null,
    service: Service | null,
    bundle: Bundle | null
}

export interface HawalaBranch {
    id?: number,
    name?: string,
    email?: string,
    password?: string,
    address?: string,
    phone_number?: string,
    commission_type?: 'percentage' | 'fixed',
    amount?: number,
    status?: 'active' | 'inactive',

}

export interface Hawala {
    id?: number | string;
    reseller_id?: number | string;
    reseller?: Reseller | null;

    hawala_number?: string;
    sender_name?: string;
    receiver_name?: string;
    receiver_father_name?: string | null;
    receiver_id_card_number?: string | null;

    hawala_amount?: string | number;
    hawala_amount_currency_id?: number | string;
    hawala_amount_currency_code?: string;
    hawala_amount_currency_rate?: string | number;

    reseller_prefered_currency_id?: number | string;
    reseller_prefered_currency_code?: string;
    reseller_prefered_currency_rate?: string | number;

    converted_amount_taken_from_reseller?: string | number;

    commission_amount?: string | number;
    commission_paid_by_sender?: boolean;
    commission_paid_by_receiver?: boolean;

    reseller_commission_share?: string | number | null;
    branch_commission_share?: string | number | null;
    admin_commission_share?: string | number | null;

    admin_note?: string | null;
    branch?: HawalaBranch | null; // Replace `any` with your `Branch` type if available
    hawala_branch_id?: number | string | null;

    status?: string | number;
    is_paid?: boolean | number;

    rechargeble_account?: string;
    transaction_id?: string | number | null;
    bundle?: Bundle | null;

    created_at?: Date | string | null;
    updated_at?: Date | string | null;
    hawala_custom_number?: string | null
}


export interface GroupPricing {
    id: number,
    reseller_group_id: number,
    service_id: number,
    created_at: string | null,
    updated_at: string | null,
    reseller_group: ResellerGroup | null,
    service: Service | null,
    status: number | string,
    fixed_fee: number | null,
    markup_percentage: number | null,
    use_fixed_fee: boolean | null,
    use_markup: boolean | null

}


export interface HawalaCurrency {
    id: number;
    from_currency_id: number;
    from_currency: Currency | null,
    to_currency_id: number;
    to_currency: Currency | null,
    amount: number,
    buy_rate: string | null;
    sell_rate: string | null
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CustomerPricing {
    id: number,
    amount: string | null | number,
    commission_type: string | null,
    reseller: Reseller | null,
    reseller_id: number | null | string,
    service: Service | null,
    service_id: number | string | null,
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface EarningBalance {
    id: number,
    amount: string | number,
    status: string | null,
    reviewed_by: null | string | number,
    reviewed_at: null | string,
    admin_note: null | string,
    created_at: string;
    updated_at: string;
    reseller: Reseller
}


export interface HelpArticle {
    id: number,
    title?: string | null,
    description?: string | null,
    related_image?: string | null | File,
    slug?: string | null,
    category?: string | null,
    section?: string | null,
    is_active?: boolean,
    order?: string | number | null,
    created_at: string;
    updated_at: string;
}


export interface PaymentType {
    id: number,
    name: string,
    description: string,
    created_at: string;
    updated_at: string;
}



// export interface UserList {
//     id: number;
//     uuid: string;
//     name: string;
//     email: string;
//     phone: string;
//     user_type: string;
//     email_verified_at: string | null;
//     currency_preference_code: string;
//     currency_preference_id: number;
//     fcm_token: string | null;
//     deleted_at: string | null;
//     created_at: string;
//     updated_at: string;
//     currency: Currency|null;
//     roles:Roles[]|null
// }


// reseller pagination, edit
// reseller group delete api problem

export interface CustomField {
    name: string;
    type: string;
    label: {
        en: string;
        fa: string;
    };
    placeholder: {
        en: string;
        fa: string;
    };
    keyboard: string;
    validators: {
        required: boolean;
        minLength: number;
        maxLength: number;
    };
    examples: string[];
}


// types/interface.ts (add this to your existing interface file)
export interface AppSettings {
    is_instant_confirm: boolean;
    maintenance_mode: boolean;
    allow_new_registrations: boolean;
    default_currency: string;
    exchange_rate_usd_afn: number;
    support_phone: string;
    support_email: string;
    support_whatsapp: string;
    alternative_contact_phone: string;
    alternative_whatsapp: string;
    telegram_username: string;
    telegram_url: string;
    facebook_page_url: string;
    instagram_handle: string;
    instagram_url: string;
    twitter_url: string;
    tiktok_url: string;
    youtube_url: string;
    website_url: string;
    app_name: string;
    app_name_i18n: {
        en: string;
        fa: string;
        ps: string;
    };
    app_slogan: string;
    app_slogan_i18n: {
        en: string;
        fa: string;
        ps: string;
    };
    logo_url: string;
    mobile_app_primary_color: string;
    mobile_app_secondary_color: string;
    primary_color_font_color: string;
    secondary_color_font_color: string;
    extra_settings: {
        max_order_per_day: number;
        min_topup_amount: number;
        max_topup_amount: number;
    };
    integration_settings: {
        SETARAGAN_API_BASE_URL: string;
        SETARAGAN_API_USERNAME: string;
        SETARAGAN_API_AUTHKEY: string;
        SETARAGAN_MSISDN: string;
        SETARAGAN_REQUEST_ID: string;
        TELEGRAM_WEBHOOK_URL: string;
        TELEGRAM_BOT_TOKEN: string;
    };
    afg_custom_recharge_adjust_type: string | null | undefined;
    afg_custom_recharge_adjust_mode: string;
    afg_custom_recharge_adjust_value: number;
    afg_custom_recharge_selling_price_adjust_type?: string,
    afg_custom_recharge_selling_price_adjust_mode?: string,
    afg_custom_recharge_selling_price_adjust_value?: number,
    setaragan_admin_buying_price_percentage?: number,
}



export interface Provider {
    id: number;
    code: string;
    name: string;
    base_url: string;
    is_active: boolean;
    failover_priority: string | null;
    timeout_seconds: string | null;
    capabilities: string[];
    endpoints: {
        topup?: string | null;
        status?: string | null;
        balance?: string | null;
        default?: string | null;
        internet?: string | null;
        products?: string | null;
        [key: string]: string | null | undefined;
    };
    method_names: {
        pin?: string | null;
        bill?: string | null;
        topup?: string | null;
        credit?: string | null;
        status?: string | null;
        addfund?: string | null;
        balance?: string | null;
        internet?: string | null;
        products?: string | null;
        check_bill?: string | null;
        buy_product?: string | null;
        trans_status?: string | null;
        available_pin?: string | null;
        retrieve_product_info?: string | null;
        [key: string]: string | null | undefined;
    };
    ip_whitelist: string[];
    metadata: {
        notes?: string | null;
        headers?: {
            [key: string]: string;
        } | null;
        credentials?: {
            [key: string]: string;
        } | null;
        callback_url?: string | null;
        test_mode_supported?: boolean | null;
        products_require_params?: boolean | null;
        [key: string]: any;
    } | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}


export interface SingleProvider {
    id: number;
    code: string;
    name: string;
}

export interface Meta {
    table_id: string;
    product_type: string;
    operator: string;
    name: string;
    id: string;
    gross_price: number;
    amount: number;
    periodicity: string;
    days: string;
    volume: string;
    unit: string;
    sim_type: string;
    course: string;
    course_range: string;
    type: string;
    amount_rial: number;
    gross_price_rial: number;
    internet_type: string;
}

export interface Internet {
    provider_product_id: string;
    provider_table_id: string;
    category: string;
    label: string;
    operator: string;
    internet_type: string;
    sim_type: string;
    days: number;
    volume: string;
    unit: string;
    amount: number;
    gross_price: number;
    amount_rial: number;
    gross_price_rial: number;
    currency_hint: string;
    type_label: string;
    meta: Meta;
}
export interface RawInternet {
    table_id: string;
    product_type: string;
    operator: string;
    name: string;
    id: string;
    gross_price: number;
    amount: number;
    periodicity: string;
    days: string;
    volume: string;
    unit: string;
    sim_type: string;
    course: string;
    course_range: string;
    type: string;
    amount_rial: number;
    gross_price_rial: number;
    internet_type: string;
}

export interface SingleProviderResponse {
    provider: SingleProvider;
    internets: Internet[];
    rawInternets: RawInternet[]
}


export interface PriceAdjustmentPayload {
    adjustment_type: 'percentage' | 'fixed';
    adjustment_value: number;
    base_price?: 'admin_buying_price' | 'buying_price';
    service_ids?: number[];
    confirmation?: boolean;
}

export interface BulkBundlePricePayload {
    adjustment_type: 'percentage' | 'fixed';
    adjustment_value: number;
    adjustment_direction?: 'increase' | 'decrease'
    base_price?: 'admin_buying_price' | 'buying_price' | 'selling_price';
    service_ids?: number[];
    confirmation?: boolean;
}

export interface PriceAdjustmentPreview {
    bundle_id: number;
    bundle_title: string;
    current_admin_buying_price: string;
    current_buying_price: string;
    current_selling_price: string;
    new_buying_price: string;
    new_selling_price: string;
    price_change: string;
    service_name: string;
    company_name: string;
}


export interface HawalaNumberSeries {
    id: number;
    branch_id: number;
    branch?: HawalaBranch | null;
    prefix: string;
    current_number: number;
    reset_daily: boolean;
    is_active: boolean;
}


export interface SupportContacts {
  id: number;
  title: string;
  description: string;
  phone: string;
  is_whatsapp: boolean;
  is_phone: boolean;
  status: "active" | "inactive";
  links: {
    telegram: string;
    website: string;
  };
}


export interface Notification{
    id:number;
    title?:string;
    message?:string;
    reseller_id?:number;
    status?:number|boolean;
    target_type?:string|null;
    media?:null|string|File;
    created_at?:string|null;
    is_read?:boolean
}

export interface WithdrawalPolicy {
  id: number;
  currency_id: number;
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  min_withdraw_amount: number;
  max_withdraw_amount: number;
  status: boolean;
  currency?: Currency
}


export interface WithdrawRequest {
  id: number;
  reseller_id: number;
  currency_id: number;
  amount: number;
  net_amount:number;
  commission_amount:number;
  admin_note?: string;
  status: number;
  created_at: string;
  updated_at: string;
  reseller?: Reseller;
  currency?: Currency;
  bank_details?:{
    bank_name?:string;
    account_holder_name?:string;
    account_number?:string;
    iban?:string;
    branch?:string;
    swift_code?:string
  }
}

