import type { AppointmentRecord, BuyNowRecord, CheckoutRecord } from "@/lib/checkout-types";

const RECORDS_KEY = "shop-sensrs-checkout-records";
const BUY_COUNTER_KEY = "buy-now-counter";
const APPOINTMENT_COUNTER_KEY = "appointment-counter";

export function getCheckoutRecords(): CheckoutRecord[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(RECORDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveCheckoutRecords(records: CheckoutRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function generateBuyNowCode(): string {
  if (typeof window === "undefined") return "BN101";

  const next = Number(localStorage.getItem(BUY_COUNTER_KEY) || "100") + 1;
  localStorage.setItem(BUY_COUNTER_KEY, String(next));
  return `BN${next}`;
}

export function generateAppointmentCode(): string {
  if (typeof window === "undefined") return "BA101";

  const next = Number(localStorage.getItem(APPOINTMENT_COUNTER_KEY) || "100") + 1;
  localStorage.setItem(APPOINTMENT_COUNTER_KEY, String(next));
  return `BA${next}`;
}

export function addBuyNowRecord(record: BuyNowRecord) {
  const records = getCheckoutRecords();
  saveCheckoutRecords([...records, record]);
}

export function addAppointmentRecord(record: AppointmentRecord) {
  const records = getCheckoutRecords();
  saveCheckoutRecords([...records, record]);
}

export function getBookedSlotsByDate(date: string): string[] {
  const records = getCheckoutRecords();

  return records
    .filter(
      (record): record is AppointmentRecord =>
        record.type === "BOOK_APPOINTMENT" && record.date === date
    )
    .map((record) => record.timeSlot);
}

export function isSlotBooked(date: string, timeSlot: string): boolean {
  const bookedSlots = getBookedSlotsByDate(date);
  return bookedSlots.includes(timeSlot);
}