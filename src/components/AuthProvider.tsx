"use client";

import { ReactNode } from "react";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { AuthProvider as AuthProviderHook } from "@/hooks/useAuth";
import { themeConfig } from "@/styles/theme";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={themeConfig} locale={viVN}>
      <AuthProviderHook>{children}</AuthProviderHook>
    </ConfigProvider>
  );
}
