"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";

type Props = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: Props) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname?.startsWith(path);
  return (
    <aside className="relative h-full flex flex-col bg-slate-900 text-slate-100 p-4 w-full md:w-64">
      {/* close button (mobile only) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded bg-slate-800/60 md:hidden"
        aria-label="Close menu"
      >
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="mb-6 flex items-center gap-3">
        {/* Logo: put the provided image into public/images/eleclab-logo.png */}
        <Image
          src="/images/logo.png"
          alt="ElecLab logo"
          className="object-contain rounded-md bg-white/5 p-1"
          width={48}
          height={48}
        />
        <div>
          <h1 className="text-lg font-semibold">ElecLab</h1>
        </div>
      </div>

      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/materials"
              className={`flex items-center gap-2 py-2 px-2 rounded ${
                isActive("/materials") ? "bg-slate-800" : "hover:bg-slate-800"
              }`}
              onClick={onClose}
            >
              <svg
                className="w-5 h-5 text-slate-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h18M3 12h18M3 17h18"
                />
              </svg>
              <span>Vật tư</span>
            </Link>
          </li>
          <li>
            <Link
              href="/timetable"
              className={`flex items-center gap-2 py-2 px-2 rounded ${
                isActive("/timetable") ? "bg-slate-800" : "hover:bg-slate-800"
              }`}
              onClick={onClose}
            >
              <svg
                className="w-5 h-5 text-slate-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 2v4M8 2v4"
                />
              </svg>
              <span>Thời khóa biểu</span>
            </Link>
          </li>
          <li>
            <Link
              href="/users"
              className={`flex items-center gap-2 py-2 px-2 rounded ${
                isActive("/users") ? "bg-slate-800" : "hover:bg-slate-800"
              }`}
              onClick={onClose}
            >
              <svg
                className="w-5 h-5 text-slate-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4a4 4 0 100 8 4 4 0 000-8zM16 20H8a2 2 0 01-2-2v-1a5 5 0 0110 0v1a2 2 0 01-2 2z"
                />
              </svg>
              <span>Người dùng</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-auto pt-4">
        <button className="w-full text-sm bg-transparent border border-slate-700 rounded px-3 py-2">
          Sign out
        </button>
      </div>
    </aside>
  );
}
