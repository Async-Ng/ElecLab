"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Form, Input, Button, Card, message, Typography, Row, Col } from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const PRIMARY_COLOR = "#1890ff";

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/timetable");
    }
  }, [isAuthenticated, router]);

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
      // Use context login to update state and localStorage
      login(data.token, data.user);
      message.success("Đăng nhập thành công!");
      // Redirect handled by useEffect above
    } catch (error) {
      console.error("Login error:", error);
      message.error("Đăng nhập thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Nền: Tăng cường độ phủ sóng
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 p-0">
      <div className="w-full h-full bg-white shadow-none overflow-hidden flex transition duration-500">
        <Row gutter={[0, 0]} className="w-full h-full">
          {/* Cột 1: Hình ảnh/Minh họa (Bây giờ chiếm 50% màn hình) */}
          <Col xs={0} md={12} className="relative flex flex-col justify-center items-center text-white">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src="/images/background.jpg"
                alt="Background"
                fill
                className="object-cover"
                priority
              />
              {/* Overlay to make text more readable */}
              <div className="absolute inset-0 bg-black/30" />
            </div>
            
            {/* Content on top of background */}
            <div className="relative z-10 text-center p-10">
              <Title level={2} className="text-white !mt-0 !mb-2">
                Quản Lý Thiết Bị
              </Title>
              <Text className="text-white/80 text-lg block">
                Hệ thống quản lý vật tư và thiết bị phòng thí nghiệm điện tử của bạn.
              </Text>
              <Text className="text-white/90 mt-4 block">
                TK: ndloi@hcmct.edu.vn
                <br />
                MK: 123456
              </Text>
            </div>
          </Col>

          {/* Cột 2: Form Đăng nhập (Bây giờ chiếm 50% màn hình) */}
          <Col
            xs={24}
            md={12}
            className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-center"
          >
            {/* 🌟 Thêm một div để giới hạn form lại ở trung tâm cột, tránh bị quá rộng */}
            <div className="w-full max-sm:-sm">
              <div className="flex flex-col items-center mb-10">
                <div className="relative w-35 h-16 mb-4">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <Title level={3} className="text-center !mb-1 text-gray-800">
                  Chào mừng trở lại!
                </Title>
                <Text type="secondary" className="text-center">
                  Vui lòng nhập thông tin đăng nhập để tiếp tục
                </Text>
              </div>

              {/* Form Ant Design */}
              <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  label="Tên đăng nhập"
                  name="username"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Tên người dùng hoặc Email"
                  />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Mật khẩu"
                  />
                </Form.Item>

                <Form.Item className="!mt-8">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full h-12 flex items-center justify-center font-semibold text-lg"
                    loading={loading}
                    icon={<ArrowRightOutlined />}
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                  </Button>
                </Form.Item>

                <div className="flex justify-between items-center mt-4">
                  <Typography.Link className="text-sm text-gray-600 hover:text-indigo-500 transition">
                    Quên mật khẩu?
                  </Typography.Link>
                  <Text className="text-sm text-gray-500">
                    Chưa có tài khoản?{" "}
                    <Typography.Link
                      onClick={() => router.push("/register")}
                      className="font-medium text-indigo-500 hover:text-indigo-700 transition"
                    >
                      Đăng ký
                    </Typography.Link>
                  </Text>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
