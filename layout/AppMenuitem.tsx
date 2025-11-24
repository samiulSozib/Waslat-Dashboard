'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ripple } from 'primereact/ripple';
import { classNames } from 'primereact/utils';
import React, { useEffect, useContext, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { MenuContext } from './context/menucontext';
import { AppMenuItemProps } from '@/types';
import { usePathname, useSearchParams } from 'next/navigation';
import i18n from '@/i18n';

const AppMenuitem = (props: AppMenuItemProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { activeMenu, setActiveMenu, isNavigating, setIsNavigating } = useContext(MenuContext);
    const [localNavigating, setLocalNavigating] = useState(false);
    const item = props.item;
    const key = props.parentKey ? props.parentKey + '-' + props.index : String(props.index);
    const isActiveRoute = item!.to && pathname === item!.to;
    const active = activeMenu === key || activeMenu.startsWith(key + '-');
    
    const onRouteChange = (url: string) => {
        if (item!.to && item!.to === url) {
            setActiveMenu(key);
        }
    };

    useEffect(() => {
        onRouteChange(pathname);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams]);

    useEffect(() => {
        if (!isNavigating) {
            setLocalNavigating(false);
        }
    }, [isNavigating]);

    const handleNavigation = async (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, url?: string) => {
        if (isNavigating || item!.disabled) {
            event.preventDefault();
            return;
        }

        if (item!.command) {
            item!.command({ originalEvent: event, item: item });
        }

        if (item!.url && !item!.to) {
            return;
        }

        if (item!.to && !item!.items) {
            event.preventDefault();
            
            setIsNavigating(true);
            setLocalNavigating(true);
            
            setActiveMenu(key);

            try {
                if (item!.replaceUrl) {
                    router.replace(item!.to);
                } else {
                    router.push(item!.to);
                }

                setTimeout(() => {
                    setIsNavigating(false);
                    setLocalNavigating(false);
                }, 1000);

            } catch (error) {
                console.error('Navigation error:', error);
                setIsNavigating(false);
                setLocalNavigating(false);
            }
        } else {
            if (item!.items) {
                setActiveMenu(active ? (props.parentKey as string) : key);
            } else {
                setActiveMenu(key);
            }
        }
    };

    const subMenu = item!.items && item!.visible !== false && (
        <CSSTransition timeout={{ enter: 1000, exit: 450 }} classNames="layout-submenu" in={props.root ? true : active} key={item!.label}>
            <ul style={{ 
                paddingLeft: '1rem',
                fontSize: '0.875rem' // Smaller font for sub-items
            }}>
                {item!.items.map((child, i) => {
                    return <AppMenuitem item={child} index={i} className={child.badgeClass} parentKey={key} key={child.label} />;
                })}
            </ul>
        </CSSTransition>
    );

    const menuItemClass = classNames(
        item!.class, 
        'p-ripple', 
        { 
            'active-route': isActiveRoute,
            'layout-menuitem-disabled': localNavigating && !item!.items
        }
    );

    const showSpinner = localNavigating && !item!.items;

    // Determine font size based on whether it's a main item or sub-item
    const getFontSize = () => {
        if (props.root) {
            return '0.9rem'; // Main menu items
        }
        return props.parentKey ? '0.8rem' : '0.85rem'; // Sub-items get smaller font
    };

    return (
        <li className={classNames({ 
            'layout-root-menuitem': props.root, 
            'active-menuitem': active,
            'layout-menuitem-navigating': localNavigating
        })} style={{
            margin: '0.125rem 0' // Reduced margin
        }}>
            {props.root && item!.visible !== false && (
                <div className="layout-menuitem-root-text" style={{ 
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    marginBottom: '0.25rem'
                }}>
                    {item!.label}
                </div>
            )}
            {(!item!.to || item!.items) && item!.visible !== false ? (
                <a 
                    href={item!.url} 
                    onClick={(e) => handleNavigation(e, item!.url)} 
                    className={menuItemClass} 
                    target={item!.target} 
                    tabIndex={isNavigating && !localNavigating ? -1 : 0}
                    style={{ 
                        pointerEvents: isNavigating && !localNavigating ? 'none' : 'auto',
                        fontSize: getFontSize(),
                        padding: '0.5rem 0.75rem', // Reduced padding
                        minHeight: '2rem' // Reduced height
                    }}
                >
                    <i 
                        className={classNames('layout-menuitem-icon', item!.icon)}
                        style={{
                            marginLeft: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "6px" : "0px",
                            marginRight: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "0px" : "6px",
                            fontSize: '0.875rem' // Slightly smaller icons
                        }}
                    >
                    </i>
                    <span className="layout-menuitem-text" style={{
                        fontSize: 'inherit' // Inherit font size from parent
                    }}>
                        {item!.label}
                    </span>
                    {item!.items && (
                        <i className="pi pi-fw pi-angle-down layout-submenu-toggler" style={{
                            fontSize: '0.8rem' // Smaller toggle icon
                        }}></i>
                    )}
                    {showSpinner && (
                        <i 
                            className="pi pi-spin pi-spinner layout-menuitem-spinner" 
                            style={{ 
                                marginLeft: '6px',
                                fontSize: '0.75rem' // Smaller spinner
                            }}
                        />
                    )}
                    <Ripple />
                </a>
            ) : null}

            {item!.to && !item!.items && item!.visible !== false ? (
                <Link 
                    href={item!.to} 
                    replace={item!.replaceUrl} 
                    target={item!.target} 
                    onClick={(e) => handleNavigation(e)}
                    className={menuItemClass}
                    tabIndex={isNavigating && !localNavigating ? -1 : 0}
                    style={{ 
                        pointerEvents: isNavigating && !localNavigating ? 'none' : 'auto',
                        fontSize: getFontSize(),
                        padding: '0.5rem 0.75rem', // Reduced padding
                        minHeight: '2rem' // Reduced height
                    }}
                    scroll={true}
                >
                    <i 
                        className={classNames('layout-menuitem-icon', item!.icon)}
                        style={{
                            marginLeft: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "6px" : "0px",
                            marginRight: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "0px" : "6px",
                            fontSize: '0.875rem' // Slightly smaller icons
                        }}
                    >
                    </i>
                    <span className="layout-menuitem-text" style={{
                        fontSize: 'inherit' // Inherit font size from parent
                    }}>
                        {item!.label}
                    </span>
                    {item!.items && (
                        <i className="pi pi-fw pi-angle-down layout-submenu-toggler" style={{
                            fontSize: '0.8rem' // Smaller toggle icon
                        }}></i>
                    )}
                    {showSpinner && (
                        <i 
                            className="pi pi-spin pi-spinner layout-menuitem-spinner" 
                            style={{ 
                                marginLeft: '6px',
                                fontSize: '0.75rem' // Smaller spinner
                            }}
                        />
                    )}
                    <Ripple />
                </Link>
            ) : null}

            {subMenu}
        </li>
    );
};

export default AppMenuitem;