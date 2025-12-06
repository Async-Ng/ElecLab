import React from "react";
import { cn } from "@/design-system/utilities";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  illustration?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  illustration,
  className,
}) => {
  const defaultIllustration = (
    <svg
      className="w-48 h-48 text-gray-300"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "py-12 px-4 text-center",
        className
      )}
    >
      {/* Illustration or Icon */}
      <div className="mb-6">{illustration || icon || defaultIllustration}</div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-base text-gray-600 mb-6 max-w-md">{description}</p>
      )}

      {/* Action Button */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

// Preset illustrations
export const EmptyIllustrations = {
  NoData: () => (
    <svg
      className="w-48 h-48"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="80" fill="#F1F5F9" />
      <path
        d="M70 90 L90 110 L130 70"
        stroke="#94A3B8"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <circle cx="100" cy="100" r="60" stroke="#CBD5E1" strokeWidth="2" />
    </svg>
  ),

  NoResults: () => (
    <svg
      className="w-48 h-48"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="80"
        cy="80"
        r="40"
        stroke="#CBD5E1"
        strokeWidth="3"
        fill="#F8FAFC"
      />
      <line
        x1="110"
        y1="110"
        x2="140"
        y2="140"
        stroke="#CBD5E1"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="70"
        y1="70"
        x2="90"
        y2="90"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="90"
        y1="70"
        x2="70"
        y2="90"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  NoFiles: () => (
    <svg
      className="w-48 h-48"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="60"
        y="40"
        width="80"
        height="120"
        rx="4"
        fill="#F1F5F9"
        stroke="#CBD5E1"
        strokeWidth="2"
      />
      <path d="M60 60 L100 40 L140 60" fill="#E2E8F0" />
      <line
        x1="75"
        y1="80"
        x2="125"
        y2="80"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="75"
        y1="100"
        x2="125"
        y2="100"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="75"
        y1="120"
        x2="110"
        y2="120"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  Error: () => (
    <svg
      className="w-48 h-48"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="80" fill="#FEE2E2" />
      <circle cx="100" cy="100" r="60" stroke="#DC2626" strokeWidth="3" />
      <line
        x1="80"
        y1="80"
        x2="120"
        y2="120"
        stroke="#DC2626"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="120"
        y1="80"
        x2="80"
        y2="120"
        stroke="#DC2626"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),

  Success: () => (
    <svg
      className="w-48 h-48"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="80" fill="#D1FAE5" />
      <circle cx="100" cy="100" r="60" stroke="#10B981" strokeWidth="3" />
      <path
        d="M70 100 L90 120 L130 80"
        stroke="#10B981"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export default EmptyState;
