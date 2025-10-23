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

const { Title, Text } = Typography;
// const PRIMARY_COLOR = '#1890ff'; // Không dùng nữa, sẽ dùng màu đen/xám đậm cho nút

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

      // Redirect to timetable page
      router.push("/timetable");
    } catch (error) {
      console.error("Login error:", error);
      message.error("Đăng nhập thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Toàn bộ màn hình, màu nền không gradient, chỉ để cho ảnh nền quyết định
    <div className="w-screen h-screen flex items-center justify-center p-0 overflow-hidden">
      <Image
        src="/images/background.jpg" // Đổi thành ảnh nền bạn muốn
        alt="Login Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40 z-0" />{" "}
      <div className="relative z-10 w-[90%] h-[90%] flex bg-transparent shadow-lg rounded-xl overflow-hidden">
        <Row className="w-full h-full">
          <Col
            xs={0}
            md={14}
            className="relative flex flex-col justify-center text-left p-12 "
          >
            <div className="relative z-10 w-full">
              <Title
                level={1}
                style={{ color: "#FFFFFF", fontSize: "4.2rem" }}
                className="!mt-0 !mb-2 text-5xl"
              >
                Khoa kỹ thuật Điện - Điện tử
              </Title>

              <Text
                style={{
                  color: "#fff",
                  fontSize: "2.2rem",
                }}
                className="block"
              >
                Hệ thống quản lý phòng thực hành - ElecLab
              </Text>
            </div>
          </Col>

          <Col
            xs={24}
            md={10}
            className="relative flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-white overflow-hidden"
            style={{
              borderTopLeftRadius: "50% 50%", // Cong theo hình ellipse
              borderBottomLeftRadius: "50% 50%", // Cong theo hình ellipse
              marginLeft: "-150px", // Đẩy lùi phần cong vào trong để lộ ảnh nền
              paddingLeft: "180px", // Bù lại khoảng trống đã mất
            }}
          >
            <div className="w-full max-w-md">
              <div className="flex flex-col items-center mb-10">
                <div className="relative w-32 h-32 mb-4">
                  {" "}
                  <Image
                    src="/images/logo.png" // Thay bằng logo của bạn
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <Title level={3} className="text-center !mb-1 text-gray-800">
                  Đăng nhập
                </Title>
                <Text type="secondary" className="text-center text-base">
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
                  rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                  className="!mb-6" // Khoảng cách giữa các item
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
                  className="!mb-6"
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="Mật khẩu"
                  />
                </Form.Item>

                <Form.Item className="!mb-8">
                  {" "}
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full h-12 flex items-center justify-center font-semibold text-lg"
                    loading={loading}
                    icon={<ArrowRightOutlined />}
                    style={{
                      backgroundColor: "#333333",
                      borderColor: "#333333",
                    }} // Màu nút đen
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </Form.Item>

                <Divider>Hoặc</Divider>

                <Form.Item className="!mb-6">
                  <Button
                    icon={<GoogleOutlined />}
                    className="w-full h-12 flex items-center justify-center font-semibold text-lg"
                  >
                    Đăng nhập với Google
                  </Button>
                </Form.Item>

                <div className="flex justify-between items-center mt-6 text-sm">
                  {" "}
                  <Typography.Link className="text-gray-600 hover:text-indigo-500 transition">
                    Quên mật khẩu?
                  </Typography.Link>
                  <Text className="text-gray-500">
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
