// pages/reseller/[id]/page.tsx
"use client"
import { _changeResellerPassword, _changeResellerPin, _getResellerById } from "@/app/redux/actions/resellerActions";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { AppDispatch } from "@/app/redux/store";
import withAuth from '../../../authGuard';
import { PrimeIcons } from 'primereact/api';
import * as Yup from 'yup';


import { TabPanel, TabView } from "primereact/tabview";
import { Card } from "primereact/card";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Toast } from "primereact/toast";
import { isRTL } from "@/app/(main)/utilities/rtlUtil";
import ResellerOrders from "@/app/(main)/components/ResellerOrders";
import ResellerBalances from "@/app/(main)/components/ResellerBalances";
import ResellerPayments from "@/app/(main)/components/ResellerPayment";
import ResellerTransactions from "@/app/(main)/components/ResellerTransaction";
import ResellerSubResellers from "@/app/(main)/components/ResellerSubResellers";


// import { useRouter } from "next/router";

interface ResellerDetailsPageProps {
    params: { id: string };
}

interface ValidationErrors  {
    new_password?: string;
    confirm_new_password?: string;
};

interface PINValidationErrors{
    new_pin?:string,
    confirm_new_pin?:string
}


const ResellerDetailsPage = ({params}: ResellerDetailsPageProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { singleReseller } = useSelector((state: any) => state.resellerReducer);
    //const {userInfo}=useSelector((state:any)=>state.authReducer)
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const {t}=useTranslation()
    const toast = useRef<Toast>(null);


    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showPinDialog, setShowPinDialog] = useState(false);
    const [passwordFormData, setPasswordFormData] = useState({
        new_password: '',
        confirm_new_password: '',

    });
    const [errors, setErrors] = useState<ValidationErrors>({});

    const [pinFormData, setPinFormData] = useState({
        new_pin: '',
        confirm_new_pin: '',
    });

    const [pinErrors, setPinErrors] = useState<PINValidationErrors>({});


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPinFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (params.id) {
            dispatch(_getResellerById(Number(params.id)));
        }
    }, [params.id, dispatch]);

    if (!singleReseller) {
        return <p>Loading...</p>;
    }

    // const passwordSchema = Yup.object({
    //     new_password: Yup.string()
    //         .min(8, "Min length 8")
    //         .required("New Password is required"),
    //     confirm_new_password: Yup.string()
    //         .oneOf([Yup.ref('new_password'), ''], "Password does't match")
    //         .required("Confirm Password required"),
    // });

    // const pinSchema = Yup.object({
    //     new_pin: Yup.string()
    //         .length(4, "Min Length 4")
    //         .required("Pin is required"),
    //     confirm_new_pin: Yup.string()
    //         .oneOf([Yup.ref('new_pin'), ''], "Pin does't match")
    //         .required("Pin is required"),
    // });

    const passwordSchema = Yup.object({
    new_password: Yup.string()
      .min(8, t('validation.new_password.min'))
      .required(t('validation.new_password.required')),
    confirm_new_password: Yup.string()
      .oneOf([Yup.ref('new_password'), ''], t('validation.confirm_new_password.oneOf'))
      .required(t('validation.confirm_new_password.required')),
  });

  const pinSchema = Yup.object({
    new_pin: Yup.string()
      .length(4, t('validation.new_pin.length'))
      .required(t('validation.new_pin.required')),
    confirm_new_pin: Yup.string()
      .oneOf([Yup.ref('new_pin'), ''], t('validation.confirm_new_pin.oneOf'))
      .required(t('validation.confirm_new_pin.required')),
  });





    const handlePasswordChange = async () => {
        try {
            // Validate form data
            await passwordSchema.validate(passwordFormData, { abortEarly: false });

            // If validation succeeds, submit the data
            const bodyData = {
                admin_password: singleReseller.account_password,
                new_password: passwordFormData.new_password,
                confirm_new_password: passwordFormData.confirm_new_password,
                reseller_id: params.id,
            };
            dispatch(_changeResellerPassword(bodyData, toast,t));
            setShowPasswordDialog(false);
        } catch (validationErrors:any) {
            // Extract validation errors
            const formattedErrors = validationErrors.inner.reduce(
                (acc: ValidationErrors, err: Yup.ValidationError) => ({
                    ...acc,
                    [err.path!]: err.message,
                }),
                {}
            );
            setErrors(formattedErrors);
        }
    };




    // const handlePinChange = () => {
    //     const bodyData={
    //         new_pin:new_pin,
    //         confirm_new_pin:confirm_new_pin,
    //         reseller_id:params.id
    //      }
    //     dispatch(_changeResellerPin(bodyData,toast))
    //     setShowPinDialog(false);
    //     setNew_pin('')
    //     setConfirm_new_pin('')
    // };

    const handlePinChange = async () => {
        try {
            // Validate pin form data using the schema
            await pinSchema.validate(pinFormData, { abortEarly: false });

            // If validation succeeds, submit the data
            const bodyData = {
                new_pin: pinFormData.new_pin,
                confirm_new_pin: pinFormData.confirm_new_pin,
                reseller_id: params.id,
            };
            dispatch(_changeResellerPin(bodyData, toast,t));
            setShowPinDialog(false);
            setPinFormData({
                new_pin: '',
                confirm_new_pin: '',
            });
        } catch (validationErrors: any) {
            // Extract validation errors
            const formattedErrors = validationErrors.inner.reduce(
                (acc: ValidationErrors, err: Yup.ValidationError) => ({
                    ...acc,
                    [err.path!]: err.message,
                }),
                {}
            );
            setPinErrors(formattedErrors);
        }
    };






    return (
        <div className="grid -m-4">
        <div className="card p-2" style={{width:'100%'}}>

                <div className="flex gap-2" dir={isRTL() ? "rtl" : "ltr"}>
                    <img
                        src={singleReseller.profile_image_url || "/demo/images/avatar/user.png"}
                        alt={singleReseller.reseller_name}
                        style={{
                            width: '120px',
                            height: '120px',

                            borderRadius: '50%',
                            objectFit: 'cover',
                            [isRTL() ? 'marginLeft' : 'marginRight']: '1rem'
                        }}
                    />
                    <div className="gap-2">
                        <div className="gap-2 mb-3 flex align-items-center">
                            <i
                                className={PrimeIcons.USER}
                                style={{ [isRTL() ? 'marginLeft' : 'marginRight']: '0.5rem' }}
                            ></i>
                            <strong style={{fontSize:"18px"}}>{singleReseller.reseller_name}</strong>
                            <i
                                className={
                                    singleReseller.status === 1
                                        ? PrimeIcons.CHECK_CIRCLE
                                        : PrimeIcons.TIMES_CIRCLE
                                }
                                style={{
                                    fontSize:'1.5rem',
                                    [isRTL() ? 'marginRight' : 'marginLeft']: '0.5rem',
                                    color: singleReseller.status === 1 ? 'green' : 'red',
                                }}
                            ></i>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { icon: PrimeIcons.USER, text: singleReseller.contact_name },
                                { icon: PrimeIcons.PHONE, text: singleReseller.phone },
                                { icon: PrimeIcons.GLOBE, text: singleReseller.country?.country_name },
                                { icon: PrimeIcons.MAP, text: singleReseller.province?.province_name },
                                { icon: PrimeIcons.MAP_MARKER, text: singleReseller.districts?.district_name },
                                { icon: PrimeIcons.ENVELOPE, text: singleReseller.email, small: true },
                            ].map((item, index) => (
                                <p key={index}>
                                    <i
                                        className={item.icon}
                                        style={{ [isRTL() ? 'marginLeft' : 'marginRight']: '0.5rem' }}
                                    ></i>
                                    {item.small ? (
                                        <span style={{fontSize:"12px"}}>{item.text}</span>
                                    ) : (
                                        item.text
                                    )}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>



                    <div className="grid mt-2">

                        <div className="col-6 lg:col-6 xl:col-3" >
                            <div className="card" style={{maxHeight:'120px' ,backgroundImage:"linear-gradient(to right, #dbeafe, #c7d2fe)"}}>
                                <span>{singleReseller.balance} {userInfo?.currency?.symbol}</span>
                                <br />
                                <span >{t('RESELLER.VIEW.BALANCE')}</span>
                            </div>
                        </div>

                        <div className="col-6 lg:col-6 xl:col-3" >
                            <div className="card" style={{maxHeight:'120px',backgroundImage:"linear-gradient(to right, #f3e8ff, #fbcfe8)"}}>
                                <span>{singleReseller.today_orders}</span>
                                <br />
                                <span>{t('RESELLER.VIEW.TODAYORDER')}</span>
                            </div>
                        </div>


                        <div className="col-6 lg:col-6 xl:col-3" >
                            <div className="card" style={{maxHeight:'120px',backgroundImage:"linear-gradient(to right, #d1fae5, #99f6e4)"}}>
                                <span>{singleReseller.total_orders}</span>
                                <br />
                                <span>{t('RESELLER.VIEW.TOTALORDER')}</span>
                            </div>
                        </div>

                        <div className="col-6 lg:col-6 xl:col-3" >
                            <div className="card" style={{maxHeight:'120px',backgroundImage:"linear-gradient(to right, #fef9c3, #fed7aa)"}}>
                                <span>{singleReseller.today_sale}</span>
                                <br />
                                <span>{t('RESELLER.VIEW.TODAYSALE')}</span>
                            </div>
                        </div>

                        <div className="col-6 lg:col-6 xl:col-3" >
                            <div className="card" style={{maxHeight:'120px',backgroundImage:"linear-gradient(to right, #fae8ff, #e9d5ff)"}}>
                                <span>{singleReseller.total_sale}</span>
                                <br />
                                <span>{t('RESELLER.VIEW.TOTALSALE')}</span>
                            </div>
                        </div>

                        <div className="col-6 lg:col-6 xl:col-3" >
                            <div className="card" style={{maxHeight:'120px',backgroundImage:"linear-gradient(to right, #cffafe, #bfdbfe)"}}>
                                <span>{singleReseller.today_profit}</span>
                                <br />
                                <span>{t('RESELLER.VIEW.TODAYPROFIT')}</span>
                            </div>
                        </div>

                        <div className="col-6 lg:col-6 xl:col-3" >
                            <div className="card" style={{maxHeight:'120px',backgroundImage:"linear-gradient(to right, #e0e7ff, #e9d5ff)"}}>
                                <span>{singleReseller.total_profit}</span>
                                <br />
                                <span>{t('RESELLER.VIEW.TOTALPROFIT')}</span>
                            </div>
                        </div>

                    </div>


            <TabView>
                <TabPanel header={t('OVERVIEW')}>
                <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                        quae ab illo inventore veritatis et quasi architecto beatae
                        vitae dicta sunt explicabo.
                    </p>
                </TabPanel>
                <TabPanel header={t('SETTINGS')}>
                    <div className="card" style={{margin:"-20px", marginTop:'10px',marginBottom:'30px',backgroundImage:"linear-gradient(to right, #ffedd5, #fde68a)"}}>
                        <h5>{t('RESELLER.PASSWORDSETTING.RESELLERPASSWORDSETTING')}</h5>
                        <hr />
                        <div style={{paddingBottom:'40px',display:'flex', justifyContent:'space-between'}}>
                            <div>
                                <strong>{t('RESELLER.PASSWORDSETTING.CHANGEPASSWORD')}</strong>
                                <p>{t('RESELLER.PASSWORDSETTING.YOUCANCHANGE')}</p>
                            </div>
                            <div>
                                <Button label={t('RESELLER.PASSWORDSETTING.CHANGEPASSWORD')} severity="info" rounded onClick={() => setShowPasswordDialog(true)}/>
                            </div>
                        </div>
                        <hr />
                    </div>

                    <div className="card" style={{margin:"-20px",backgroundImage:"linear-gradient(to right, #d1fae5, #a7f3d0)"}}>
                        <h5>{t('RESELLER.PINSETTING.RESELLERPINSETTING')}</h5>
                        <hr />
                        <div style={{paddingBottom:'40px',display:'flex', justifyContent:'space-between'}}>
                            <div>
                                <strong>{t('RESELLER.PINSETTING.CHANGEPIN')}</strong>
                                <p>{t('RESELLER.PINSETTING.YOUCANCHANGE')}</p>
                            </div>
                            <div>
                                <Button label={t('RESELLER.PINSETTING.CHANGEPIN')} severity="info" rounded onClick={() => setShowPinDialog(true)}/>
                            </div>
                        </div>
                        <hr />
                    </div>
                </TabPanel>

                <TabPanel header={t('SUB_RESELLERS')}>
                    <ResellerSubResellers resellerId={Number(params.id)} />
                </TabPanel>
                <TabPanel header={t('TRANSACTIONS')}>
                    <ResellerTransactions resellerId={Number(params.id)} />
                </TabPanel>
                <TabPanel header={t('ORDERS')}>
                    <ResellerOrders resellerId={Number(params.id)} />
                </TabPanel>
                <TabPanel header={t('BALANCES')}>
                    <ResellerBalances resellerId={Number(params.id)}/>
                </TabPanel>
                <TabPanel header={t('PAYMENTS')}>
                    <ResellerPayments resellerId={Number(params.id)}/>
                </TabPanel>

            </TabView>
        {/* Change Password Dialog */}
        <Dialog
                visible={showPasswordDialog}
                header={t("RESELLER.PASSWORDSETTING.CHANGEPASSWORD")}
                onHide={() => setShowPasswordDialog(false)}
                style={{
                    width: '90%',
                    maxWidth: '500px',
                    margin: 'auto',
                }}
                footer={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '1rem',
                        }}
                    >
                        <Button
                            label={t("APP.GENERAL.CANCEL")}
                            icon="pi pi-times"
                            severity="danger"
                            onClick={() => setShowPasswordDialog(false)}
                            className={isRTL() ? 'rtl-button' : ''}
                        />
                        <Button
                            label={t("FORM.GENERAL.SUBMIT")}
                            icon="pi pi-check"
                            severity="success"
                            onClick={handlePasswordChange}
                            autoFocus
                            className={isRTL() ? 'rtl-button' : ''}
                        />
                    </div>
                }
            >
                <form
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    <div className="field">
                        <label htmlFor="new_password" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {t("RESELLER.PASSWORDSETTING.NEWPASSWORD")}:
                        </label>
                        <InputText
                            id="new_password"
                            name="new_password"
                            value={passwordFormData.new_password}
                            onChange={handleInputChange}
                            type="password"
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                fontSize: '1rem',
                            }}
                        />
                        {errors.new_password && <small className="p-error">{errors.new_password}</small>}
                    </div>
                    <div className="field">
                        <label htmlFor="confirm_new_password" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {t("RESELLER.PASSWORDSETTING.CONFIRMPASSWORD")}:
                        </label>
                        <InputText
                            id="confirm_new_password"
                            name="confirm_new_password"
                            value={passwordFormData.confirm_new_password}
                            onChange={handleInputChange}
                            type="password"
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                fontSize: '1rem',
                            }}
                        />
                        {errors.confirm_new_password && (
                            <small className="p-error">{errors.confirm_new_password}</small>
                        )}
                    </div>
                </form>
            </Dialog>



            {/* Change PIN Dialog */}
            <Dialog
                visible={showPinDialog}
                header={t("RESELLER.PINSETTING.CHANGEPIN")}
                onHide={() => setShowPinDialog(false)}
                style={{ width: '90%', maxWidth: '400px', margin: 'auto' }}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                        <Button
                            label={t("APP.GENERAL.CANCEL")}
                            icon="pi pi-times"
                            severity="danger"
                            onClick={() => {
                                setShowPinDialog(false);
                                setPinFormData({ new_pin: '', confirm_new_pin: '' });
                            }}
                            className={isRTL() ? 'rtl-button' : ''}
                        />
                        <Button
                            label={t("FORM.GENERAL.SUBMIT")}
                            icon="pi pi-check"
                            severity="success"
                            onClick={handlePinChange}
                            autoFocus
                            className={isRTL() ? 'rtl-button' : ''}
                        />
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="field">
                        <label htmlFor="new_pin" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {t("RESELLER.PINSETTING.NEWPIN")}:
                        </label>
                        <InputText
                            id="new_pin"
                            name="new_pin"
                            value={pinFormData.new_pin}
                            onChange={handlePinInputChange}
                            type="password"
                            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                        />
                        {pinErrors.new_pin && <small className="p-error">{pinErrors.new_pin}</small>}
                    </div>
                    <div className="field">
                        <label htmlFor="confirm_new_pin" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {t("RESELLER.PINSETTING.CONFIRMPIN")}:
                        </label>
                        <InputText
                            id="confirm_new_pin"
                            name="confirm_new_pin"
                            value={pinFormData.confirm_new_pin}
                            onChange={handlePinInputChange}
                            type="password"
                            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                        />
                        {pinErrors.confirm_new_pin && <small className="p-error">{pinErrors.confirm_new_pin}</small>}
                    </div>
                </div>
            </Dialog>

        </div>
        </div>
    );
};

export default ResellerDetailsPage;
