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
            icon: 'pi pi-fw pi-th-large',
            to: '/pages',
            items: [
                {
                    label: t('MENU.DASHBOARD'),
                    icon: 'pi pi-fw pi-chart-bar',
                    to: '/'
                },
                {
                    label: t('MENU.COMPANY_SERVICES'),
                    icon: 'pi pi-fw pi-building',
                    items: [
                        {
                            label: t('MENU.COMPANY'),
                            icon: 'pi pi-fw pi-briefcase',
                            to: '/pages/companies'
                        },
                        {
                            label: t('MENU.COMPANYCODE'),
                            icon: 'pi pi-fw pi-id-card',
                            to: '/pages/company-code'
                        },
                        {
                            label: t('MENU.SERVICECATEGORY'),
                            icon: 'pi pi-fw pi-list',
                            to: '/pages/service-category'
                        },
                        {
                            label: t('MENU.SERVICE'),
                            icon: 'pi pi-fw pi-server',
                            to: '/pages/services'
                        },
                        {
                            label: t('MENU.BUNDLE'),
                            icon: 'pi pi-fw pi-server',
                            to: '/pages/bundle'
                        },
                        {
                            label: t('MENU.BUNDLE_PRICING'),
                            icon: 'pi pi-wallet',
                            to: '/pages/bundle-pricing'
                        }
                    ]
                },
                {
                    label: t('MENU.FINANCIALS'),
                    icon: 'pi pi-fw pi-money-bill',
                    items: [
                        {
                            label: t('MENU.MONEYTRANSACTIONS'),
                            icon: 'pi pi-fw pi-wallet',
                            to: '/pages/money-transactions'
                        },
                        {
                            label: t('MENU.PAYMENTMETHOD'),
                            icon: 'pi pi-fw pi-credit-card',
                            to: '/pages/payment-method'
                        },
                        {
                            label: t('MENU.PAYMENTTYPE'),
                            icon: 'pi pi-fw pi-credit-card',
                            to: '/pages/payment-type'
                        },
                        {
                            label: t('MENU.PURCHASEDPRODUCTS'),
                            icon: 'pi pi-fw pi-shopping-bag',
                            to: '/pages/purchase-products'
                        },
                        {
                            label: t('MENU.PAYMENTS'),
                            icon: 'pi pi-fw pi-dollar',
                            to: '/pages/payment'
                        },
                        {
                            label: t('MENU.BALANCE'),
                            icon: 'pi pi-fw pi-wallet',
                            to: '/pages/balance'
                        },
                        {
                            label: t('MENU.EARNING_BALANCE'),
                            icon: 'pi pi-fw pi-chart-pie',
                            to: '/pages/earning-balance-request'
                        },
                        {
                            label: t('MENU.MAKE_EARNING_BALANCE'),
                            icon: 'pi pi-fw pi-plus-circle',
                            to: '/pages/earning-balance-form'
                        }
                    ]
                },
                {
                    label: t('MENU.GEOGRAPHICAL'),
                    icon: 'pi pi-fw pi-map',
                    items: [
                        {
                            label: t('MENU.COUNTRY'),
                            icon: 'pi pi-fw pi-flag-fill',
                            to: '/pages/country'
                        },
                        {
                            label: t('MENU.PROVINCE'),
                            icon: 'pi pi-fw pi-map-marker',
                            to: '/pages/province'
                        },
                        {
                            label: t('MENU.DISTRICT'),
                            icon: 'pi pi-fw pi-compass',
                            to: '/pages/district'
                        }
                    ]
                },
                {
                    label: t('MENU.RESELLER'),
                    icon: 'pi pi-fw pi-share-alt',
                    to: '/pages/reseller'
                },
                {
                    label: t('MENU.ORDER'),
                    icon: 'pi pi-fw pi-shopping-cart',
                    to: '/pages/order'
                },
                {
                    label: t('MENU.LANGUAGE'),
                    icon: 'pi pi-fw pi-language',
                    to: '/pages/language'
                },
                {
                    label: t('MENU.CURRENCY'),
                    icon: 'pi pi-fw pi-euro',
                    to: '/pages/currencies'
                },
                {
                    label: t('MENU.MONEY_TRANSFER_MANAGER'),
                    icon: 'pi pi-fw pi-send',
                    items: [
                        {
                            label: t('MENU.HAWALA_BRANCH'),
                            icon: 'pi pi-fw pi-building',
                            to: '/pages/hawala-branches'
                        },
                        {
                            label: t('MENU.HAWALAS'),
                            icon: 'pi pi-money-bill',
                            to: '/pages/hawala'
                        },
                        {
                            label: t('MENU.HAWALA_NUMBER_SERIES'),
                            icon: 'pi pi-align-center',
                            to: '/pages/hawala-number-series'
                        },
                        {
                            label: t('MENU.HAWALA.CURRENCY'),
                            icon: 'pi pi-bitcoin',
                            to: '/pages/howala-currencies'
                        }
                    ]
                },
                {
                    label: t('MENU.CUSTOMER_PRICING'),
                    icon: 'pi pi-fw pi-tag',
                    to: '/pages/customer-pricing'
                },
                {
                    label: t('MENU.ADVERTISEMENT'),
                    icon: 'pi pi-fw pi-megaphone',
                    to: '/pages/advertisement'
                },
                {
                    label: t('MENU.APPSETTING'),
                    icon: 'pi pi-fw pi-sliders-h',
                    to: '/pages/general-settings'
                },
                {
                    label: t('MENU.ROLES'),
                    icon: 'pi pi-fw pi-lock',
                    to: '/pages/roles'
                },
                {
                    label: t('MENU.RESELLER_GROUP'),
                    icon: 'pi pi-fw pi-users',
                    to: '/pages/reseller-group'
                },
                {
                    label: t('MENU.GROUP_DISCOUNT'),
                    icon: 'pi pi-fw pi-percentage',
                    to: '/pages/group-discount'
                },
                {
                    label: t('MENU.GROUP_PRICING'),
                    icon: 'pi pi-fw pi-tags',
                    to: '/pages/group-pricing'
                },
                {
                    label: t('MENU.USERS_MANAGEMENT'),
                    icon: 'pi pi-fw pi-user-edit',
                    items: [
                        {
                            label: t('MENU.USER_LIST'),
                            icon: 'pi pi-fw pi-users',
                            to: '/pages/user-list'
                        },
                        {
                            label: t('MENU.SUPPLIERS'),
                            icon: 'pi pi-fw pi-truck',
                            to: '/pages/suppliers'
                        }
                    ]
                },
                {
                    label: t('MENU.HELP-ARTICLES'),
                    icon: 'pi pi-fw pi-question-circle',
                    to: '/pages/help-articles'
                },
                {
                    label: t('MENU.SETTINGS'),
                    icon: 'pi pi-fw pi-question-circle',
                    to: '/pages/app-settings'
                },
                {
                    label: t('MENU.PROVIDERS'),
                    icon: 'pi pi-fw pi-question-circle',
                    to: '/pages/app-providers'
                },
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu" style={{
                padding: '0.25rem 0',
                margin: 0,
                listStyle: 'none'
            }}>
                {model.map((item, i) => {
                    return !item?.seperator ? (
                        <li key={item.label} style={{ margin: '0.125rem 0' }}>
                            <AppMenuitem item={item} root={true} index={i} />
                        </li>
                    ) : (
                        <li className="menu-separator" style={{ margin: '0.125rem 0' }}></li>
                    );
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;