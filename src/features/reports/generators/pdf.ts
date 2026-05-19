import type { ReportData } from "./data";
import type { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";

const HEADER_COLOR = "#1E3A5F";
const ALT_ROW_COLOR = "#F8FAFC";
const FONT_SIZE = 9;

function tableHeader(values: string[]): TableCell[] {
  return values.map((v) => ({
    text: v,
    bold: true,
    color: "#FFFFFF",
    fillColor: HEADER_COLOR,
    fontSize: FONT_SIZE,
    margin: [3, 4, 3, 4],
  }));
}

function tableRow(values: (string | number)[], alt: boolean): TableCell[] {
  return values.map((v) => ({
    text: String(v),
    fontSize: FONT_SIZE,
    fillColor: alt ? ALT_ROW_COLOR : "#FFFFFF",
    margin: [3, 3, 3, 3],
  }));
}

function summaryRow(label: string, value: string): TableCell[] {
  return [
    { text: label, bold: true, fontSize: FONT_SIZE, fillColor: "#E2EAF4", colSpan: 1, margin: [3, 3, 3, 3] },
    { text: value, bold: true, fontSize: FONT_SIZE, fillColor: "#E2EAF4", colSpan: 1, margin: [3, 3, 3, 3] },
  ];
}

function buildTable(data: ReportData): Content {
  if (data.type === "production") {
    const headers = ["Tanggal", "Kandang", "Total", "Baik", "Retak", "Rusak", "Kecil", "Besar", "Berat(kg)"];
    const body: TableCell[][] = [tableHeader(headers)];
    data.rows.forEach((r, i) => {
      body.push(tableRow([
        r.date, r.coopName, r.totalEggs, r.goodEggs,
        r.crackedEggs, r.brokenEggs, r.smallEggs, r.largeEggs,
        r.weightKg ?? "-",
      ], i % 2 === 1));
    });
    body.push(tableRow(["TOTAL", "", data.summary.totalEggs, data.summary.goodEggs, "", "", "", "", ""], false).map(c => ({ ...(c as object), bold: true, fillColor: "#E2EAF4" } as TableCell)));
    return { table: { headerRows: 1, widths: [55, 65, 35, 35, 35, 35, 35, 35, 40], body }, layout: "lightHorizontalLines" };
  }

  if (data.type === "feed") {
    const headers = ["Tanggal", "Pakan", "Tipe", "Jumlah", "Kandang", "Harga", "Supplier"];
    const body: TableCell[][] = [tableHeader(headers)];
    data.rows.forEach((r, i) => {
      body.push(tableRow([
        r.date, r.stockName, r.type,
        parseFloat(r.quantity).toLocaleString("id-ID"),
        r.coopName ?? "-",
        r.pricePerUnit ? parseFloat(r.pricePerUnit).toLocaleString("id-ID") : "-",
        r.supplier ?? "-",
      ], i % 2 === 1));
    });
    return { table: { headerRows: 1, widths: [50, 80, 55, 45, 65, 50, "*"], body }, layout: "lightHorizontalLines" };
  }

  if (data.type === "health") {
    const headers = ["Tanggal", "Kandang", "Sakit", "Mati", "Tindakan", "Catatan"];
    const body: TableCell[][] = [tableHeader(headers)];
    data.rows.forEach((r, i) => {
      body.push(tableRow([r.date, r.coopName, r.sickCount, r.deadCount, r.treatment ?? "-", r.notes ?? ""], i % 2 === 1));
    });
    body.push(tableRow(["TOTAL", "", data.summary.totalSick, data.summary.totalDead, "", ""], false).map(c => ({ ...(c as object), bold: true, fillColor: "#E2EAF4" } as TableCell)));
    return { table: { headerRows: 1, widths: [55, 80, 40, 40, 110, "*"], body }, layout: "lightHorizontalLines" };
  }

  if (data.type === "vaccination") {
    const headers = ["Kandang", "Vaksin", "Tgl Jadwal", "Selesai Pada", "Status", "Catatan"];
    const body: TableCell[][] = [tableHeader(headers)];
    data.rows.forEach((r, i) => {
      body.push(tableRow([
        r.coopName, r.vaccineName, r.scheduledDate,
        r.completedAt ? r.completedAt.toLocaleDateString("id-ID") : "-",
        r.status === "selesai" ? "Selesai" : "Belum",
        r.notes ?? "",
      ], i % 2 === 1));
    });
    return { table: { headerRows: 1, widths: [70, 100, 60, 70, 50, "*"], body }, layout: "lightHorizontalLines" };
  }

  // population
  const headers = ["Tanggal", "Kandang", "Tipe", "Jumlah", "Alasan", "Catatan"];
  const body: TableCell[][] = [tableHeader(headers)];
  data.rows.forEach((r, i) => {
    body.push(tableRow([r.date, r.coopName, r.type, r.count, r.reason ?? "-", r.notes ?? ""], i % 2 === 1));
  });
  return { table: { headerRows: 1, widths: [55, 80, 60, 45, 100, "*"], body }, layout: "lightHorizontalLines" };
}

export async function generatePdf(data: ReportData, title: string, period: string): Promise<Buffer> {
  // Dynamic import to avoid loading 2MB font VFS on every module load.
  // pdfmake 0.3.x: virtualfs.writeFileSync expects Buffer (not base64 string).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfMakeModule, vfsFonts] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]) as unknown as [any, any];

  const pdfMake = pdfMakeModule.default ?? pdfMakeModule;
  const fontMap: Record<string, string> = vfsFonts.default ?? vfsFonts;
  for (const [name, b64] of Object.entries(fontMap)) {
    pdfMake.virtualfs.writeFileSync(name, Buffer.from(b64, "base64"));
  }

  const tableContent = buildTable(data);

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [30, 50, 30, 45],
    header: {
      columns: [
        { text: "Peternakan Telur — Petelur", style: "farmName", margin: [30, 15, 0, 0] },
        { text: `${title}\n${period}`, style: "reportTitle", alignment: "right", margin: [0, 15, 30, 0] },
      ],
    },
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: `Dibuat: ${new Date().toLocaleString("id-ID")}`, style: "footer", margin: [30, 0, 0, 0] },
        { text: `Halaman ${currentPage} / ${pageCount}`, style: "footer", alignment: "right", margin: [0, 0, 30, 0] },
      ],
    }),
    content: [
      { text: title, style: "title" },
      { text: period, style: "period" },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1, lineColor: HEADER_COLOR }], margin: [0, 0, 0, 8] },
      tableContent,
      { text: `\nTotal data: ${data.rows.length} baris`, style: "rowCount" },
    ],
    styles: {
      farmName: { fontSize: 8, color: "#6B7280" },
      reportTitle: { fontSize: 8, color: "#6B7280" },
      title: { fontSize: 14, bold: true, color: HEADER_COLOR, margin: [0, 0, 0, 4] },
      period: { fontSize: 10, color: "#6B7280", margin: [0, 0, 0, 8] },
      footer: { fontSize: 7, color: "#9CA3AF" },
      rowCount: { fontSize: 8, color: "#9CA3AF", italics: true },
    },
    defaultStyle: { font: "Roboto" },
  };

  // pdfmake 0.3.x: createPdf returns { pdfDocumentPromise } — a PDFKit readable stream.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { pdfDocumentPromise } = (pdfMake as any).createPdf(docDefinition) as { pdfDocumentPromise: Promise<NodeJS.ReadableStream> };
  const pdfDoc = await pdfDocumentPromise;
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdfDoc.on("data", (c: Buffer) => chunks.push(c));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", reject);
    (pdfDoc as unknown as { end: () => void }).end();
  });
}
