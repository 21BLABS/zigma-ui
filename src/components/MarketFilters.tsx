import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MarketFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  categories: string[];
  platforms: string[];
  quickFilters: string[];
  minEdge?: number;
  minConfidence?: number;
}

const categories = ['Crypto', 'Politics', 'Sports', 'Weather', 'Tech', 'Business', 'Culture'];
const platforms = ['Polymarket', 'Kalshi', 'Manifold'];
const quickFilters = ['Trending', 'New', 'Ending Soon', 'High Edge', 'High Confidence'];

const MarketFilters = ({ onSearch, onFilterChange }: MarketFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    platforms: [],
    quickFilters: [],
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const togglePlatform = (platform: string) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    
    const newFilters = { ...filters, platforms: newPlatforms };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleQuickFilter = (filter: string) => {
    const newQuickFilters = filters.quickFilters.includes(filter)
      ? filters.quickFilters.filter(f => f !== filter)
      : [...filters.quickFilters, filter];
    
    const newFilters = { ...filters, quickFilters: newQuickFilters };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      categories: [],
      platforms: [],
      quickFilters: [],
    };
    setFilters(emptyFilters);
    setSearchQuery('');
    onSearch('');
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.platforms.length + 
    filters.quickFilters.length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-300/60" />
        <Input
          type="text"
          placeholder="Search markets... ⌘K"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 bg-black border-green-500/30 text-white placeholder:text-green-300/40 focus:border-green-500/50"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Badge
            key={filter}
            variant="outline"
            className={`cursor-pointer transition-all ${
              filters.quickFilters.includes(filter)
                ? 'bg-green-500/20 border-green-500/50 text-green-300'
                : 'border-green-500/30 text-green-300/60 hover:border-green-500/50'
            }`}
            onClick={() => toggleQuickFilter(filter)}
          >
            {filter}
          </Badge>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-green-500 text-black text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-black border-green-500/30">
            <DropdownMenuLabel className="text-green-300">Categories</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-green-500/20" />
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                className="text-green-300/80 focus:text-green-300 focus:bg-green-500/10"
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
            
            <DropdownMenuSeparator className="bg-green-500/20" />
            <DropdownMenuLabel className="text-green-300">Platforms</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-green-500/20" />
            {platforms.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform}
                checked={filters.platforms.includes(platform)}
                onCheckedChange={() => togglePlatform(platform)}
                className="text-green-300/80 focus:text-green-300 focus:bg-green-500/10"
              >
                {platform}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-green-300/60 hover:text-green-300"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default MarketFilters;
