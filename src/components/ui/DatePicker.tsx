import React, { useState } from "react";
import { cn } from "@/design-system/utilities";
import Input from "./Input";

export interface DatePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange"
  > {
  /** DatePicker variant style */
  variant?: "default" | "filled" | "ghost";
  /** DatePicker size */
  datePickerSize?: "sm" | "md" | "lg";
  /** Validation state */
  state?: "default" | "error" | "success" | "warning";
  /** Selected date value */
  value?: Date | null;
  /** Change handler */
  onChange?: (date: Date | null) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Date format for display */
  format?: string;
  /** Helper text below datepicker */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Custom wrapper class */
  wrapperClassName?: string;
  /** Quick select presets */
  presets?: Array<{
    label: string;
    value: Date;
  }>;
}

const DatePicker: React.FC<DatePickerProps> = ({
  variant = "default",
  datePickerSize = "md",
  state = "default",
  value,
  onChange,
  minDate,
  maxDate,
  format = "dd/MM/yyyy",
  helperText,
  fullWidth,
  wrapperClassName,
  presets,
  disabled,
  placeholder = "Chọn ngày",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  // Format date to display string
  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get days in month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Check if date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Check if date is selected
  const isDateSelected = (date: Date): boolean => {
    if (!value) return false;
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange?.(date);
      setIsOpen(false);
    }
  };

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Generate calendar grid
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
    }

    return days;
  };

  const calendar = generateCalendar();
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className={cn("relative", fullWidth && "w-full", wrapperClassName)}>
      {/* Input trigger */}
      <Input
        variant={variant}
        inputSize={datePickerSize}
        state={state}
        value={formatDate(value)}
        placeholder={placeholder}
        helperText={helperText}
        fullWidth={fullWidth}
        disabled={disabled}
        readOnly
        onClick={() => !disabled && setIsOpen(!isOpen)}
        rightIcon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
        {...props}
      />

      {/* Calendar dropdown */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar */}
          <div className="absolute z-50 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 min-w-[280px]">
            {/* Presets */}
            {presets && presets.length > 0 && (
              <div className="mb-3 pb-3 border-b border-neutral-200 flex flex-wrap gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(preset.value)}
                    className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {/* Month/Year header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <span className="font-semibold">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>

              <button
                onClick={() => navigateMonth("next")}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-neutral-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendar.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} />;
                }

                const disabled = isDateDisabled(date);
                const selected = isDateSelected(date);
                const today = isToday(date);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={disabled}
                    className={cn(
                      "aspect-square flex items-center justify-center rounded-md text-sm transition-colors",
                      "hover:bg-neutral-100",
                      disabled &&
                        "text-neutral-300 cursor-not-allowed hover:bg-transparent",
                      selected &&
                        "bg-primary-500 text-white hover:bg-primary-600",
                      today && !selected && "border-2 border-primary-500",
                      !disabled && !selected && "text-neutral-900"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DatePicker;
