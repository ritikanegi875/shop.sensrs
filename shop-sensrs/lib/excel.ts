import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

type ExcelRow = {
  recordType: "BUY_NOW" | "BOOK_APPOINTMENT";
  code: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  purpose?: string;
  appointmentDate?: string;
  appointmentTimeSlot?: string;
  itemsSummary?: string;
  totalPrice?: number;
  notes?: string;
  createdAt: string;
};

const FILE_NAME = "shop-sensrs-records.xlsx";
const SHEET_NAME = "Records";

function getExportDir() {
  return path.join(process.cwd(), "public", "exports");
}

function getExcelPath() {
  return path.join(getExportDir(), FILE_NAME);
}

function getHeaders() {
  return [
    "recordType",
    "code",
    "fullName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
    "purpose",
    "appointmentDate",
    "appointmentTimeSlot",
    "itemsSummary",
    "totalPrice",
    "notes",
    "createdAt",
  ];
}

function ensureExportDir() {
  const exportDir = getExportDir();

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
}

function buildWorkbook(rows: ExcelRow[]) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: getHeaders(),
  });
  XLSX.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);
  return workbook;
}

function writeWorkbookToFile(workbook: XLSX.WorkBook, filePath: string) {
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  fs.writeFileSync(filePath, buffer);
}

function createFreshWorkbook(filePath: string) {
  const workbook = buildWorkbook([]);
  writeWorkbookToFile(workbook, filePath);
}

function ensureWorkbook() {
  ensureExportDir();

  const filePath = getExcelPath();

  if (!fs.existsSync(filePath)) {
    createFreshWorkbook(filePath);
    return;
  }

  try {
    XLSX.readFile(filePath);
  } catch (error) {
    console.warn("Unreadable Excel file found. Recreating file...");
    createFreshWorkbook(filePath);
  }
}

export function appendRecordToExcel(row: ExcelRow) {
  ensureWorkbook();

  const filePath = getExcelPath();

  let existingRows: ExcelRow[] = [];

  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[SHEET_NAME];

    if (worksheet) {
      existingRows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
    }
  } catch (error) {
    console.warn("Failed to read workbook. Starting fresh...");
    existingRows = [];
  }

  existingRows.push(row);

  const workbook = buildWorkbook(existingRows);
  writeWorkbookToFile(workbook, filePath);
}

export function formatItemsSummary(
  items: { title: string; quantity: number; price: number }[]
) {
  return items
    .map(
      (item) =>
        `${item.title} x ${item.quantity} (₹${(
          item.price * item.quantity
        ).toLocaleString("en-IN")})`
    )
    .join(" | ");
}