export type BuyNowEmailPayload = {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  totalPrice: number;
  createdAt: string;
  items: {
    title: string;
    quantity: number;
    price: number;
  }[];
};

export type AppointmentEmailPayload = {
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