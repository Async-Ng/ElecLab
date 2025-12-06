import React, { useState } from "react";
import { cn } from "@/design-system/utilities";

export interface TabItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabsProps {
  /** Tab items */
  items: TabItem[];
  /** Active tab key */
  activeKey?: string;
  /** Default active key */
  defaultActiveKey?: string;
  /** Change handler */
  onChange?: (key: string) => void;
  /** Tab variant */
  variant?: "line" | "card" | "pill";
  /** Tab orientation */
  orientation?: "horizontal" | "vertical";
  /** Tab size */
  size?: "sm" | "md" | "lg";
  /** Custom tabs class */
  className?: string;
  /** Custom tab panel class */
  tabPanelClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey: controlledActiveKey,
  defaultActiveKey,
  onChange,
  variant = "line",
  orientation = "horizontal",
  size = "md",
  className,
  tabPanelClassName,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || (items && items[0]?.key) || ""
  );

  const activeKey =
    controlledActiveKey !== undefined ? controlledActiveKey : internalActiveKey;

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;

    if (controlledActiveKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledItems = items.filter((item) => !item.disabled);
    const currentIndex = enabledItems.findIndex(
      (item) => item.key === items[index].key
    );

    let nextIndex = currentIndex;

    if (orientation === "horizontal") {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : enabledItems.length - 1;
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextIndex =
          currentIndex < enabledItems.length - 1 ? currentIndex + 1 : 0;
      }
    } else {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : enabledItems.length - 1;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex =
          currentIndex < enabledItems.length - 1 ? currentIndex + 1 : 0;
      }
    }

    if (nextIndex !== currentIndex) {
      handleTabClick(enabledItems[nextIndex].key);
    }
  };

  // Size styles
  const sizeStyles = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-2.5",
  };

  // Variant styles
  const getTabStyles = (item: TabItem, isActive: boolean) => {
    const baseStyles = cn(
      "flex items-center gap-2 font-medium transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-2",
      item.disabled && "cursor-not-allowed opacity-50",
      !item.disabled && "cursor-pointer",
      sizeStyles[size]
    );

    if (variant === "line") {
      return cn(
        baseStyles,
        orientation === "horizontal" && "border-b-2",
        orientation === "vertical" && "border-l-2",
        isActive && !item.disabled && "border-primary-500 text-primary-600",
        !isActive &&
          !item.disabled &&
          "border-transparent text-neutral-600 hover:text-neutral-900",
        !isActive && !item.disabled && "hover:border-neutral-300"
      );
    }

    if (variant === "card") {
      return cn(
        baseStyles,
        "border rounded-t-lg",
        orientation === "vertical" && "rounded-l-lg rounded-t-none",
        isActive &&
          !item.disabled &&
          "bg-white border-neutral-300 border-b-white text-primary-600",
        !isActive &&
          !item.disabled &&
          "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
      );
    }

    if (variant === "pill") {
      return cn(
        baseStyles,
        "rounded-full",
        isActive && !item.disabled && "bg-primary-500 text-white",
        !isActive &&
          !item.disabled &&
          "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      );
    }

    return baseStyles;
  };

  const containerStyles = cn(
    "flex",
    orientation === "horizontal" ? "flex-col" : "flex-row",
    className
  );

  const tabListStyles = cn(
    "flex",
    orientation === "horizontal" ? "flex-row" : "flex-col",
    variant === "line" &&
      orientation === "horizontal" &&
      "border-b border-neutral-200",
    variant === "line" &&
      orientation === "vertical" &&
      "border-l border-neutral-200",
    variant === "card" && orientation === "horizontal" && "-mb-px",
    variant === "card" && orientation === "vertical" && "-ml-px",
    variant === "pill" && "gap-2 p-1 bg-neutral-100 rounded-full"
  );

  const activeItem = items?.find((item) => item.key === activeKey);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={containerStyles}>
      {/* Tab list */}
      <div
        role="tablist"
        className={tabListStyles}
        aria-orientation={
          orientation === "vertical" ? "vertical" : "horizontal"
        }
      >
        {items.map((item, index) => {
          const isActive = item.key === activeKey;

          return (
            <button
              key={item.key}
              role="tab"
              aria-selected={isActive ? true : false}
              aria-controls={`tabpanel-${item.key}`}
              id={`tab-${item.key}`}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => handleTabClick(item.key, item.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={getTabStyles(item, isActive)}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      {activeItem && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeItem.key}`}
          aria-labelledby={`tab-${activeItem.key}`}
          className={cn(
            "focus:outline-none",
            variant === "card" &&
              orientation === "horizontal" &&
              "border border-neutral-300 rounded-b-lg rounded-tr-lg p-4",
            variant === "card" &&
              orientation === "vertical" &&
              "border border-neutral-300 rounded-r-lg rounded-bl-lg p-4",
            (variant === "line" || variant === "pill") && "pt-4",
            orientation === "vertical" && "pl-4",
            tabPanelClassName
          )}
        >
          {activeItem.children}
        </div>
      )}
    </div>
  );
};

export default Tabs;
