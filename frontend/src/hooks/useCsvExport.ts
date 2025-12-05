import { useCallback } from 'react';

interface ExportOptions {
    headers: string[];
    data: any[][];
    filename?: string;
}

export function useCsvExport() {
    const downloadCsv = useCallback(({ headers, data, filename = 'export.csv' }: ExportOptions) => {
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                row.map(field => {
                    const stringField = String(field);
                    // Escape quotes and wrap in quotes if contains comma or quote
                    if (stringField.includes(',') || stringField.includes('"')) {
                        return `"${stringField.replace(/"/g, '""')}"`;
                    }
                    return `"${stringField}"`;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, []);

    return { downloadCsv };
}
