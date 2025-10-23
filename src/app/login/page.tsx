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
      {/* Background Image full screen */}
      <Image
        src="/images/background.jpg" // Đổi thành ảnh nền bạn muốn
        alt="Login Background"
        fill
        className="object-cover"
        priority
      />
      {/* Overlay tổng thể, có thể làm mờ hơn nếu cần */}
      <div className="absolute inset-0 bg-black/40 z-0" />{" "}
      {/* Tối hơn một chút */}
      {/* Container Chính - Giờ đây là một khối hình chữ nhật lớn */}
      {/* Chúng ta sẽ dùng flex để chia làm 2 cột trong đây */}
      <div className="relative z-10 w-[90%] h-[90%] flex bg-transparent shadow-lg rounded-xl overflow-hidden">
        <Row className="w-full h-full">
          {/* Cột 1: Hình ảnh/Minh họa & Văn bản (chiếm 60% chiều rộng) */}
          <Col
            xs={0}
            md={14}
            className="relative flex flex-col justify-center text-left p-12 "
          >
            {/* Lớp overlay riêng cho phần ảnh để văn bản dễ đọc hơn */}
            {/* Đã được đẩy ra ngoài cho toàn màn hình rồi */}

            {/* Content trên nền ảnh */}
            <div className="relative z-10 w-full">
              {/* Tiêu đề chính, đậm và lớn */}
              <Title
                level={2}
                style={{ color: "#FFFFFF" }} // Dùng mã Hex
                className="!mt-0 !mb-2"
              >
                Khoa kỹ thuật Điện - Điện tử
              </Title>

              <Text
                style={{ color: "white" }} // Hoặc dùng tên màu tiếng Anh
                className="block"
              >
                Hệ thống quản lý phòng thực hành - ElecLab
              </Text>

              {/* Thông tin tài khoản mẫu (nếu cần hiển thị) */}
              {/* Tôi sẽ bỏ nó đi để giao diện trông sạch hơn giống ảnh */}
              {/* <Text className="text-white mt-8 block text-lg custom-text-shadow">
                TK: ndloi@hcmct.edu.vn
                <br />
                MK: 123456
              </Text> */}
            </div>
          </Col>

          {/* Cột 2: Form Đăng nhập (chiếm 40% chiều rộng) */}
          {/* Để tạo hình dạng cong, chúng ta sẽ dùng border-radius và một padding/margin ảo */}
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
            {/* Tạo một div để giới hạn form lại ở trung tâm cột, tránh bị quá rộng */}
            <div className="w-full max-w-md">
              <div className="flex flex-col items-center mb-10">
                <div className="relative w-32 h-32 mb-4">
                  {" "}
                  {/* Kích thước logo lớn hơn */}
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

              {/* Form Ant Design */}
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
                  {/* Tăng khoảng cách dưới nút */}
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

                {/* Divider hoặc "hoặc" */}
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
                  {/* Căn chỉnh lại phần dưới */}
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
