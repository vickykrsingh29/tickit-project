import { Option } from "../../../types/index";

export interface CustomerOption extends Option {
  id: number;
  name: string;
  ancillaryName: string;
  gst?: string;
  gstNumber?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  wpcAddress?: string;
}

export interface POCOption extends Option {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  remarks?: string;
}