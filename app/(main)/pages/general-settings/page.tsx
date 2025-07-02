"use client";
import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { TabPanel, TabView } from "primereact/tabview";
import { useTranslation } from "react-i18next";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import axios from "axios";
import Swal from "sweetalert2";
import { isRTL } from "../../utilities/rtlUtil";


const Settings = () => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const API_URL = process.env.NEXT_PUBLIC_BASE_URL
    const [loading, setLoading] = useState(false);
    const token=localStorage.getItem("api_token")

    // Simulated API call function
    const syncTelegramGroups = async () => {
        setLoading(true);
        //console.log(token)

        try {
            // Call your actual API here
            const response = await axios.post(
            `${API_URL}/telegram-chat-ids/fetch`,
            {}, // empty JSON body
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

            Swal.fire({
                title: t('SUCCESSFUL'),
                text: t('TELEGRAM_SYNC_SUCCESS'),
                icon: 'success',
                confirmButtonText: 'OK'
              })

        } catch (error) {
            //console.log(error)
            Swal.fire({
                title: t('ERROR'),
                text: t('TELEGRAM_SYNC_FAILED'),
                icon: 'error',
                confirmButtonText: 'OK'
              })
        }finally {
            setLoading(false); // Hide loader
        }
    };

    return (
        <div className="card" style={{ maxWidth: "100%", boxSizing: "border-box" }}>
            <Toast ref={toast} />

            <TabView>
                <TabPanel header={t("TELEGRAM_GROUP")}>
                    <p>
                        {t("TELEGRAM_GROUP_TEXT")}
                    </p>
                    <Button label={t("SYNC_TELEGRAM_GROUP")} icon="pi pi-check" loading={loading} onClick={syncTelegramGroups} className={isRTL() ? 'rtl-button' : ''}/>


                </TabPanel>
            </TabView>
        </div>
    );
};

export default Settings;
