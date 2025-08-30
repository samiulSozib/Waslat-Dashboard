import {combineReducers} from 'redux'
import { currenciesReducer } from './currenciesReducer';
import { authReducer } from './authReducer';
import { dashboardDataReducer } from './dashboardReducer';
import { countriesReducer } from './countriesReducer';
import { telegramReducer } from './telegramReducer';
import { companyReducer } from './companyReducer';
import { companyCodeReducer } from './companyCodeReducer';
import serviceCategoryReducer from './serviceCategoryReducer';
import serviceReducer from './serviceReducer';
import bundleReducer from './bundleReducer';
import { moneyTransactionReducer } from './moneyTransactionsReducer';
import { paymentMethodsReducer } from './paymentMethodReducer';
import { suppliersReducer } from './supplierReducer';
import { provinceReducer } from './provinceReducer';
import { districtReducer } from './districtReducer';
import { resellerReducer } from './resellerReducer';
import { orderReducer } from './orderReducer';
import { languageReducer } from './languageReducer';
import { advertisementsReducer } from './advertisementReducer';
import { balanceReducer } from './balanceReducer';
import { paymentReducer } from './paymentReducer';
import { purchasedProductsReducer } from './purchasedProductsReducer';
import { rolesReducer } from './rolesReducer';
import { userReducer } from './userListReducer';
import { resellerGroupReducer } from './resellerGroupReducer';
import { permissionsReducer } from './permissionReducer';
import { groupDiscountReducer } from './groupDiscountReducer';
import {hawalaBranchReducer} from './hawalaBranchReducer'
import {hawalaReducer} from './hawalaReducer'
import {groupPricingReducer} from './groupPricingReducer'
import { hawalaCurrenciesReducer } from './hawalaCurrenciesReducer';
import { customerPricingReducer } from './customerPricingReducer';
import { earningBalanceReducer } from './earningBalanceReducer';
import { helpArticlesReducer } from './helpArilesReducer';
import { resellerInformationReducer } from './resellerInformationReducer';
import { paymentTypesReducer } from './paymentTypeReducer';
import {appSettingsReducer} from './appSettingsReducer'

const rootReducer=combineReducers({
    currenciesReducer:currenciesReducer,
    authReducer:authReducer,
    dashboardDataReducer:dashboardDataReducer,
    countriesReducer:countriesReducer,
    telegramReducer:telegramReducer,
    companyReducer:companyReducer,
    companyCodeReducer:companyCodeReducer,
    serviceCategoryReducer:serviceCategoryReducer,
    serviceReducer:serviceReducer,
    bundleReducer:bundleReducer,
    moneyTransactionReducer:moneyTransactionReducer,
    paymentMethodsReducer:paymentMethodsReducer,
    suppliersReducer:suppliersReducer,
    provinceReducer:provinceReducer,
    districtReducer:districtReducer,
    resellerReducer:resellerReducer,
    orderReducer:orderReducer,
    languageReducer:languageReducer,
    advertisementsReducer:advertisementsReducer,
    balanceReducer:balanceReducer,
    paymentReducer:paymentReducer,
    purchasedProductsReducer:purchasedProductsReducer,
    rolesReducer:rolesReducer,
    userReducer:userReducer,
    resellerGroupReducer:resellerGroupReducer,
    permissionsReducer:permissionsReducer,
    groupDiscountReducer:groupDiscountReducer,
    hawalaBranchReducer:hawalaBranchReducer,
    hawalaReducer:hawalaReducer,
    groupPricingReducer:groupPricingReducer,
    hawalaCurrenciesReducer:hawalaCurrenciesReducer,
    customerPricingReducer:customerPricingReducer,
    earningBalanceReducer:earningBalanceReducer,
    helpArticlesReducer:helpArticlesReducer,
    resellerInformationReducer:resellerInformationReducer,
    paymentTypesReducer:paymentTypesReducer,
    appSettingsReducer:appSettingsReducer
})



// export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer
