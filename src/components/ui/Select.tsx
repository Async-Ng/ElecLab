import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/design-system/utilities";

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "size" | "onChange"
  > {
  /** Select variant style */
  variant?: "default" | "filled" | "ghost";
  /** Select size */
  selectSize?: "sm" | "md" | "lg";
  /** Validation state */
  state?: "default" | "error" | "success" | "warning";
  /** Options array */
  options: SelectOption[];
  /** Selected value(s) */
  value?: string | string[];
  /** Change handler */
  onChange?: (value: string | string[]) => void;
  /** Enable search */
  searchable?: boolean;
  /** Enable multi-select */
  multiple?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text below select */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Custom wrapper class */
  wrapperClassName?: string;
  /** Loading state for async options */
  loading?: boolean;
  /** Clear button */
  clearable?: boolean;
}

const Select: React.FC<SelectProps> = ({
  variant = "default",
  selectSize = "md",
  state = "default",
  options = [],
  value,
  onChange,
  searchable = false,
  multiple = false,
  placeholder = "Chọn...",
  helperText,
  fullWidth,
  wrapperClassName,
  loading = false,
  clearable = false,
  disabled,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filter options based on search
  const filteredOptions =
    searchable && searchTerm
      ? options.filter((option) =>
          String(option.label).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  // Group options
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || "__default";
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : "");
  };

  const getSelectedLabel = () => {
    if (selectedValues.length === 0) return placeholder;
    if (multiple && selectedValues.length > 1) {
      return `${selectedValues.length} mục đã chọn`;
    }
    const selected = options.find((opt) => opt.value === selectedValues[0]);
    return selected?.label || placeholder;
  };

  // Base styles
  const baseStyles = cn(
    "transition-all duration-200 ease-in-out",
    "font-sans outline-none cursor-pointer",
    "flex items-center justify-between gap-2",
    disabled && "cursor-not-allowed opacity-60"
  );

  // Variant styles
  const variantStyles = {
    default: cn(
      "bg-white border",
      state === "default" &&
        "border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
      state === "error" &&
        "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-100",
      state === "success" &&
        "border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-100",
      state === "warning" &&
        "border-warning-500 focus:border-warning-500 focus:ring-2 focus:ring-warning-100"
    ),
    filled: cn(
      "bg-neutral-100 border border-transparent",
      state === "default" &&
        "hover:bg-neutral-200 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
      state === "error" &&
        "bg-error-50 focus:bg-white focus:border-error-500 focus:ring-2 focus:ring-error-100",
      state === "success" &&
        "bg-success-50 focus:bg-white focus:border-success-500 focus:ring-2 focus:ring-success-100",
      state === "warning" &&
        "bg-warning-50 focus:bg-white focus:border-warning-500 focus:ring-2 focus:ring-warning-100"
    ),
    ghost: cn(
      "bg-transparent border-b-2",
      state === "default" &&
        "border-neutral-300 hover:border-neutral-400 focus:border-primary-500",
      state === "error" && "border-error-500 focus:border-error-500",
      state === "success" && "border-success-500 focus:border-success-500",
      state === "warning" && "border-warning-500 focus:border-warning-500"
    ),
  };

  // Size styles
  const sizeStyles = {
    sm: cn(
      "h-8 text-sm px-3",
      variant === "ghost" ? "rounded-none" : "rounded-md"
    ),
    md: cn(
      "h-10 text-base px-4",
      variant === "ghost" ? "rounded-none" : "rounded-lg"
    ),
    lg: cn(
      "h-12 text-lg px-5",
      variant === "ghost" ? "rounded-none" : "rounded-lg"
    ),
  };

  // State colors for helper text
  const stateColors = {
    default: "text-neutral-500",
    error: "text-error-500",
    success: "text-success-500",
    warning: "text-warning-500",
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col gap-1",
        fullWidth && "w-full",
        wrapperClassName
      )}
    >
      {/* Select trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[selectSize],
          fullWidth && "w-full",
          className
        )}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span
          className={cn(
            "truncate",
            selectedValues.length === 0 && "text-neutral-400"
          )}
        >
          {getSelectedLabel()}
        </span>

        <div className="flex items-center gap-1">
          {clearable && selectedValues.length > 0 && !disabled && (
            <button
              onClick={handleClear}
              className="hover:text-neutral-700 transition-colors"
              type="button"
              aria-label="Clear selection"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {loading ? (
            <svg
              className="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className={cn(
                "w-4 h-4 transition-transform",
                isOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          className={cn(
            "absolute z-50 w-full mt-1 top-full",
            "bg-white border border-neutral-200 rounded-lg shadow-lg",
            "max-h-60 overflow-auto"
          )}
        >
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-neutral-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options */}
          <div className="py-1">
            {Object.entries(groupedOptions).map(([group, groupOptions]) => (
              <div key={group}>
                {group !== "__default" && (
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase">
                    {group}
                  </div>
                )}
                {groupOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() =>
                        !option.disabled && handleSelect(option.value)
                      }
                      className={cn(
                        "px-3 py-2 cursor-pointer transition-colors flex items-center justify-between",
                        option.disabled && "opacity-50 cursor-not-allowed",
                        !option.disabled && "hover:bg-neutral-100",
                        isSelected && "bg-primary-50 text-primary-700"
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-8 text-center text-neutral-500">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper text */}
      {helperText && (
        <span className={cn("text-sm px-1", stateColors[state])}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Select;
