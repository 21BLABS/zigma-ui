import { useState } from "react";

interface FilterOption {
  label: string;
  value: string | number;
}

interface TableFiltersProps {
  filters: {
    key: string;
    label: string;
    type: 'select' | 'text' | 'number' | 'date';
    options?: FilterOption[];
    placeholder?: string;
  }[];
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
}

export function TableFilters({ filters, onFilterChange, onReset }: TableFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(key, value);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  const hasActiveFilters = Object.values(localFilters).some(
    value => value !== '' && value !== null && value !== undefined
  );

  return (
    <div className="mb-4 p-4 bg-black/40 border border-green-500/30 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-green-400">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-green-400 hover:text-green-300 underline"
          >
            Reset All
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.key}>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
              {filter.label}
            </label>
            
            {filter.type === 'select' && filter.options ? (
              <select
                value={localFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full bg-black/50 border-green-500/30 text-green-100 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={String(option.value)} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'text' ? (
              <input
                type="text"
                placeholder={filter.placeholder}
                value={localFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full bg-black/50 border-green-500/30 text-green-100 rounded-md px-3 py-2 text-sm"
              />
            ) : filter.type === 'number' ? (
              <input
                type="number"
                placeholder={filter.placeholder}
                value={localFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full bg-black/50 border-green-500/30 text-green-100 rounded-md px-3 py-2 text-sm"
              />
            ) : filter.type === 'date' ? (
              <input
                type="date"
                value={localFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full bg-black/50 border-green-500/30 text-green-100 rounded-md px-3 py-2 text-sm"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
