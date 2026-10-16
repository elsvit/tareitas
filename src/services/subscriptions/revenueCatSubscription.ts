import { getPurchasesModule } from './revenueCatInit';

export const TAREITAS_PRO_ENTITLEMENT = 'tareitas_pro';
export const TAREITAS_YEARLY_OFFERING = 'tareitas_yearly';

export async function getYearlyPackage() {
  const key = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  console.log('🔥🔥🔥 TEST_8');
  console.log(
    '🔥🔥🔥 TEST_8 [RevenueCat] iOS key:',
    key ? `${key.substring(0, 8)}...` : 'MISSING'
  ); 

  const Purchases = getPurchasesModule();

  if (!Purchases) {
    throw new Error('RevenueCat is not available');
  }

  const offerings = await Purchases.getOfferings();

  console.log(
    'TEST_16 RC OFFERINGS:',
    JSON.stringify(offerings, null, 2),
  );

  const offering =
    offerings.all[TAREITAS_YEARLY_OFFERING];

  if (!offering) {
    throw new Error(
      `RevenueCat offering "${TAREITAS_YEARLY_OFFERING}" not found`,
    );
  }

  console.log('TEST_29 RC YEARLY OFFERING:', offering);

  const yearlyPackage = offering.annual;

  if (!yearlyPackage) {
    throw new Error(
      'Yearly package is not configured in RevenueCat',
    );
  }

  console.log('TEST_39 RC ANNUAL PACKAGE:', yearlyPackage);

  return yearlyPackage;
}

export async function getYearlyPrice(): Promise<string> {
  const yearlyPackage = await getYearlyPackage();

  return yearlyPackage.product.priceString;
}

export async function purchaseYearly() {
  const Purchases = getPurchasesModule();

  if (!Purchases) {
    throw new Error('RevenueCat is not available');
  }

  const yearlyPackage = await getYearlyPackage();

  const { customerInfo } =
    await Purchases.purchasePackage(yearlyPackage);

  const isPro =
    customerInfo.entitlements.active[
      TAREITAS_PRO_ENTITLEMENT
    ] != null;

  return {
    customerInfo,
    isPro,
  };
}

export async function getIsPro(): Promise<boolean> {
  const Purchases = getPurchasesModule();

  if (!Purchases) {
    return false;
  }

  const customerInfo =
    await Purchases.getCustomerInfo();

  return (
    customerInfo.entitlements.active[
      TAREITAS_PRO_ENTITLEMENT
    ] != null
  );
}

export async function restorePurchases() {
  const Purchases = getPurchasesModule();

  if (!Purchases) {
    throw new Error('RevenueCat is not available');
  }

  return Purchases.restorePurchases();
}