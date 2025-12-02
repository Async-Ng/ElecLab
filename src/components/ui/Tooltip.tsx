import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/design-system/utilities";

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip trigger */
  children: React.ReactElement;
  /** Tooltip placement */
  placement?: "top" | "bottom" | "left" | "right";
  /** Show arrow */
  arrow?: boolean;
  /** Trigger mode */
  trigger?: "hover" | "click" | "focus";
  /** Show delay (ms) */
  mouseEnterDelay?: number;
  /** Hide delay (ms) */
  mouseLeaveDelay?: number;
  /** Controlled visibility */
  open?: boolean;
  /** Visibility change handler */
  onOpenChange?: (open: boolean) => void;
  /** Disabled */
  disabled?: boolean;
  /** Custom class */
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = "top",
  arrow = true,
  trigger = "hover",
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  className,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8; // Gap between trigger and tooltip

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - tooltipRect.height - padding)
    );
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - tooltipRect.width - padding)
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

  const handleOpen = () => {
    if (disabled) return;

    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);

    enterTimeoutRef.current = setTimeout(() => {
      if (controlledOpen === undefined) {
        setInternalOpen(true);
      }
      onOpenChange?.(true);
    }, mouseEnterDelay);
  };

  const handleClose = () => {
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);

    leaveTimeoutRef.current = setTimeout(() => {
      if (controlledOpen === undefined) {
        setInternalOpen(false);
      }
      onOpenChange?.(false);
    }, mouseLeaveDelay);
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
    "absolute w-2 h-2 bg-neutral-900 rotate-45",
    placement === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
    placement === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
    placement === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
    placement === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
  );

  const tooltipContent = isOpen && (
    <div
      ref={tooltipRef}
      role="tooltip"
      className={cn(
        "fixed z-[10000] px-3 py-2 text-sm text-white bg-neutral-900 rounded-md shadow-lg",
        "animate-in fade-in zoom-in-95 duration-200",
        "max-w-xs break-words",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {content}
      {arrow && <div className={arrowStyles} />}
    </div>
  );

  return (
    <>
      {triggerElement}
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
};

export default Tooltip;
