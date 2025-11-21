import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Filter, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterConfig {
  column: string;
  type: "numeric" | "categorical" | "text";
  operator?: "equals" | "gt" | "lt" | "gte" | "lte" | "contains" | "in";
  value?: any;
  values?: any[];
}

interface DataFilterPanelProps {
  data: any[];
  columns: { name: string; type: "numeric" | "categorical" | "text" }[];
  onFilterChange: (filteredData: any[], activeFilters: FilterConfig[]) => void;
  className?: string;
}

export const DataFilterPanel = ({
  data,
  columns,
  onFilterChange,
  className,
}: DataFilterPanelProps) => {
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const applyFilters = () => {
    if (filters.length === 0) {
      onFilterChange(data, []);
      return;
    }

    const filtered = data.filter((row) => {
      return filters.every((filter) => {
        const cellValue = row[filter.column];
        
        if (cellValue === null || cellValue === undefined || cellValue === "") {
          return false;
        }

        switch (filter.type) {
          case "numeric":
            const numValue = parseFloat(cellValue);
            const filterNumValue = parseFloat(filter.value);
            
            if (isNaN(numValue) || isNaN(filterNumValue)) return false;
            
            switch (filter.operator) {
              case "equals":
                return numValue === filterNumValue;
              case "gt":
                return numValue > filterNumValue;
              case "lt":
                return numValue < filterNumValue;
              case "gte":
                return numValue >= filterNumValue;
              case "lte":
                return numValue <= filterNumValue;
              default:
                return true;
            }

          case "categorical":
            if (filter.operator === "in" && filter.values) {
              return filter.values.includes(String(cellValue));
            }
            return String(cellValue) === String(filter.value);

          case "text":
            if (filter.operator === "contains") {
              return String(cellValue).toLowerCase().includes(String(filter.value).toLowerCase());
            }
            return String(cellValue).toLowerCase() === String(filter.value).toLowerCase();

          default:
            return true;
        }
      });
    });

    onFilterChange(filtered, filters);
  };

  const addFilter = (columnName: string) => {
    const column = columns.find((c) => c.name === columnName);
    if (!column) return;

    const newFilter: FilterConfig = {
      column: columnName,
      type: column.type,
      operator: column.type === "numeric" ? "gte" : column.type === "categorical" ? "in" : "contains",
      value: "",
      values: column.type === "categorical" ? [] : undefined,
    };

    setFilters([...filters, newFilter]);
  };

  const updateFilter = (index: number, updates: Partial<FilterConfig>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    setFilters([]);
  };

  const getUniqueValues = (columnName: string): string[] => {
    const values = data.map((row) => String(row[columnName])).filter(Boolean);
    return Array.from(new Set(values)).sort().slice(0, 50); // Limit to 50 unique values
  };

  const availableColumns = columns.filter(
    (col) => !filters.find((f) => f.column === col.name)
  );

  return (
    <Card className={cn("border-primary/20", className)} role="region" aria-label="Data filters">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle>Data Filters</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {filters.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filters.length} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Collapse filters" : "Expand filters"}
            >
              {isOpen ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
        <CardDescription>
          Filter data by column values to focus your analysis
        </CardDescription>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          {/* Active Filters */}
          {filters.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Active Filters</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  aria-label="Clear all filters"
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Clear All
                </Button>
              </div>

              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {filters.map((filter, index) => (
                    <Card key={index} className="p-3 bg-muted/30">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-sm">{filter.column}</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFilter(index)}
                            aria-label={`Remove filter for ${filter.column}`}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>

                        {filter.type === "numeric" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label htmlFor={`operator-${index}`} className="text-xs">
                                Operator
                              </Label>
                              <Select
                                value={filter.operator}
                                onValueChange={(value) =>
                                  updateFilter(index, { operator: value as any })
                                }
                              >
                                <SelectTrigger id={`operator-${index}`} className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">=</SelectItem>
                                  <SelectItem value="gt">&gt;</SelectItem>
                                  <SelectItem value="gte">&gt;=</SelectItem>
                                  <SelectItem value="lt">&lt;</SelectItem>
                                  <SelectItem value="lte">&lt;=</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`value-${index}`} className="text-xs">
                                Value
                              </Label>
                              <Input
                                id={`value-${index}`}
                                type="number"
                                value={filter.value || ""}
                                onChange={(e) =>
                                  updateFilter(index, { value: e.target.value })
                                }
                                placeholder="Enter value"
                                className="h-9"
                                aria-label={`Filter value for ${filter.column}`}
                              />
                            </div>
                          </div>
                        )}

                        {filter.type === "categorical" && (
                          <div className="space-y-2">
                            <Label className="text-xs">Select Values</Label>
                            <ScrollArea className="h-32 border rounded-md p-2">
                              <div className="space-y-2">
                                {getUniqueValues(filter.column).map((value) => (
                                  <div key={value} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${filter.column}-${value}`}
                                      checked={filter.values?.includes(value)}
                                      onCheckedChange={(checked) => {
                                        const currentValues = filter.values || [];
                                        const newValues = checked
                                          ? [...currentValues, value]
                                          : currentValues.filter((v) => v !== value);
                                        updateFilter(index, { values: newValues });
                                      }}
                                      aria-label={`Include ${value}`}
                                    />
                                    <Label
                                      htmlFor={`${filter.column}-${value}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {value}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}

                        {filter.type === "text" && (
                          <div className="space-y-1">
                            <Label htmlFor={`text-value-${index}`} className="text-xs">
                              Contains Text
                            </Label>
                            <Input
                              id={`text-value-${index}`}
                              type="text"
                              value={filter.value || ""}
                              onChange={(e) => updateFilter(index, { value: e.target.value })}
                              placeholder="Enter text to search"
                              className="h-9"
                              aria-label={`Search text in ${filter.column}`}
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Add New Filter */}
          {availableColumns.length > 0 && (
            <>
              {filters.length > 0 && <Separator />}
              <div className="space-y-2">
                <Label htmlFor="add-filter" className="text-sm font-medium">
                  Add Filter
                </Label>
                <Select onValueChange={addFilter}>
                  <SelectTrigger id="add-filter" aria-label="Select column to filter">
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map((col) => (
                      <SelectItem key={col.name} value={col.name}>
                        {col.name} ({col.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {filters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
              <p className="text-sm">No filters applied</p>
              <p className="text-xs">Select a column above to add a filter</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
