/**
 * Export Utilities
 * Functions for exporting data to various formats
 */

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

export const exportToTXT = (data: string, filename: string) => {
  downloadFile(data, `${filename}.txt`, 'text/plain');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatDateForExport = (date: string | Date): string => {
  return new Date(date).toISOString().split('T')[0];
};

export const formatTimestampForExport = (timestamp: string | number): string => {
  return new Date(timestamp).toISOString();
};
