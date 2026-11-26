import {
    LayoutDashboard,
    Building2,
    Server,
    Package,
    Wallet,
    CreditCard,
    ShoppingBag,
    Users,
    MapPin,
    Send,
    Settings,
    Shield,
    Bell,
    KeyRound,
    Database,
    Languages,
    Megaphone,
    Tag,
    HelpCircle,
    Truck,
    Percent,
    type LucideIcon
} from 'lucide-react';

export type NavItem = {
    labelKey: string;
    href?: string;
    icon: LucideIcon;
    children?: NavItem[];
};

/** Grouped IA — labels come from i18n (Persian-first) */
export const NAV_SECTIONS: { titleKey?: string; items: NavItem[] }[] = [
    {
        items: [{ labelKey: 'MENU.DASHBOARD', href: '/', icon: LayoutDashboard }]
    },
    {
        titleKey: 'MENU.ORDER',
        items: [{ labelKey: 'MENU.ORDER', href: '/pages/order', icon: ShoppingBag }]
    },
    {
        titleKey: 'MENU.FINANCIALS',
        items: [
            { labelKey: 'MENU.PAYMENTS', href: '/pages/payment', icon: CreditCard },
            { labelKey: 'MENU.BALANCE', href: '/pages/balance', icon: Wallet },
            { labelKey: 'MENU.MONEYTRANSACTIONS', href: '/pages/money-transactions', icon: Wallet },
            { labelKey: 'MENU.PAYMENTMETHOD', href: '/pages/payment-method', icon: CreditCard },
            { labelKey: 'MENU.PAYMENTTYPE', href: '/pages/payment-type', icon: CreditCard },
            { labelKey: 'MENU.PURCHASEDPRODUCTS', href: '/pages/purchase-products', icon: Package },
            { labelKey: 'MENU.EARNING_BALANCE', href: '/pages/earning-balance-request', icon: Wallet },
            { labelKey: 'MENU.MAKE_EARNING_BALANCE', href: '/pages/earning-balance-form', icon: Wallet },
            { labelKey: 'MENU.WITHDRAWAL_POLICY', href: '/pages/withdrawal-policy', icon: Shield },
            { labelKey: 'MENU.WITHDRAWAL_REQUEST', href: '/pages/withdrawal-request', icon: Wallet }
        ]
    },
    {
        titleKey: 'MENU.COMPANY_SERVICES',
        items: [
            { labelKey: 'MENU.COMPANY', href: '/pages/companies', icon: Building2 },
            { labelKey: 'MENU.COMPANYCODE', href: '/pages/company-code', icon: Building2 },
            { labelKey: 'MENU.SERVICECATEGORY', href: '/pages/service-category', icon: Server },
            { labelKey: 'MENU.SERVICE', href: '/pages/services', icon: Server },
            { labelKey: 'MENU.BUNDLE', href: '/pages/bundle', icon: Package },
            { labelKey: 'MENU.BUNDLE_PRICING', href: '/pages/bundle-pricing', icon: Tag },
            { labelKey: 'MENU.SET_SELLING_PRICE', href: '/pages/set-selling-price', icon: Tag }
        ]
    },
    {
        titleKey: 'MENU.RESELLER',
        items: [
            { labelKey: 'MENU.RESELLER', href: '/pages/reseller', icon: Users },
            { labelKey: 'MENU.RESELLER_GROUP', href: '/pages/reseller-group', icon: Users },
            { labelKey: 'MENU.GROUP_DISCOUNT', href: '/pages/group-discount', icon: Percent },
            { labelKey: 'MENU.GROUP_PRICING', href: '/pages/group-pricing', icon: Tag },
            { labelKey: 'MENU.CUSTOMER_PRICING', href: '/pages/customer-pricing', icon: Tag }
        ]
    },
    {
        titleKey: 'MENU.MONEY_TRANSFER_MANAGER',
        items: [
            { labelKey: 'MENU.HAWALAS', href: '/pages/hawala', icon: Send },
            { labelKey: 'MENU.HAWALA_BRANCH', href: '/pages/hawala-branches', icon: Building2 },
            { labelKey: 'MENU.HAWALA_NUMBER_SERIES', href: '/pages/hawala-number-series', icon: Database },
            { labelKey: 'MENU.HAWALA.CURRENCY', href: '/pages/howala-currencies', icon: Wallet }
        ]
    },
    {
        titleKey: 'MENU.GEOGRAPHICAL',
        items: [
            { labelKey: 'MENU.COUNTRY', href: '/pages/country', icon: MapPin },
            { labelKey: 'MENU.PROVINCE', href: '/pages/province', icon: MapPin },
            { labelKey: 'MENU.DISTRICT', href: '/pages/district', icon: MapPin }
        ]
    },
    {
        titleKey: 'MENU.USERS_MANAGEMENT',
        items: [
            { labelKey: 'MENU.USER_LIST', href: '/pages/user-list', icon: Users },
            { labelKey: 'MENU.SUPPLIERS', href: '/pages/suppliers', icon: Truck },
            { labelKey: 'MENU.ROLES', href: '/pages/roles', icon: Shield }
        ]
    },
    {
        titleKey: 'MENU.SETTINGS',
        items: [
            { labelKey: 'MENU.APPSETTING', href: '/pages/general-settings', icon: Settings },
            { labelKey: 'MENU.SETTINGS', href: '/pages/app-settings', icon: Settings },
            { labelKey: 'MENU.PROVIDERS', href: '/pages/app-providers', icon: Server },
            { labelKey: 'MENU.LANGUAGE', href: '/pages/language', icon: Languages },
            { labelKey: 'MENU.CURRENCY', href: '/pages/currencies', icon: Wallet },
            { labelKey: 'MENU.NOTIFICATION', href: '/pages/notification', icon: Bell },
            { labelKey: 'MENU.ADVERTISEMENT', href: '/pages/advertisement', icon: Megaphone },
            { labelKey: 'MENU.API_KEYS', href: '/pages/api-keys', icon: KeyRound },
            { labelKey: 'MENU.BACKUP_MANAGEMENT', href: '/pages/backup-management', icon: Database },
            { labelKey: 'MENU.HELP-ARTICLES', href: '/pages/help-articles', icon: HelpCircle },
            { labelKey: 'TRANSLATION_WORKSPACE', href: '/pages/translation-workspace?type=bundle', icon: Languages }
        ]
    }
];
