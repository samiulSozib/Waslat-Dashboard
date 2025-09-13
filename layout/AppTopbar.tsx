'use client';
import React, {useImperativeHandle,forwardRef, useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/app/redux/store';
import { signOut } from '@/app/redux/actions/authActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
import Link from 'next/link';
import i18n from 'i18next';
import { Language } from '@/types/interface';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { classNames } from 'primereact/utils';
import Swal from 'sweetalert2';
import { isRTL } from '@/app/(main)/utilities/rtlUtil';
import { useTranslation } from 'react-i18next';

interface MyLanguage {
    name:string,
    language_code:string,
    flag:string
}


const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const [profileMenuVisible, setProfileMenuVisible] = useState(false);
    const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { languages } = useSelector((state: any) => state.languageReducer);
    const {t}=useTranslation()

    const [currentLanguage, setCurrentLanguage] = useState(i18n.language); // Track current language


  const languagesWithFlags : MyLanguage[]= [
    { name: "پښتو", language_code: "ps", flag: "https://flagcdn.com/w40/af.png" }, // Pashto (Afghanistan)
    { name: "English", language_code: "en", flag: "https://flagcdn.com/w40/us.png" }, // English (USA)
    { name: "Bangladesh", language_code: "bn", flag: "https://flagcdn.com/w40/bd.png" }, // Bengali (Bangladesh)
    { name: "Arabic", language_code: "ar", flag: "https://flagcdn.com/w40/sa.png" }, // Arabic (Saudi Arabia)
    { name: "Turkey", language_code: "tr", flag: "https://flagcdn.com/w40/tr.png" }, // Turkish (Turkey)
    { name: "فارسی", language_code: "fa", flag: "https://flagcdn.com/w40/ir.png" }, // Persian (Iran)

  ];

    const toggleProfileMenu = () => {
        setProfileMenuVisible((prevVisible) => !prevVisible);
    };


    useEffect(() => {
        dispatch(_fetchLanguages());
    }, [dispatch]);

    const logout = () => {
        dispatch(signOut());
        Swal.fire({
            title: t('LOGOUT_SUCCESS'),
            icon: "success",
            draggable: true
            });
        router.push('/auth/login');
    };

    const handleLanguageClick = (language: MyLanguage) => {
        i18n.changeLanguage(language.language_code) // Change language dynamically
            .then(() => {
                setCurrentLanguage(language.language_code); // Update state
                //console.log(`Language changed to: ${language.language_code}`);

                router.refresh()
                setProfileMenuVisible(false)
                setLanguageDropdownVisible(false)
                //window.location.reload()

            })
            .catch((err) => {
                console.error('Error changing language:', err);
            });
    };

    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 991);
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <div className="layout-topbar" >
            {/* Logo Section */}
            <Link href="/" className="layout-topbar-logo" style={{
                display: 'flex',
                alignItems: 'center',
                gap: isRTL() ? '0.5rem' : '1rem',
                }}>
                <img
                    // src={`/layout/images/tak_telecom.jpeg`}
                    src={`${process.env.NEXT_PUBLIC_PROJECT_LOGO}`}
                    width="47.22px"
                    height={'35px'}
                    alt="logo"
                    style={{
                    borderRadius: '10px',
                    [isRTL() ? 'marginLeft' : 'marginRight']: isRTL() ? '0.5rem' : '1rem'
                    }}
                />
                {/* <span>Tak</span> */}
                <span>{process.env.NEXT_PUBLIC_PROJECT_NAME}</span>
                </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button  ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            {/* Profile Button */}
            <div style={{
                marginLeft: isRTL() ? '0' : 'auto', // Move left for Arabic
                marginRight: isRTL() ? 'auto' : '0' // Default for LTR
            }} ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button
                    type="button"
                    className="p-link layout-topbar-button"
                    onClick={toggleProfileMenu}
                    style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <i className="pi pi-user" style={{ fontSize: '24px', [isRTL() ? 'marginLeft' : 'marginRight']: isRTL() ? '8px' : '8px' }}></i>
                    <span>{t('ADMIN_USER')}</span>
                </button>

                {/* Profile Dropdown Menu */}
                {profileMenuVisible && (

                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: isRTL() ? 'auto' : '0', // Align to left when RTL
                            left: isRTL() ? '0' : 'auto', // Align to right when LTR
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            width: '300px',
                            padding: '20px',
                            marginLeft: isRTL() && isMobile ? '50px' : '',
                        }}
                    >
                        {/* User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '' }}>
                            <div
                                style={{
                                    width: '75px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'white',
                                    fontSize: '24px',
                                    marginRight: isRTL() ? '0' : '12px', // Adjust for RTL
                                    marginLeft: isRTL() ? '12px' : '0', // Adjust for RTL
                                }}
                            >
                                <i className="pi pi-user"></i>
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('ADMIN_USER')}</div>
                                {/* <div style={{ fontSize: '14px', color: '#666' }}>admin@bakhtertelecom.com</div> */}
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />

                        {/* Menu Options */}
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {/* Language Section */}
                            <li
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px 0',
                                    cursor: 'pointer',
                                    color: '#333',
                                    fontSize: '14px',
                                    position: 'relative',
                                    marginBottom: '8px',
                                }}
                                onMouseEnter={() => setLanguageDropdownVisible(true)}
                                onMouseLeave={() => setLanguageDropdownVisible(false)}
                            >
                                <span style={{ flex: '1' }}>{t('LANGUAGE')}</span>
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#f7f7f7',
                                        borderRadius: '12px',
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                    }}
                                >
                                    {currentLanguage}
                                </span>

                                {/* Language Dropdown */}
                                {languageDropdownVisible && (
                                    <ul
                                        style={{
                                            width:'220px',
                                            position: 'absolute',
                                            top: '100%',
                                            left: isRTL() ? 'auto' : '0', // Align to left when LTR
                                            right: isRTL() ? '0' : 'auto', // Align to right when RTL
                                            background: '#fff',
                                            border: '1px solid #ccc',
                                            borderRadius: '8px',
                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                            listStyle: 'none',
                                            margin: 0,
                                            padding: '8px',
                                            zIndex: 1000,
                                        }}
                                    >
                                        {/* {languages.map((language: Language) => (
                                            <li
                                                key={language.id}
                                                style={{
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    color: '#333',
                                                }}
                                                onClick={() => handleLanguageClick(language)}
                                            >
                                                {language.language_name}
                                            </li>
                                        ))} */}
                                        {languagesWithFlags?.map((lang:MyLanguage) => (
                                        <li
                                            key={lang.name}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleLanguageClick(lang)}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                gap: '0.75rem', // 12px, which is Tailwind's gap-3
                                                justifyContent: 'space-between'
                                                }}
                                                >
                                                <span>{lang.name}</span>
                                                <img src={lang.flag} alt="" style={{height:'20px', width:'30px' , fill:'cover'}}/>
                                            </div>
                                        </li>
                                        ))}
                                    </ul>
                                )}
                            </li>

                            <li
                                style={{
                                    padding: '8px 0',
                                    cursor: 'pointer',
                                    color: '#333',
                                    fontSize: '14px',
                                    marginBottom: '8px',
                                }}
                            >
                                {t('ACCOUNT_SETTING')}
                            </li>
                            <li
                                style={{
                                    padding: '8px 0',
                                    cursor: 'pointer',
                                    color: '#333',
                                    fontSize: '14px',
                                }}
                                onClick={logout}
                            >
                                {t('LOGOUT')}
                            </li>
                        </ul>
                    </div>

                )}
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
