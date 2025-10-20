"use client";

import Link from "next/link";
import React from "react";

type Props = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: Props) {
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

      <div className="mb-6">
        <h1 className="text-lg font-semibold">ElecLab</h1>
        <p className="text-sm text-slate-300">Dashboard</p>
      </div>

      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className="block py-2 px-2 rounded hover:bg-slate-800"
            >
              Overview
            </Link>
          </li>
          <li>
            <Link
              href="/materials"
              className="block py-2 px-2 rounded hover:bg-slate-800"
            >
              Materials
            </Link>
          </li>
          <li>
            <Link
              href="/timetable"
              className="block py-2 px-2 rounded hover:bg-slate-800"
            >
              Timetable
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
