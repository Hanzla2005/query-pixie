import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Filter, X, RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterConfig {
  numericFilters: { [key: string]: { min: number; max: number } };
  categoricalFilters: { [key: string]: string[] };
}

interface OverviewFiltersProps {
  columns: any[];
  onApplyFilters: (filters: FilterConfig) => void;
  isLoading: boolean;
}

const OverviewFilters = ({ columns, onApplyFilters, isLoading }: OverviewFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numericFilters, setNumericFilters] = useState<{ [key: string]: { min: number; max: number } }>({});
  const [categoricalFilters, setCategoricalFilters] = useState<{ [key: string]: string[] }>({});
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");

  const numericColumns = columns?.filter((col: any) => col.type === 'number') || [];
  const categoricalColumns = columns?.filter((col: any) => col.type !== 'number') || [];

  const handleAddNumericFilter = (columnName: string, min: number, max: number) => {
    setNumericFilters(prev => ({
      ...prev,
      [columnName]: { min, max }
    }));
  };

  const handleAddCategoricalFilter = () => {
    if (!selectedColumn || !filterValue.trim()) return;
    
    setCategoricalFilters(prev => ({
      ...prev,
      [selectedColumn]: [...(prev[selectedColumn] || []), filterValue.trim()]
    }));
    setFilterValue("");
  };

  const handleRemoveNumericFilter = (columnName: string) => {
    setNumericFilters(prev => {
      const updated = { ...prev };
      delete updated[columnName];
      return updated;
    });
  };

  const handleRemoveCategoricalFilter = (columnName: string, value: string) => {
    setCategoricalFilters(prev => ({
      ...prev,
      [columnName]: prev[columnName].filter(v => v !== value)
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters({ numericFilters, categoricalFilters });
  };

  const handleResetFilters = () => {
    setNumericFilters({});
    setCategoricalFilters({});
    onApplyFilters({ numericFilters: {}, categoricalFilters: {} });
  };

  const activeFilterCount = Object.keys(numericFilters).length + 
    Object.values(categoricalFilters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <CardTitle>Filters</CardTitle>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? "Hide" : "Show"} Filters
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription>
            Filter data by specific ranges or categories to drill down into your analysis
          </CardDescription>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Active Filters:</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(numericFilters).map(([col, range]) => (
                    <Badge key={col} variant="outline" className="gap-1">
                      {col}: {range.min} - {range.max}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveNumericFilter(col)}
                      />
                    </Badge>
                  ))}
                  {Object.entries(categoricalFilters).map(([col, values]) =>
                    values.map(val => (
                      <Badge key={`${col}-${val}`} variant="outline" className="gap-1">
                        {col}: {val}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveCategoricalFilter(col, val)}
                        />
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Numeric Filters */}
            {numericColumns.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Numeric Range Filters</Label>
                <div className="grid gap-4">
                  {numericColumns.slice(0, 3).map((col: any) => (
                    <div key={col.name} className="space-y-2 p-4 border rounded-lg bg-muted/30">
                      <Label className="text-sm">{col.name}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Min</Label>
                          <Input
                            type="number"
                            placeholder="Min"
                            value={numericFilters[col.name]?.min || ""}
                            onChange={(e) => {
                              const min = parseFloat(e.target.value) || 0;
                              const max = numericFilters[col.name]?.max || 1000;
                              handleAddNumericFilter(col.name, min, max);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Max</Label>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={numericFilters[col.name]?.max || ""}
                            onChange={(e) => {
                              const max = parseFloat(e.target.value) || 1000;
                              const min = numericFilters[col.name]?.min || 0;
                              handleAddNumericFilter(col.name, min, max);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categorical Filters */}
            {categoricalColumns.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Category Filters</Label>
                <div className="space-y-2">
                  <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoricalColumns.map((col: any) => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter value to filter"
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCategoricalFilter();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleAddCategoricalFilter}
                      variant="secondary"
                      disabled={!selectedColumn || !filterValue.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={handleApplyFilters} 
                disabled={isLoading || activeFilterCount === 0}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button 
                onClick={handleResetFilters} 
                variant="outline"
                disabled={isLoading || activeFilterCount === 0}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default OverviewFilters;
