/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';
import { useTranslation } from 'react-i18next';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const { t } = useTranslation();

    const model: AppMenuItem[] = [
        {
            label: '',
            icon: 'pi pi-fw pi-th-large', // General category icon
            to: '/pages',
            items: [
                {
                    label: t('MENU.DASHBOARD'),
                    icon: 'pi pi-fw pi-chart-bar', // Better dashboard icon
                    to: '/'
                },
                // {
                //     label: t('MENU.DASHBOARD'),
                //     icon: 'pi pi-fw pi-home', // Home or main dashboard icon
                //     to: '/pages/crud',
                // },
                {
                    label: t('MENU.COMPANY_SERVICES'),
                    icon: 'pi pi-fw pi-building', // Better company services icon
                    items: [
                        {
                            label: t('MENU.COMPANY'),
                            icon: 'pi pi-fw pi-briefcase', // Better company icon
                            to: '/pages/companies'
                        },
                        {
                            label: t('MENU.COMPANYCODE'),
                            icon: 'pi pi-fw pi-id-card', // Better code identifier icon
                            to: '/pages/company-code'
                        },
                        // {
                        //     label: t('MENU.DASHBOARD'),
                        //     icon: 'pi pi-fw pi-cog', // Subcategories or settings icon
                        //     to: '/pages/variations',
                        // },
                        {
                            label: t('MENU.SERVICECATEGORY'),
                            icon: 'pi pi-fw pi-list', // Better category icon
                            to: '/pages/service-category'
                        },
                        {
                            label: t('MENU.SERVICE'),
                            icon: 'pi pi-fw pi-server', // Better service icon
                            to: '/pages/services'
                        },
                        {
                            label: t('MENU.BUNDLE'),
                            icon: 'pi pi-fw pi-layer-group', // Better bundle icon
                            to: '/pages/bundle'
                        },
                        {
                            label: t('MENU.BUNDLE_PRICING'),
                            icon: 'pi pi-fw pi-layer-group', // Better bundle icon
                            to: '/pages/bundle-pricing'
                        }
                    ]
                },
                {
                    label: t('MENU.FINANCIALS'),
                    icon: 'pi pi-fw pi-money-bill', // Better financial icon
                    items: [
                        {
                            label: t('MENU.MONEYTRANSACTIONS'),
                            icon: 'pi pi-fw pi-exchange', // Better transactions icon
                            to: '/pages/money-transactions'
                        },
                        {
                            label: t('MENU.PAYMENTMETHOD'),
                            icon: 'pi pi-fw pi-credit-card', // Good payment method icon
                            to: '/pages/payment-method'
                        },
                        {
                            label: t('MENU.PAYMENTTYPE'),
                            icon: 'pi pi-fw pi-credit-card', // Good payment method icon
                            to: '/pages/payment-type'
                        },

                        {
                            label: t('MENU.PURCHASEDPRODUCTS'),
                            icon: 'pi pi-fw pi-shopping-bag', // Better purchases icon
                            to: '/pages/purchase-products'
                        },
                        {
                            label: t('MENU.PAYMENTS'),
                            icon: 'pi pi-fw pi-dollar', // Better payments icon
                            to: '/pages/payment'
                        },
                        {
                            label: t('MENU.BALANCE'),
                            icon: 'pi pi-fw pi-wallet', // Better balance icon
                            to: '/pages/balance'
                        },
                        {
                            label: t('MENU.EARNING_BALANCE'),
                            icon: 'pi pi-fw pi-chart-pie', // Better earnings icon
                            to: '/pages/earning-balance-request'
                        },
                        {
                            label: t('MENU.MAKE_EARNING_BALANCE'),
                            icon: 'pi pi-fw pi-plus-circle', // Better create earnings icon
                            to: '/pages/earning-balance-form'
                        }
                    ]
                },
                {
                    label: t('MENU.GEOGRAPHICAL'),
                    icon: 'pi pi-fw pi-map', // Better geographical icon
                    items: [
                        {
                            label: t('MENU.COUNTRY'),
                            icon: 'pi pi-fw pi-flag-fill', // Better country icon
                            to: '/pages/country'
                        },
                        {
                            label: t('MENU.PROVINCE'),
                            icon: 'pi pi-fw pi-map-marker', // Better province icon
                            to: '/pages/province'
                        },
                        {
                            label: t('MENU.DISTRICT'),
                            icon: 'pi pi-fw pi-compass', // Good district icon
                            to: '/pages/district'
                        }
                    ]
                },
                {
                    label: t('MENU.RESELLER'),
                    icon: 'pi pi-fw pi-share-alt', // Better reseller icon
                    to: '/pages/reseller'
                },
                {
                    label: t('MENU.ORDER'),
                    icon: 'pi pi-fw pi-shopping-cart', // Better order icon
                    to: '/pages/order'
                },
                {
                    label: t('MENU.LANGUAGE'),
                    icon: 'pi pi-fw pi-language', // Better language icon
                    to: '/pages/language'
                },
                {
                    label: t('MENU.CURRENCY'),
                    icon: 'pi pi-fw pi-euro', // Better currency icon
                    to: '/pages/currencies'
                },

                //
                {
                    label: t('MENU.MONEY_TRANSFER_MANAGER'),
                    icon: 'pi pi-fw pi-send', // Better money transfer icon
                    items: [
                        {
                            label: t('MENU.HAWALA_BRANCH'),
                            icon: 'pi pi-fw pi-code-branch', // Better branch icon
                            to: '/pages/hawala-branches'
                        },
                        {
                            label: t('MENU.HAWALAS'),
                            icon: 'pi pi-fw pi-transfer', // Better transfer icon
                            to: '/pages/hawala'
                        },
                        {
                            label: t('MENU.HAWALA_NUMBER_SERIES'),
                            icon: 'pi pi-fw pi-transfer', // Better transfer icon
                            to: '/pages/hawala-number-series'
                        },
                        {
                            label: t('MENU.HAWALA.CURRENCY'),
                            icon: 'pi pi-fw pi-bitcoin', // Better hawala currency icon
                            to: '/pages/howala-currencies'
                        }
                    ]
                },
                {
                    label: t('MENU.CUSTOMER_PRICING'),
                    icon: 'pi pi-fw pi-tag', // Better pricing icon
                    to: '/pages/customer-pricing'
                },
                //
                {
                    label: t('MENU.ADVERTISEMENT'),
                    icon: 'pi pi-fw pi-megaphone', // Better advertisement icon
                    to: '/pages/advertisement'
                },
                {
                    label: t('MENU.APPSETTING'),
                    icon: 'pi pi-fw pi-sliders-h', // Better settings icon
                    to: '/pages/general-settings'
                },
                {
                    label: t('MENU.ROLES'),
                    icon: 'pi pi-fw pi-lock', // Better roles icon
                    to: '/pages/roles'
                },
                // {
                //     label: t('MENU.USER_LIST'),
                //     icon: 'pi pi-fw pi-cog', // Cogwheel for settings
                //     to: '/pages/user-list',
                // },
                {
                    label: t('MENU.RESELLER_GROUP'),
                    icon: 'pi pi-fw pi-users', // Better group icon
                    to: '/pages/reseller-group'
                },
                {
                    label: t('MENU.GROUP_DISCOUNT'),
                    icon: 'pi pi-fw pi-percentage', // Better discount icon
                    to: '/pages/group-discount'
                },
                {
                    label: t('MENU.GROUP_PRICING'),
                    icon: 'pi pi-fw pi-tags', // Better pricing icon
                    to: '/pages/group-pricing'
                },
                {
                    label: t('MENU.USERS_MANAGEMENT'),
                    icon: 'pi pi-fw pi-user-edit', // Better user management icon
                    items: [
                        {
                            label: t('MENU.USER_LIST'),
                            icon: 'pi pi-fw pi-users', // Better user list icon
                            to: '/pages/user-list'
                        },
                        {
                            label: t('MENU.SUPPLIERS'),
                            icon: 'pi pi-fw pi-truck', // Good supplier icon
                            to: '/pages/suppliers'
                        }
                    ]
                },
                {
                    label: t('MENU.HELP-ARTICLES'),
                    icon: 'pi pi-fw pi-question-circle', // Better help icon
                    to: '/pages/help-articles'
                },
                {
                    label: t('MENU.SETTINGS'),
                    icon: 'pi pi-fw pi-question-circle', // Better help icon
                    to: '/pages/app-settings'
                },
                {
                    label: t('MENU.PROVIDERS'),
                    icon: 'pi pi-fw pi-question-circle', // Better help icon
                    to: '/pages/app-providers'
                },
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu" style={{
                padding: '0.5rem 0', // Reduced padding
                margin: 0, // Remove default margins
                listStyle: 'none',
                fontSize:'14px'
            }}>
                {model.map((item, i) => {
                    return !item?.seperator ? (
                        <li key={item.label} style={{ margin: '0.25rem 0' }}> {/* Reduced margin */}
                            <AppMenuitem item={item} root={true} index={i} />
                        </li>
                    ) : (
                        <li className="menu-separator" style={{ margin: '0.25rem 0' }}></li>
                    );
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
