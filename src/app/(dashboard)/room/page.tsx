'use client';

import { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Space, Popconfirm, message, Select, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Room } from '@/types/room';
import { roomService } from '@/services/room.service';

const RoomPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getAllRooms();
      setRooms(data);
    } catch (error) {
      message.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Room) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          />
          <Popconfirm
            title="Delete Room"
            description="Are you sure you want to delete this room?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="link" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await roomService.deleteRoom(id);
      await fetchRooms();
      message.success('Room deleted successfully');
    } catch (error) {
      message.error('Failed to delete room');
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setSubmitting(true);
        if (editingRoom) {
          await roomService.updateRoom(editingRoom.id, values);
          message.success('Room updated successfully');
        } else {
          await roomService.createRoom({
            ...values,
            users_manage: values.users_manage || []
          });
          message.success('Room created successfully');
        }
        setIsModalOpen(false);
        form.resetFields();
        await fetchRooms();
      } catch (error) {
        message.error('Operation failed');
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Room
        </Button>
      </div>

      <Table
        loading={loading}
        columns={columns}
        dataSource={rooms}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} rooms`,
        }}
      />

      <Modal
        title={editingRoom ? 'Edit Room' : 'Add Room'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editingRoom || {}}
        >
          <Form.Item
            name="name"
            label="Room Name"
            rules={[{ required: true, message: 'Please input room name!' }]}
          >
            <Input placeholder="Enter room name" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please input room location!' }]}
          >
            <Input placeholder="Enter room location" />
          </Form.Item>

          <Form.Item
            name="users_manage"
            label="Users Management"
            tooltip="Select users who can manage this room"
          >
            <Select
              mode="multiple"
              placeholder="Select users"
              allowClear
              style={{ width: '100%' }}
              options={[
                // You can fetch actual users here
                { label: 'Admin', value: 'admin' },
                { label: 'Manager', value: 'manager' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomPage;