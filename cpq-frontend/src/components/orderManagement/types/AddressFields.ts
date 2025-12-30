export default interface AddressFields {
    [key: string]: string | undefined;
    billingStreetAddress?: string;
    billingAddressLine2?: string;
    billingCity?: string;
    billingDistrict?: string;
    billingState?: string;
    billingPin?: string;
    billingCountry?: string;
    shippingStreetAddress?: string;
    shippingAddressLine2?: string;
    shippingCity?: string;
    shippingDistrict?: string;
    shippingState?: string;
    shippingPin?: string;
    shippingCountry?: string;
    wpcStreetAddress?: string;
    wpcAddressLine2?: string;
    wpcCity?: string;
    wpcDistrict?: string;
    wpcState?: string;
    wpcPin?: string;
    wpcCountry?: string;
  }
  