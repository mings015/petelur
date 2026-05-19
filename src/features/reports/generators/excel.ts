import ExcelJS from "exceljs";
import type { ReportData } from "./data";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E3A5F" },
};
const HEADER_FONT: Partial<ExcelJS.Font> = { color: { argb: "FFFFFFFF" }, bold: true };
const SUMMARY_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF0F4F8" },
};

function headerRow(ws: ExcelJS.Worksheet, values: string[]) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  ws.getRow(1).height = 20;
}

function styleNumber(cell: ExcelJS.Cell) {
  cell.numFmt = "#,##0";
}

function setColWidths(ws: ExcelJS.Worksheet, widths: number[]) {
  ws.columns = widths.map((w) => ({ width: w }));
}

export async function generateExcel(data: ReportData, title: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Petelur";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Laporan");

  // Title rows
  ws.addRow([title]);
  ws.addRow([`Dibuat: ${new Date().toLocaleString("id-ID")}`]);
  ws.addRow([]);

  if (data.type === "production") {
    setColWidths(ws, [12, 20, 12, 12, 12, 12, 12, 12, 10]);
    headerRow(ws, ["Tanggal", "Kandang", "Total", "Baik", "Retak", "Rusak", "Kecil", "Besar", "Berat (kg)"]);

    for (const row of data.rows) {
      const r = ws.addRow([
        row.date,
        row.coopName,
        row.totalEggs,
        row.goodEggs,
        row.crackedEggs,
        row.brokenEggs,
        row.smallEggs,
        row.largeEggs,
        row.weightKg ? parseFloat(row.weightKg) : "",
      ]);
      [3, 4, 5, 6, 7, 8].forEach((i) => styleNumber(r.getCell(i)));
    }

    const summary = ws.addRow(["TOTAL", "", data.summary.totalEggs, data.summary.goodEggs, "", "", "", "", ""]);
    summary.eachCell((c) => { c.fill = SUMMARY_FILL; c.font = { bold: true }; });
    [3, 4].forEach((i) => styleNumber(summary.getCell(i)));
  }

  if (data.type === "feed") {
    setColWidths(ws, [12, 22, 12, 12, 20, 14, 20, 30]);
    headerRow(ws, ["Tanggal", "Jenis Pakan", "Tipe", "Jumlah", "Kandang", "Harga/Satuan", "Supplier", "Catatan"]);

    for (const row of data.rows) {
      ws.addRow([
        row.date,
        row.stockName,
        row.type,
        parseFloat(row.quantity),
        row.coopName ?? "-",
        row.pricePerUnit ? parseFloat(row.pricePerUnit) : "-",
        row.supplier ?? "-",
        row.notes ?? "",
      ]);
    }

    const summary = ws.addRow(["TOTAL", "", "Pembelian", data.summary.totalPurchase, "", "", "", ""]);
    ws.addRow(["", "", "Pemakaian", data.summary.totalUsage, "", "", "", ""]);
    summary.eachCell((c) => { c.fill = SUMMARY_FILL; c.font = { bold: true }; });
  }

  if (data.type === "health") {
    setColWidths(ws, [12, 20, 12, 12, 24, 32]);
    headerRow(ws, ["Tanggal", "Kandang", "Sakit", "Mati", "Tindakan", "Catatan"]);

    for (const row of data.rows) {
      const r = ws.addRow([
        row.date, row.coopName, row.sickCount, row.deadCount,
        row.treatment ?? "-", row.notes ?? "",
      ]);
      [3, 4].forEach((i) => styleNumber(r.getCell(i)));
    }

    const summary = ws.addRow(["TOTAL", "", data.summary.totalSick, data.summary.totalDead, "", ""]);
    summary.eachCell((c) => { c.fill = SUMMARY_FILL; c.font = { bold: true }; });
    [3, 4].forEach((i) => styleNumber(summary.getCell(i)));
  }

  if (data.type === "vaccination") {
    setColWidths(ws, [20, 28, 14, 22, 12, 32]);
    headerRow(ws, ["Kandang", "Vaksin", "Tgl Jadwal", "Selesai Pada", "Status", "Catatan"]);

    for (const row of data.rows) {
      ws.addRow([
        row.coopName, row.vaccineName, row.scheduledDate,
        row.completedAt ? row.completedAt.toLocaleDateString("id-ID") : "-",
        row.status === "selesai" ? "✓ Selesai" : "Belum",
        row.notes ?? "",
      ]);
    }

    const summary = ws.addRow([`Total: ${data.summary.done}/${data.summary.total} selesai`, "", "", "", "", ""]);
    summary.eachCell((c) => { c.fill = SUMMARY_FILL; c.font = { bold: true }; });
  }

  if (data.type === "population") {
    setColWidths(ws, [12, 20, 16, 10, 24, 30]);
    headerRow(ws, ["Tanggal", "Kandang", "Tipe", "Jumlah", "Alasan", "Catatan"]);

    for (const row of data.rows) {
      const r = ws.addRow([
        row.date, row.coopName, row.type, row.count, row.reason ?? "-", row.notes ?? "",
      ]);
      styleNumber(r.getCell(4));
    }

    const summary = ws.addRow(["TOTAL", "", "Masuk / Keluar", `+${data.summary.totalIn} / -${data.summary.totalOut}`, "", ""]);
    summary.eachCell((c) => { c.fill = SUMMARY_FILL; c.font = { bold: true }; });
  }

  // Freeze header row (row 4 = first data header)
  ws.views = [{ state: "frozen", ySplit: 4 }];

  return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}
