import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, ChevronDown, X, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default: "border-foreground/10 text-gray-600 bg-card hover:bg-card/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: string[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  value?: string[];
  placeholder?: string;
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
  maxCount?: number; 
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options: parentOptions,
      onValueChange,
      variant,
      defaultValue = [],
      value,
      placeholder = "Select options",
      modalPopover = false,
      asChild = false,
      className,
      maxCount = 3, 
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      value || defaultValue
    );
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery.trim()) return parentOptions;
      return parentOptions.filter((option) =>
        option.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    }, [parentOptions, searchQuery]);    

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(value);
      }
    }, [value]);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter" && searchQuery && filteredOptions.length === 0) {
        handleAddNew();
        event.preventDefault();
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const handleAddNew = () => {
      if (!searchQuery.trim()) return;
      // Check if adding would exceed max count
      if (selectedValues.length >= maxCount) {
        return;
      }
      const newValue = searchQuery.trim();
      const newValues = [...selectedValues, newValue];
      setSelectedValues(newValues);
      onValueChange(newValues);
      setSearchQuery("");
      setIsPopoverOpen(false);
    };

    const toggleOption = (option: string) => {
      // If option is already selected, remove it
      if (selectedValues.includes(option)) {
        const newSelectedValues = selectedValues.filter((value) => value !== option);
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
        return;
      }
      
      // If not selected but at max limit, don't add
      if (selectedValues.length >= maxCount) {
        return;
      }
      
      // Otherwise add the option
      const newSelectedValues = [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleRemove = (valueToRemove: string, event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const newSelectedValues = selectedValues.filter(value => value !== valueToRemove);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === parentOptions.length) {
        handleClear();
      } else {
        // Only select up to maxCount items
        const limitedOptions = parentOptions.slice(0, maxCount);
        setSelectedValues(limitedOptions);
        onValueChange(limitedOptions);
      }
    };

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            variant={variant}
            className={cn(
              "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center gap-1">
                  {selectedValues.map((value) => (
                    <div 
                      key={value} 
                      className="inline-flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge
                        className="bg-transparent text-white border-foreground/10 flex items-center gap-1 pr-1 hover:text-white"
                      >
                        <span className="px-1">{value}</span>
                        <button
                          onClick={(e) => handleRemove(value, e)}
                          className="rounded-full p-0.5"
                        >
                          <X className="h-3 w-3 hover:text-destructive" />
                        </button>
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  {/* {selectedValues.length > 0 && (
                    <span className="text-xs text-muted-foreground mr-1">
                      {selectedValues.length}/{maxCount}
                    </span>
                  )} */}
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground mr-1">
                    0/{maxCount}
                  </span>
                  <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                </div>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full md:w-[380px] p-0"
          align="start"
        >
          <Command className="bg-[#292938] text-white">
            <div className="relative flex items-center">
              <CommandInput
                placeholder="Search..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                onKeyDown={handleInputKeyDown}
                className="pr-8"
              />
              {searchQuery && filteredOptions.length === 0 && selectedValues.length < maxCount && (
                <Plus
                  className="absolute right-2 h-4 w-4 cursor-pointer text-white hover:text-foreground"
                  onClick={handleAddNew}
                />
              )}
            </div>
            <CommandList>
              {filteredOptions.length === 0 && !searchQuery && (
                <CommandEmpty>Start typing to search...</CommandEmpty>
              )}
              {selectedValues.length >= maxCount && (
                <CommandEmpty>Maximum of {maxCount} items selected</CommandEmpty>
              )}
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option);
                  const isDisabled = !isSelected && selectedValues.length >= maxCount;
                  return (
                    <CommandItem
                      key={option}
                      onSelect={() => toggleOption(option)}
                      className={cn(
                        "cursor-pointer text-white",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isDisabled}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center text-white justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-white"
                            : "opacity-50 [&_svg]:invisible text-white"
                        )}
                      >
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                      <span>{option}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 justify-center cursor-pointer"
                      >
                        Clear
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="flex min-h-6 h-full"
                      />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 justify-center cursor-pointer"
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";