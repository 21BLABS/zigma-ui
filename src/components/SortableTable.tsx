import { useState } from "react";

interface SortableTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any) => React.ReactNode;
  }[];
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
}

export function SortableTable<T>({ data, columns, onSort }: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof T) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    
    if (sortKey === key) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    setSortKey(key);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(key, newDirection);
    }
  };

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      })
    : data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-green-500/20">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`text-left py-2 px-4 text-green-400 ${
                  column.sortable ? 'cursor-pointer hover:bg-green-500/10' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortKey === column.key && (
                    <span className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx} className="border-b border-green-500/10 hover:bg-green-500/5">
              {columns.map((column) => (
                <td key={String(column.key)} className="py-2 px-4">
                  {column.render
                    ? column.render(row[column.key])
                    : String(row[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
