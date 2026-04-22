/**
 * Client-side CSV export utility — no library needed.
 * @param {Array}  data      - Array of row objects
 * @param {string} filename  - File name without extension
 * @param {Array}  columns   - [{ key, label }] defining column order & headers
 */
export const exportToCSV = (data, filename, columns) => {
    if (!data || data.length === 0) return;

    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows   = data.map(row =>
        columns.map(c => {
            const val = row[c.key] ?? '';
            // Escape double quotes and wrap in quotes
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
    );

    const csv     = [header, ...rows].join('\n');
    const blob    = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url     = URL.createObjectURL(blob);
    const link    = document.createElement('a');
    link.href     = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
