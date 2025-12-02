/**
 * Export Utilities
 * Functions for exporting table data to various formats
 */

export interface ExportColumn {
  key: string;
  header: string;
  accessor?: string | ((row: any) => any);
  format?: (value: any) => string;
}

/**
 * Convert data to CSV format
 */
export function exportToCSV<T = any>(
  data: T[],
  columns: ExportColumn[],
  filename: string = "export.csv"
) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create CSV header
  const headers = columns.map((col) => col.header).join(",");

  // Create CSV rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let value: any;

        if (typeof col.accessor === "function") {
          value = col.accessor(row);
        } else if (col.accessor) {
          value = (row as any)[col.accessor];
        } else {
          value = (row as any)[col.key];
        }

        // Format value if formatter provided
        if (col.format) {
          value = col.format(value);
        }

        // Handle various value types
        if (value === null || value === undefined) {
          return "";
        }

        // Convert to string and escape quotes
        const stringValue = String(value).replace(/"/g, '""');

        // Wrap in quotes if contains comma, newline, or quote
        if (
          stringValue.includes(",") ||
          stringValue.includes("\n") ||
          stringValue.includes('"')
        ) {
          return `"${stringValue}"`;
        }

        return stringValue;
      })
      .join(",");
  });

  // Combine headers and rows
  const csv = [headers, ...rows].join("\n");

  // Add BOM for UTF-8
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csv;

  // Create blob and download
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * Convert data to Excel format (simple HTML table approach)
 */
export function exportToExcel<T = any>(
  data: T[],
  columns: ExportColumn[],
  filename: string = "export.xlsx"
) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create HTML table
  let html = "<table>";

  // Header row
  html += "<thead><tr>";
  columns.forEach((col) => {
    html += `<th>${col.header}</th>`;
  });
  html += "</tr></thead>";

  // Data rows
  html += "<tbody>";
  data.forEach((row) => {
    html += "<tr>";
    columns.forEach((col) => {
      let value: any;

      if (typeof col.accessor === "function") {
        value = col.accessor(row);
      } else if (col.accessor) {
        value = (row as any)[col.accessor];
      } else {
        value = (row as any)[col.key];
      }

      // Format value if formatter provided
      if (col.format) {
        value = col.format(value);
      }

      const stringValue =
        value !== null && value !== undefined ? String(value) : "";
      html += `<td>${stringValue}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";

  // Create blob with Excel MIME type
  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  downloadBlob(blob, filename);
}

/**
 * Export to JSON format
 */
export function exportToJSON<T = any>(
  data: T[],
  filename: string = "export.json"
) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * Helper function to download blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for export
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format datetime for export
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format number for export
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined || isNaN(value)) return "";
  return value.toFixed(decimals);
}

/**
 * Format currency for export
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

/**
 * Format boolean for export
 */
export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value ? "Có" : "Không";
}
