"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Form, Input, message } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { brandColors } from "@/styles/theme";
import "./login.css";

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: loginContext } = useAuth();

  const onFinish = async (values: LoginForm) => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.username,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.message || "Đăng nhập thất bại");
        return;
      }

      loginContext(data.token, data.user);
      message.success("Đăng nhập thành công!");

      // Redirect dựa trên role
      const userRoles = data.user.roles || [];
      const hasAdmin = userRoles.includes("Admin");
      const hasUser = userRoles.includes("User");

      // Luôn ưu tiên Admin role khi đăng nhập
      if (hasAdmin) {
        localStorage.setItem("activeRole", "Admin");
        router.push("/admin/timetables");
      } else if (hasUser) {
        localStorage.setItem("activeRole", "User");
        router.push("/timetables");
      } else {
        // Fallback về timetables nếu không có role nào
        router.push("/timetables");
      }
    } catch (error) {
      message.error("Đăng nhập thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/background.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
        quality={100}
      />

      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 login-pattern" />
      </div>

      <div className="relative w-full max-w-6xl z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center p-6 lg:p-12 text-center">
            <div className="relative w-48 h-48 lg:w-64 lg:h-64 mb-6 lg:mb-8">
              {/* White circular background */}
              <div className="absolute inset-0 bg-white rounded-full shadow-2xl" />
              {/* Logo */}
              <div className="relative w-full h-full">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6 text-white drop-shadow-2xl">
              ElecLab
            </h1>
            <p className="text-xl lg:text-2xl xl:text-3xl text-white font-semibold mb-2 lg:mb-3 drop-shadow-lg">
              Hệ thống quản lý phòng thực hành
            </p>
            <p className="text-base lg:text-lg xl:text-xl text-white/95 drop-shadow-lg">
              Khoa kỹ thuật Điện - Điện tử
            </p>
          </div>

          {/* Right Side - Login Form */}
          <Card className="p-6 sm:p-8 md:p-10 lg:p-14 shadow-2xl border-0 bg-white">
            <div className="mb-6 lg:mb-8 text-center">
              <div className="lg:hidden relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Đăng nhập
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Chào mừng bạn trở lại với hệ thống ElecLab
              </p>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="space-y-4 sm:space-y-6"
            >
              <Form.Item
                label={
                  <span className="text-sm sm:text-base text-gray-700 font-medium">
                    Email
                  </span>
                }
                name="username"
                rules={[{ required: true, message: "Vui lòng nhập email!" }]}
              >
                <Input
                  placeholder="Email của bạn"
                  className="h-10 sm:h-12 rounded-lg text-sm sm:text-base"
                  prefix={
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-sm sm:text-base text-gray-700 font-medium">
                    Mật khẩu
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
              >
                <Input.Password
                  placeholder="Mật khẩu của bạn"
                  className="h-10 sm:h-12 rounded-lg text-sm sm:text-base"
                  prefix={
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  }
                />
              </Form.Item>

              <Form.Item className="!mb-4 sm:!mb-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold"
                  loading={loading}
                  rightIcon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  }
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </Form.Item>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="text-center space-y-1.5 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Thông tin hệ thống
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Hệ thống ElecLab dành cho giảng viên và quản lý phòng thực
                    hành
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Liên hệ hỗ trợ:{" "}
                    <a
                      href="mailto:ndloi@hcmct.edu.vn"
                      className="font-medium hover:underline text-brand-primary break-all"
                    >
                      ndloi@hcmct.edu.vn
                    </a>
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Đảm bảo bảo mật thông tin cá nhân và dữ liệu phòng thực hành
                  </p>
                </div>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
