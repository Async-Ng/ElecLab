"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Row,
  Col,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { brandColors, gradients } from "@/styles/theme";

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login: loginContext } = useAuth();

  // Đã xoá useEffect kiểm tra localStorage để tránh xung đột redirect với PrivateRoute

  const onFinish = async (values: LoginForm) => {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.username, // Since we're using email as username
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.message || "Đăng nhập thất bại");
        return;
      }

      // Sử dụng context login để cập nhật trạng thái ngay lập tức
      loginContext(data.token, data.user);

      // Show success message
      message.success("Đăng nhập thành công!");

      // Redirect to lecturer's timetable page
      router.push(`/timetables/${data.user._id}`);
    } catch (error) {
      message.error("Đăng nhập thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-0 overflow-hidden">
      <Image
        src="/images/background.jpg"
        alt="Login Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40 z-0" />
      <div className="relative z-10 w-full h-full sm:w-[95%] sm:h-[95%] lg:w-[90%] lg:h-[90%] flex bg-transparent shadow-lg sm:rounded-xl overflow-hidden">
        <Row className="w-full h-full">
          <Col
            xs={0}
            md={14}
            lg={15}
            className="relative flex flex-col justify-center text-left p-6 sm:p-8 lg:p-12"
          >
            <div className="relative z-10 w-full">
              <Title
                level={1}
                style={{ color: "#FFFFFF" }}
                className="!mt-0 !mb-2 text-2xl sm:text-3xl lg:text-5xl xl:text-6xl"
              >
                Khoa kỹ thuật Điện - Điện tử
              </Title>

              <Text
                style={{
                  color: brandColors.warning,
                  fontWeight: 600,
                }}
                className="block text-lg sm:text-xl lg:text-2xl xl:text-3xl"
              >
                Hệ thống quản lý phòng thực hành - ElecLab
              </Text>
            </div>
          </Col>
          <Col
            xs={24}
            md={10}
            lg={9}
            className="relative flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 xl:p-16 overflow-y-auto"
            style={{
              background: "white",
              borderTopLeftRadius: "0",
              borderBottomLeftRadius: "0",
              marginLeft: "0",
              paddingLeft: "24px",
            }}
          >
            <style jsx>{`
              @media (min-width: 768px) {
                .curved-left {
                  border-top-left-radius: 50% 50%;
                  border-bottom-left-radius: 50% 50%;
                  margin-left: -100px;
                  padding-left: 130px !important;
                }
              }
              @media (min-width: 1024px) {
                .curved-left {
                  margin-left: -150px;
                  padding-left: 180px !important;
                }
              }
            `}</style>
            <div
              className="curved-left w-full h-full flex items-center justify-center"
              style={{ background: "white" }}
            >
              <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-6 sm:mb-10">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-3 sm:mb-4">
                    <Image
                      src="/images/logo.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <Title
                    level={3}
                    className="text-center !mb-1"
                    style={{ color: brandColors.primary }}
                  >
                    Đăng nhập
                  </Title>
                  <Text
                    type="secondary"
                    className="text-center text-sm sm:text-base"
                    style={{ color: brandColors.textSecondary }}
                  >
                    Chào mừng bạn trở lại với hệ thống Eleclab.
                  </Text>
                </div>

                <Form
                  name="login"
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                    ]}
                    className="!mb-4 sm:!mb-6"
                  >
                    <Input
                      prefix={<UserOutlined className="site-form-item-icon" />}
                      placeholder="Email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                    ]}
                    className="!mb-4 sm:!mb-6"
                  >
                    <Input.Password
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      placeholder="Mật khẩu"
                    />
                  </Form.Item>

                  <Form.Item className="!mb-6 sm:!mb-8">
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="w-full h-10 sm:h-12 flex items-center justify-center font-semibold text-base sm:text-lg"
                      loading={loading}
                      icon={<ArrowRightOutlined />}
                    >
                      {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                  </Form.Item>

                  <div
                    className="mt-4 sm:mt-6 text-center text-xs sm:text-sm"
                    style={{ color: brandColors.textSecondary }}
                  >
                    <Divider plain className="!mb-3 sm:!mb-4">
                      Thông tin hệ thống
                    </Divider>
                    <p className="mb-2">
                      Hệ thống ElecLab dành cho giảng viên và quản lý phòng thực
                      hành.
                    </p>
                    <p className="mb-2">
                      Liên hệ hỗ trợ:{" "}
                      <a
                        href="mailto:ndloi@hcmct.edu.vn"
                        style={{ color: brandColors.primary }}
                      >
                        ndloi@hcmct.edu.vn
                      </a>
                    </p>
                    <p>
                      Đảm bảo bảo mật thông tin cá nhân và dữ liệu phòng thực
                      hành.
                    </p>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
