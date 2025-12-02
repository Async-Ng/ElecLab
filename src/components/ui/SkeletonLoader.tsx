import React from "react";
import { cn } from "@/design-system/utilities";

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
  animation?: "pulse" | "wave" | "none";
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height = 20,
  circle = false,
  count = 1,
  animation = "pulse",
}) => {
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const skeletonStyle: React.CSSProperties = {
    width: width || "100%",
    height: typeof height === "number" ? `${height}px` : height,
  };

  const elements = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        "bg-gray-200",
        circle ? "rounded-full" : "rounded",
        animationClasses[animation],
        className
      )}
      style={skeletonStyle}
    />
  ));

  return count > 1 ? (
    <div className="space-y-2">{elements}</div>
  ) : (
    <>{elements}</>
  );
};

// Preset skeleton layouts
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton key={i} height={16} width={i === lines - 1 ? "70%" : "100%"} />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className }) => (
  <Skeleton circle width={size} height={size} className={className} />
);

export const SkeletonButton: React.FC<{
  width?: number;
  height?: number;
  className?: string;
}> = ({ width = 100, height = 40, className }) => (
  <Skeleton
    width={width}
    height={height}
    className={cn("rounded-lg", className)}
  />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn("p-4 border border-gray-200 rounded-lg", className)}>
    <div className="flex items-start gap-4 mb-4">
      <SkeletonAvatar size={48} />
      <div className="flex-1 space-y-2">
        <Skeleton height={20} width="60%" />
        <Skeleton height={16} width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn("space-y-3", className)}>
    {/* Table Header */}
    <div className="flex gap-4 pb-3 border-b border-gray-200">
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className="flex-1">
          <Skeleton height={20} />
        </div>
      ))}
    </div>

    {/* Table Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: columns }, (_, colIndex) => (
          <div key={colIndex} className="flex-1">
            <Skeleton height={16} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{
  items?: number;
  avatar?: boolean;
  className?: string;
}> = ({ items = 3, avatar = false, className }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center gap-3">
        {avatar && <SkeletonAvatar />}
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="80%" />
          <Skeleton height={14} width="60%" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonForm: React.FC<{
  fields?: number;
  className?: string;
}> = ({ fields = 4, className }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: fields }, (_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton height={14} width={100} />
        <Skeleton height={40} />
      </div>
    ))}
  </div>
);

export const SkeletonImage: React.FC<{
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  className?: string;
}> = ({ width = "100%", height, aspectRatio = "16/9", className }) => {
  const style: React.CSSProperties = {
    width,
    height: height || "auto",
    aspectRatio: !height ? aspectRatio : undefined,
  };

  return (
    <Skeleton
      className={cn("rounded-lg", className)}
      width={width}
      height={height}
      animation="wave"
    />
  );
};

export const SkeletonDashboard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn("space-y-6", className)}>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="p-4 border border-gray-200 rounded-lg">
          <Skeleton height={16} width="40%" className="mb-3" />
          <Skeleton height={32} width="60%" />
        </div>
      ))}
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonCard />
      <SkeletonCard />
    </div>

    {/* Table */}
    <div className="border border-gray-200 rounded-lg p-4">
      <Skeleton height={24} width="30%" className="mb-4" />
      <SkeletonTable rows={5} columns={5} />
    </div>
  </div>
);

// Add shimmer animation to globals.css
export const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }
  
  .animate-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
    background: linear-gradient(
      to right,
      #e2e8f0 0%,
      #f1f5f9 20%,
      #e2e8f0 40%,
      #e2e8f0 100%
    );
    background-size: 800px 100%;
  }
`;

export default Skeleton;
