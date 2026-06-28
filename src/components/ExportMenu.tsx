"use client";

import { Download, FileText, FileSpreadsheet, FileJson, Printer, Globe, Lock } from "lucide-react";
import {
  downloadBlob,
  printReport,
  reportToCSV,
  reportToHTML,
  reportToJSON,
  reportToXLS,
  slug,
  type ReportData,
} from "@/lib/exporters";
import { useSubscription } from "@/context/SubscriptionProvider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown";

interface Props {
  report: ReportData;
}

export function ExportMenu({ report }: Props) {
  const { isPro, showUpsell } = useSubscription();

  if (!isPro) {
    return (
      <Button variant="outline" onClick={showUpsell} title="Доступно на Pro">
        <Lock className="h-4 w-4" />
        Экспорт
      </Button>
    );
  }

  const base = slug(report.title);
  const items = [
    {
      icon: FileText,
      label: "CSV",
      run: () => downloadBlob(`${base}.csv`, reportToCSV(report), "text/csv;charset=utf-8"),
    },
    {
      icon: FileSpreadsheet,
      label: "Excel (.xls)",
      run: () => downloadBlob(`${base}.xls`, reportToXLS(report), "application/vnd.ms-excel"),
    },
    {
      icon: FileJson,
      label: "JSON",
      run: () => downloadBlob(`${base}.json`, reportToJSON(report), "application/json;charset=utf-8"),
    },
    {
      icon: Globe,
      label: "HTML-отчёт",
      run: () => downloadBlob(`${base}.html`, reportToHTML(report), "text/html;charset=utf-8"),
    },
    {
      icon: Printer,
      label: "PDF (печать)",
      run: () => printReport(report),
    },
  ];

  return (
    <DropdownMenu
      trigger={
        <Button>
          <Download className="h-4 w-4" />
          Экспорт
        </Button>
      }
    >
      {items.map((it) => (
        <DropdownMenuItem key={it.label} icon={it.icon} onClick={it.run}>
          {it.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenu>
  );
}
