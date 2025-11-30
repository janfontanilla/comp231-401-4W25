"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

interface ExportButtonsProps {
  startDate?: string;
  endDate?: string;
}

export const ExportButtons = ({
  startDate,
  endDate,
}: ExportButtonsProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        format,
      });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/admin/reports/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mytracker-report-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleExport("csv")}
        disabled={isExporting}
        variant="outline"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button
        onClick={() => handleExport("pdf")}
        disabled={isExporting}
        variant="outline"
      >
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
};

