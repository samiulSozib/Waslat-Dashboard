'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useDispatch } from 'react-redux';
import { _login } from '../../../../app/redux/actions/authActions';
import { Toast } from 'primereact/toast';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

const LoginPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();
    const toast = useRef<Toast>(null);

    const language = i18n.language;
    let title;
    if (language === 'en') {
        title = process.env.NEXT_PUBLIC_PROJECT_WELCOME_NAME_ENGLISH;
    } else if (language === 'fa') {
        title = process.env.NEXT_PUBLIC_PROJECT_WELCOME_NAME_FARSI;
    } else if (language === 'ps') {
        title = process.env.NEXT_PUBLIC_PROJECT_WELCOME_NAME_PASHTO;
    }else{
        title="Welcome to the application"
    }

    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savePassword = localStorage.getItem('rememberedPassword');
        if (savedEmail) {
            setEmail(savedEmail);
            setChecked(true);
        }
        if (savePassword) {
            setPassword(savePassword);
            setChecked(true);
        }
    }, []);

    const handleLogin = async () => {
        setError(null);
        setLoading(true);

        try {
            const result = await dispatch<any>(_login(email, password, toast));
            if (result.success) {
                if (checked) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberedPassword');
                }

                Swal.fire({
                    title: t('login.login_success'),
                    icon: 'success',
                    draggable: true
                });

                router.push('/');
            } else {
                Swal.fire({
                    title: t('login.login_fail'),
                    icon: 'error',
                    draggable: true
                });
                setError(result.error || t('login.login_fail'));
            }
        } catch (err) {
            Swal.fire({
                title: t('login.login_fail'),
                icon: 'error',
                draggable: true
            });
            setError(t('login.unexpected_error'));
        } finally {
            setLoading(false);
        }
    };
    const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME;

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            {/* <img src="/layout/images/tak_telecom.jpeg" alt="Image" height="50" className="mb-3" /> */}
                            <img src={process.env.NEXT_PUBLIC_PROJECT_LOGO} alt="Image" height="50" className="mb-3" />
                            <div className="text-900 text-3xl font-medium mb-3">{title}</div>
                            {/* <div className="text-900 text-3xl font-medium mb-3">{t('login.welcome')}</div> */}
                            {/* <div className="text-900 text-3xl font-medium mb-3">
                                {t('login.welcome', { projectName: process.env.NEXT_PUBLIC_PROJECT_NAME })}
                            </div> */}
                            <span className="text-600 font-medium">{t('login.signin_continue')}</span>
                        </div>

                        <div>
                            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                {t('login.email_label')}
                            </label>
                            <InputText id="email1" type="text" placeholder={t('login.email_placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                {t('login.password_label')}
                            </label>
                            <Password inputId="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('login.password_placeholder')} toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem" />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2" />
                                    <label htmlFor="rememberme1">{t('login.remember_me')}</label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    {t('login.forgot_password')}
                                </a>
                            </div>

                            <Button label={loading ? t('login.signing_in') : t('login.sign_in')} className="w-full p-3 text-xl" onClick={() => handleLogin()} disabled={loading} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
