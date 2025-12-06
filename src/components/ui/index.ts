/**
 * UI Components Library
 * Export all reusable UI components
 */

// Core Components
export { default as Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export {
  default as Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "./Card";
export type { CardProps } from "./Card";

export { default as Badge } from "./Badge";
export type { BadgeProps, BadgeVariant, BadgeSize } from "./Badge";

export { default as Avatar, AvatarGroup } from "./Avatar";
export type { AvatarProps, AvatarGroupProps, AvatarSize } from "./Avatar";

export { default as EmptyState, EmptyIllustrations } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export {
  default as Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  SkeletonForm,
  SkeletonImage,
  SkeletonDashboard,
} from "./SkeletonLoader";
export type { SkeletonProps } from "./SkeletonLoader";

// Form Components
export { default as Input } from "./Input";
export type { InputProps } from "./Input";

export { default as Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";

export { default as Select } from "./Select";
export type { SelectProps, SelectOption } from "./Select";

export { default as DatePicker } from "./DatePicker";
export type { DatePickerProps } from "./DatePicker";

export { default as Checkbox, CheckboxGroup } from "./Checkbox";
export type { CheckboxProps, CheckboxGroupProps } from "./Checkbox";

export { default as Radio, RadioGroup } from "./Radio";
export type { RadioProps, RadioGroupProps } from "./Radio";

export { default as Switch } from "./Switch";
export type { SwitchProps } from "./Switch";

export { default as Upload } from "./Upload";
export type { UploadProps, UploadFile } from "./Upload";

// Overlay Components
export { default as Modal, ModalFooter } from "./Modal";
export type { ModalProps } from "./Modal";

export { default as Drawer } from "./Drawer";
export type { DrawerProps } from "./Drawer";

export { default as Tooltip } from "./Tooltip";
export type { TooltipProps } from "./Tooltip";

export { default as Popover } from "./Popover";
export type { PopoverProps } from "./Popover";

export { default as Dropdown } from "./Dropdown";
export type { DropdownProps, DropdownMenuItem } from "./Dropdown";

// Navigation Components
export { default as Tabs } from "./Tabs";
export type { TabsProps, TabItem } from "./Tabs";

export { default as Accordion } from "./Accordion";
export type { AccordionProps, AccordionItem } from "./Accordion";

// Feedback Components
export { default as Alert } from "./Alert";
export type { AlertProps } from "./Alert";
