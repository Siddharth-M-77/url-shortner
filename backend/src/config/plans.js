// Single source of truth for plan limits. Prices are in INR per month.
// Use Infinity for "unlimited" so comparisons stay simple.
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    linksPerMonth: 20,
    trackedClicksPerMonth: 1000,
    customAlias: false,
    bioPage: true,
    qrCode: true,
    removeBranding: false,
  },
  starter: {
    name: "Starter",
    price: 99,
    linksPerMonth: Infinity,
    trackedClicksPerMonth: 50000,
    customAlias: true,
    bioPage: true,
    qrCode: true,
    removeBranding: false,
  },
  pro: {
    name: "Pro",
    price: 299,
    linksPerMonth: Infinity,
    trackedClicksPerMonth: Infinity,
    customAlias: true,
    bioPage: true,
    qrCode: true,
    removeBranding: true,
  },
};

export function getPlan(planKey) {
  return PLANS[planKey] || PLANS.free;
}
