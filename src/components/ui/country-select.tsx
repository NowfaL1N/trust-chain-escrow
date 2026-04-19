"use client";

import * as React from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CountrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CountrySelect({
  value,
  onValueChange,
  options,
  placeholder = "Select country",
  className,
  disabled,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Sort options alphabetically with popular countries prioritized when no search
  const sortedOptions = React.useMemo(() => {
    const popularCountries = [
      'United States', 'United Kingdom', 'India', 'Germany', 'China', 
      'Japan', 'France', 'Canada', 'Australia', 'Singapore', 'UAE',
      'Brazil', 'Italy', 'Spain', 'Netherlands', 'South Korea', 'Switzerland'
    ];
    
    const allCountries = [...options].sort((a, b) => a.localeCompare(b));
    
    // If no search query, show popular countries first, then alphabetical
    if (!searchQuery.trim()) {
      const popular = popularCountries.filter(country => allCountries.includes(country));
      const others = allCountries.filter(country => !popularCountries.includes(country));
      return [...popular, ...others];
    }
    
    return allCountries;
  }, [options, searchQuery]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return sortedOptions;
    }
    const query = searchQuery.toLowerCase();
    return sortedOptions.filter(option =>
      option.toLowerCase().includes(query)
    );
  }, [sortedOptions, searchQuery]);

  // Highlight search terms in country names
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => {
      const isMatch = part.toLowerCase() === query.toLowerCase();
      return (
        <span
          key={index}
          className={isMatch ? 'bg-yellow-200 dark:bg-yellow-800 font-medium' : ''}
        >
          {part}
        </span>
      );
    });
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue);
    setOpen(false);
    setSearchQuery("");
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange?.("");
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 text-sm",
            className
          )}
        >
          <span className="truncate text-left">
            {value || placeholder}
          </span>
          <div className="flex items-center gap-1">
            {value && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={clearSelection}
              />
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg"
        align="start"
      >
        <div className="p-2 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchQuery("");
                  setOpen(false);
                }
                if (e.key === "Enter" && filteredOptions.length === 1) {
                  handleSelect(filteredOptions[0]);
                }
              }}
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No countries found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = value === option;
              const popularCountries = [
                'United States', 'United Kingdom', 'India', 'Germany', 'China', 
                'Japan', 'France', 'Canada', 'Australia', 'Singapore', 'UAE',
                'Brazil', 'Italy', 'Spain', 'Netherlands', 'South Korea', 'Switzerland'
              ];
              const isPopular = popularCountries.includes(option);
              const showSeparator = !searchQuery.trim() && index === popularCountries.filter(c => filteredOptions.includes(c)).length;
              
              return (
                <React.Fragment key={option}>
                  {showSeparator && (
                    <div className="px-2 py-1 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 mt-1 pt-2">
                      All Countries (A-Z)
                    </div>
                  )}
                  <div
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800",
                      isSelected && "bg-slate-100 dark:bg-slate-800",
                      isPopular && !searchQuery.trim() && "bg-blue-50 dark:bg-blue-950/30"
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{highlightMatch(option, searchQuery)}</span>
                    {isSelected && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                    )}
                    {isPopular && !searchQuery.trim() && (
                      <div className="ml-auto text-xs text-blue-600 dark:text-blue-400">★</div>
                    )}
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
        {filteredOptions.length > 0 && (
          <div className="px-2 py-1 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            {filteredOptions.length} of {sortedOptions.length} countries
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}