export type CartProductItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

export type BuyNowRecord = {
  type: "BUY_NOW";
  code: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  items: CartProductItem[];
  totalPrice: number;
  createdAt: string;
};

export type AppointmentRecord = {
  type: "BOOK_APPOINTMENT";
  code: string;
  fullName: string;
  email: string;
  phone: string;
  purpose: string;
  date: string;
  timeSlot: string;
  notes: string;
  createdAt: string;
};

export type CheckoutRecord = BuyNowRecord | AppointmentRecord;