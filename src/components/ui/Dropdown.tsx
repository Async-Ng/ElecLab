import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/design-system/utilities";

export interface DropdownMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  /** Dropdown menu items */
  items: DropdownMenuItem[];
  /** Dropdown trigger */
  children: React.ReactElement;
  /** Dropdown placement */
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  /** Trigger mode */
  trigger?: "hover" | "click";
  /** Controlled visibility */
  open?: boolean;
  /** Visibility change handler */
  onOpenChange?: (open: boolean) => void;
  /** Disabled */
  disabled?: boolean;
  /** Custom dropdown class */
  className?: string;
  /** Custom menu class */
  menuClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  children,
  placement = "bottom-start",
  trigger = "click",
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  className,
  menuClassName,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const enabledItems = items.filter((item) => !item.disabled && !item.divider);

  const updatePosition = () => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const gap = 4;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "bottom-start":
        top = triggerRect.bottom + gap;
        left = triggerRect.left;
        break;
      case "bottom-end":
        top = triggerRect.bottom + gap;
        left = triggerRect.right - menuRect.width;
        break;
      case "top-start":
        top = triggerRect.top - menuRect.height - gap;
        left = triggerRect.left;
        break;
      case "top-end":
        top = triggerRect.top - menuRect.height - gap;
        left = triggerRect.right - menuRect.width;
        break;
    }

    // Keep menu within viewport
    const padding = 8;
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - menuRect.height - padding)
    );
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - menuRect.width - padding)
    );

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Reset focused index when menu closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (disabled) return;

    if (controlledOpen === undefined) {
      setInternalOpen(true);
    }
    onOpenChange?.(true);
  };

  const handleClose = () => {
    if (controlledOpen === undefined) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
  };

  const handleToggle = () => {
    if (disabled) return;

    const newOpen = !isOpen;
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled || item.divider) return;

    item.onClick?.();
    handleClose();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex >= enabledItems.length ? 0 : nextIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const nextIndex = prev - 1;
          return nextIndex < 0 ? enabledItems.length - 1 : nextIndex;
        });
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < enabledItems.length) {
          handleItemClick(enabledItems[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        handleClose();
        break;
    }
  };

  return (
    <div
      className={cn("inline-block relative", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        ref={triggerRef}
        onMouseEnter={trigger === "hover" ? handleOpen : undefined}
        onMouseLeave={trigger === "hover" ? handleClose : undefined}
        onClick={trigger === "click" ? handleToggle : undefined}
        className="inline-block"
      >
        {children}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            "fixed z-[10000] min-w-[160px] bg-white border border-neutral-200 rounded-lg shadow-lg",
            "py-1 animate-in fade-in zoom-in-95 duration-200",
            menuClassName
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={trigger === "hover" ? handleOpen : undefined}
          onMouseLeave={trigger === "hover" ? handleClose : undefined}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={item.key}
                  className="my-1 border-t border-neutral-200"
                />
              );
            }

            const enabledIndex = enabledItems.findIndex(
              (i) => i.key === item.key
            );
            const isFocused = enabledIndex === focusedIndex;

            return (
              <button
                key={item.key}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-sm text-left",
                  "transition-colors",
                  !item.disabled && !item.danger && "hover:bg-neutral-100",
                  !item.disabled &&
                    item.danger &&
                    "text-error-600 hover:bg-error-50",
                  item.disabled && "opacity-50 cursor-not-allowed",
                  isFocused && !item.disabled && "bg-neutral-100",
                  !item.disabled && "cursor-pointer"
                )}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
                )}
                <span className="flex-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
