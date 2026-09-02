import { getPurchasesModule } from './revenueCatInit';

export const TAREITAS_PRO_ENTITLEMENT = 'tareitas_pro';
export const TAREITAS_YEARLY_OFFERING = 'tareitas_yearly';

export async function getYearlyPackage() {
  const Purchases = getPurchasesModule();

  if (!Purchases) {
    throw new Error('RevenueCat is not available');
  }

  const offerings = await Purchases.getOfferings();

  const offering =
    offerings.all[TAREITAS_YEARLY_OFFERING];

  if (!offering) {
    throw new Error(
      `RevenueCat offering "${TAREITAS_YEARLY_OFFERING}" not found`,
    );
  }

  const yearlyPackage = offering.annual;

  if (!yearlyPackage) {
    throw new Error(
      'Yearly package is not configured in RevenueCat',
    );
  }

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