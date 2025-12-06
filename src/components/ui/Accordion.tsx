import React, { useState } from "react";
import { cn } from "@/design-system/utilities";

export interface AccordionItem {
  key: string;
  header: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  /** Accordion items */
  items: AccordionItem[];
  /** Active keys (for controlled) */
  activeKey?: string | string[];
  /** Default active keys */
  defaultActiveKey?: string | string[];
  /** Change handler */
  onChange?: (key: string | string[]) => void;
  /** Allow multiple panels open */
  accordion?: boolean;
  /** Show expand icon */
  showExpandIcon?: boolean;
  /** Expand icon position */
  expandIconPosition?: "left" | "right";
  /** Custom class */
  className?: string;
  /** Bordered style */
  bordered?: boolean;
  /** Ghost style */
  ghost?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  activeKey: controlledActiveKey,
  defaultActiveKey = [],
  onChange,
  accordion = false,
  showExpandIcon = true,
  expandIconPosition = "right",
  className,
  bordered = true,
  ghost = false,
}) => {
  const normalizeKeys = (keys: string | string[] | undefined): string[] => {
    if (keys === undefined) return [];
    return Array.isArray(keys) ? keys : [keys];
  };

  const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>(
    normalizeKeys(defaultActiveKey)
  );

  const activeKeys =
    controlledActiveKey !== undefined
      ? normalizeKeys(controlledActiveKey)
      : internalActiveKeys;

  const handleClick = (key: string, disabled?: boolean) => {
    if (disabled) return;

    let newActiveKeys: string[];

    if (accordion) {
      // Only one panel can be open
      newActiveKeys = activeKeys.includes(key) ? [] : [key];
    } else {
      // Multiple panels can be open
      newActiveKeys = activeKeys.includes(key)
        ? activeKeys.filter((k) => k !== key)
        : [...activeKeys, key];
    }

    if (controlledActiveKey === undefined) {
      setInternalActiveKeys(newActiveKeys);
    }

    onChange?.(accordion ? newActiveKeys[0] || "" : newActiveKeys);
  };

  const isActive = (key: string) => activeKeys.includes(key);

  const containerStyles = cn(
    "divide-y divide-neutral-200",
    bordered &&
      !ghost &&
      "border border-neutral-200 rounded-lg overflow-hidden",
    ghost && "border-0",
    className
  );

  const ExpandIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg
      className={cn(
        "w-5 h-5 transition-transform duration-200",
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
  );

  return (
    <div className={containerStyles}>
      {items.map((item) => {
        const active = isActive(item.key);

        return (
          <div key={item.key} className={cn(ghost && "mb-2")}>
            {/* Header */}
            <button
              onClick={() => handleClick(item.key, item.disabled)}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-inset",
                !item.disabled && "cursor-pointer hover:bg-neutral-50",
                item.disabled && "cursor-not-allowed opacity-50",
                ghost && !active && "border border-neutral-200 rounded-lg",
                ghost &&
                  active &&
                  "border border-primary-500 rounded-t-lg bg-primary-50"
              )}
            >
              {/* Left expand icon */}
              {showExpandIcon && expandIconPosition === "left" && (
                <span className="flex-shrink-0 text-neutral-500">
                  <ExpandIcon isOpen={active} />
                </span>
              )}

              {/* Custom icon */}
              {item.icon && (
                <span className="flex-shrink-0 text-neutral-600">
                  {item.icon}
                </span>
              )}

              {/* Header content */}
              <span className="flex-1 font-medium text-neutral-900">
                {item.header}
              </span>

              {/* Right expand icon */}
              {showExpandIcon && expandIconPosition === "right" && (
                <span className="flex-shrink-0 text-neutral-500">
                  <ExpandIcon isOpen={active} />
                </span>
              )}
            </button>

            {/* Content */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                active ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
                ghost &&
                  active &&
                  "border border-t-0 border-primary-500 rounded-b-lg"
              )}
            >
              <div className={cn("px-4 py-3", ghost && "bg-white")}>
                {item.children}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
