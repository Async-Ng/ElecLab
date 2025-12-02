import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/design-system/utilities";

export interface PopoverProps {
  /** Popover content */
  content: React.ReactNode;
  /** Popover title */
  title?: React.ReactNode;
  /** Popover trigger */
  children: React.ReactElement;
  /** Popover placement */
  placement?: "top" | "bottom" | "left" | "right";
  /** Show arrow */
  arrow?: boolean;
  /** Trigger mode */
  trigger?: "hover" | "click" | "focus";
  /** Controlled visibility */
  open?: boolean;
  /** Visibility change handler */
  onOpenChange?: (open: boolean) => void;
  /** Disabled */
  disabled?: boolean;
  /** Custom class */
  className?: string;
  /** Custom content class */
  contentClassName?: string;
}

const Popover: React.FC<PopoverProps> = ({
  content,
  title,
  children,
  placement = "top",
  arrow = true,
  trigger = "click",
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  className,
  contentClassName,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const updatePosition = () => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = triggerRect.top - popoverRect.height - gap;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.left - popoverRect.width - gap;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Keep popover within viewport
    const padding = 8;
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - popoverRect.height - padding)
    );
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - popoverRect.width - padding)
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
    if (!isOpen || trigger !== "click") return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, trigger]);

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

  // Clone children and attach event handlers
  const triggerElement = (
    <span
      ref={triggerRef as any}
      onMouseEnter={trigger === "hover" ? handleOpen : undefined}
      onMouseLeave={trigger === "hover" ? handleClose : undefined}
      onClick={trigger === "click" ? handleToggle : undefined}
      onFocus={trigger === "focus" ? handleOpen : undefined}
      onBlur={trigger === "focus" ? handleClose : undefined}
      className="inline-block"
    >
      {children}
    </span>
  );

  // Arrow styles
  const arrowStyles = cn(
    "absolute w-3 h-3 bg-white border rotate-45",
    placement === "top" &&
      "border-b border-r border-neutral-200 bottom-[-6px] left-1/2 -translate-x-1/2",
    placement === "bottom" &&
      "border-t border-l border-neutral-200 top-[-6px] left-1/2 -translate-x-1/2",
    placement === "left" &&
      "border-t border-r border-neutral-200 right-[-6px] top-1/2 -translate-y-1/2",
    placement === "right" &&
      "border-b border-l border-neutral-200 left-[-6px] top-1/2 -translate-y-1/2"
  );

  const popoverContent = isOpen && (
    <div
      ref={popoverRef}
      role="dialog"
      className={cn(
        "fixed z-[10000] bg-white border border-neutral-200 rounded-lg shadow-lg",
        "animate-in fade-in zoom-in-95 duration-200",
        "min-w-[200px] max-w-sm",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseEnter={trigger === "hover" ? handleOpen : undefined}
      onMouseLeave={trigger === "hover" ? handleClose : undefined}
    >
      {title && (
        <div className="px-4 py-3 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
        </div>
      )}

      <div className={cn("px-4 py-3", contentClassName)}>{content}</div>

      {arrow && <div className={arrowStyles} />}
    </div>
  );

  return (
    <>
      {triggerElement}
      {popoverContent && createPortal(popoverContent, document.body)}
    </>
  );
};

export default Popover;
