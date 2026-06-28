export interface ReportSection {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface ReportData {
  title: string;
  generatedAt: string;
  kpis: { label: string; value: string }[];
  sections: ReportSection[];
}

export function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob(["\uFEFF" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvCell(value: string): string {
  const v = value ?? "";
  if (/[";\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function reportToCSV(r: ReportData): string {
  const lines: string[] = [r.title, `Сформировано: ${r.generatedAt}`, ""];
  for (const k of r.kpis) lines.push(`${k.label};${k.value}`);
  for (const sec of r.sections) {
    lines.push("", sec.title, sec.columns.map(csvCell).join(";"));
    for (const row of sec.rows) lines.push(row.map(csvCell).join(";"));
  }
  return lines.join("\n");
}

export function reportToJSON(r: ReportData): string {
  return JSON.stringify(r, null, 2);
}

function escapeHtml(s: string): string {
  return (s ?? "").replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;"
  );
}

function sectionTablesHtml(r: ReportData): string {
  const kpiRows = r.kpis
    .map((k) => `<tr><td>${escapeHtml(k.label)}</td><td><b>${escapeHtml(k.value)}</b></td></tr>`)
    .join("");
  const sections = r.sections
    .map((sec) => {
      const head = sec.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("");
      const body = sec.rows
        .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
        .join("");
      return `<h3>${escapeHtml(sec.title)}</h3><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    })
    .join("");
  return `
    <h2>Ключевые показатели</h2>
    <table class="kpi"><tbody>${kpiRows}</tbody></table>
    ${sections}
  `;
}

export function reportToXLS(r: ReportData): string {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${escapeHtml(
    r.title
  )}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body><h2>${escapeHtml(r.title)}</h2>${sectionTablesHtml(r)}</body></html>`;
}

export function reportToHTML(r: ReportData): string {
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(
    r.title
  )}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: Manrope, -apple-system, Segoe UI, Roboto, sans-serif; background:#F5F5F6; color:#111; margin:0; padding:32px; }
  .wrap { max-width:820px; margin:0 auto; }
  h1 { font-size:26px; margin:0 0 4px; }
  .meta { color:#71717A; font-size:13px; margin-bottom:24px; }
  h2 { font-size:16px; margin:28px 0 10px; }
  h3 { font-size:13px; margin:20px 0 8px; color:#71717A; text-transform:uppercase; letter-spacing:.04em; }
  table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #E5E7EB; border-radius:12px; overflow:hidden; font-size:13px; }
  th, td { padding:10px 14px; text-align:left; border-bottom:1px solid #E5E7EB; }
  th { background:#F4F4F5; font-weight:600; color:#71717A; font-size:12px; text-transform:uppercase; letter-spacing:.03em; }
  tr:last-child td { border-bottom:none; }
  .kpi td:first-child { color:#71717A; }
  .brand { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
  .logo { width:34px; height:34px; border-radius:9px; background:#2563eb; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; }
</style></head>
<body><div class="wrap">
  <div class="brand"><div class="logo">T</div><div><div style="font-weight:700">TutorCRM</div><div class="meta" style="margin:0">Отчёт по аналитике</div></div></div>
  <h1>${escapeHtml(r.title)}</h1>
  <div class="meta">Сформировано: ${escapeHtml(r.generatedAt)}</div>
  ${sectionTablesHtml(r)}
</div></body></html>`;
}

export function printReport(r: ReportData) {
  const w = window.open("", "_blank", "width=860,height=900");
  if (!w) return;
  w.document.write(reportToHTML(r));
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 400);
}

export function slug(s: string): string {
  return s.replace(/[^a-z0-9а-я]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "report";
}
