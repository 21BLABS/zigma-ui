import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Search, Filter, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Position {
  title: string;
  outcome: string;
  size: number;
  avgPrice: number;
  currentValue: number;
  initialValue: number;
  cashPnl: number;
  percentPnl: number;
  curPrice: number;
  slug?: string;
}

interface PositionTableProps {
  positions: Position[];
}

type SortField = 'title' | 'size' | 'cashPnl' | 'percentPnl' | 'currentValue';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'profitable' | 'losing' | 'large';

export const PositionTable: React.FC<PositionTableProps> = ({ positions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('cashPnl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showCount, setShowCount] = useState(10);

  // Safety check for positions
  if (!positions || !Array.isArray(positions)) {
    return (
      <Card className="bg-gray-900/80 border-green-500/20">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            No position data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredAndSortedPositions = useMemo(() => {
    let filtered = positions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(pos =>
        (pos.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'profitable':
        filtered = filtered.filter(pos => (pos.cashPnl || 0) > 0);
        break;
      case 'losing':
        filtered = filtered.filter(pos => (pos.cashPnl || 0) < 0);
        break;
      case 'large':
        filtered = filtered.filter(pos => (pos.currentValue || 0) > 1000);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === 'title') {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [positions, searchQuery, sortField, sortDirection, filterType]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const totalValue = positions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0);
  const totalPnl = positions.reduce((sum, pos) => sum + (pos.cashPnl || 0), 0);
  const profitableCount = positions.filter(pos => (pos.cashPnl || 0) > 0).length;

  return (
    <Card className="bg-gray-900/80 border-green-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Position Breakdown
            <Badge variant="outline">{positions.length} total</Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Total Value:</span>
            <span className="font-bold text-white">${(totalValue / 1000).toFixed(1)}k</span>
            <span className={cn("font-bold", totalPnl >= 0 ? "text-green-400" : "text-red-400")}>
              ({totalPnl >= 0 ? '+' : ''}${(totalPnl / 1000).toFixed(1)}k)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/40 border-green-500/20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="border-green-500/30"
              >
                All
              </Button>
              <Button
                variant={filterType === 'profitable' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('profitable')}
                className="border-green-500/30"
              >
                Profitable ({profitableCount})
              </Button>
              <Button
                variant={filterType === 'losing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('losing')}
                className="border-green-500/30"
              >
                Losing ({positions.length - profitableCount})
              </Button>
              <Button
                variant={filterType === 'large' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('large')}
                className="border-green-500/30"
              >
                Large (&gt;$1k)
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-green-500/20 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black/40 hover:bg-black/40">
                    <TableHead className="text-green-400">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('title')}
                        className="hover:text-green-300"
                      >
                        Market
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-green-400">Outcome</TableHead>
                    <TableHead className="text-green-400 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('currentValue')}
                        className="hover:text-green-300"
                      >
                        Value
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-green-400 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('cashPnl')}
                        className="hover:text-green-300"
                      >
                        P&L
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-green-400 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('percentPnl')}
                        className="hover:text-green-300"
                      >
                        %
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-green-400 text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPositions.slice(0, showCount).map((position, index) => (
                    <TableRow key={index} className="hover:bg-green-500/5">
                      <TableCell className="font-medium max-w-xs">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-white truncate max-w-[300px]">{position.title || 'Unknown Market'}</div>
                          {position.slug && (
                            <a
                              href={`https://polymarket.com/event/${position.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={(position.outcome || '') === 'Yes' ? 'default' : 'secondary'} className="text-xs">
                          {position.outcome || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-white">
                        ${(position.currentValue || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold",
                        (position.cashPnl || 0) >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {(position.cashPnl || 0) >= 0 ? '+' : ''}{(position.cashPnl || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold",
                        (position.percentPnl || 0) >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {(position.percentPnl || 0) >= 0 ? '+' : ''}{(position.percentPnl || 0).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right text-gray-400">
                        ${(position.curPrice || 0).toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Load More */}
          {filteredAndSortedPositions.length > showCount && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowCount(showCount + 20)}
                className="border-green-500/30"
              >
                Show More ({filteredAndSortedPositions.length - showCount} remaining)
              </Button>
            </div>
          )}

          {/* Summary */}
          {filteredAndSortedPositions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No positions match your filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
