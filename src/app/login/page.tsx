"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

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
    <div className="w-screen h-screen flex items-center justify-center p-0 overflow-hidden">
      <Image
        src="/images/background.jpg"
        alt="Login Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40 z-0" />
      <div className="relative z-10 w-[90%] h-[90%] flex bg-transparent shadow-lg rounded-xl overflow-hidden">
        <Row className="w-full h-full">
          <Col
            xs={0}
            md={15}
            className="relative flex flex-col justify-center text-left p-12"
          >
            <div className="relative z-10 w-full">
              <Title
                level={1}
                style={{ color: "#FFFFFF", fontSize: "4rem" }}
                className="!mt-0 !mb-2"
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
              borderTopLeftRadius: "50% 50%",
              borderBottomLeftRadius: "50% 50%",
              marginLeft: "-150px",
              paddingLeft: "180px",
            }}
          >
            <div className="w-full max-w-md">
              <div className="flex flex-col items-center mb-10">
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src="/images/logo.png"
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
                  className="!mb-6"
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
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full h-12 flex items-center justify-center font-semibold text-lg"
                    loading={loading}
                    icon={<ArrowRightOutlined />}
                    style={{
                      backgroundColor: "#333333",
                      borderColor: "#333333",
                    }}
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </Form.Item>

                <div className="mt-6 text-center text-gray-500 text-sm">
                  <Divider plain className="!mb-4">
                    Thông tin hệ thống
                  </Divider>
                  <p>
                    Hệ thống ElecLab dành cho giảng viên và quản lý phòng thực
                    hành.
                  </p>
                  <p>
                    Liên hệ hỗ trợ:{" "}
                    <a
                      href="mailto:ndloi@hcmct.edu.vn"
                      className="text-blue-600"
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
          </Col>
        </Row>
      </div>
    </div>
  );
}
