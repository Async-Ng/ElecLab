import { Room } from '@/types/room';

const BASE_URL = '/api/rooms';

export const roomService = {
  // Fetch all rooms
  async getAllRooms(): Promise<Room[]> {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }
    const data = await response.json();
    return data.rooms;
  },

  // Fetch single room
  async getRoom(id: string): Promise<Room> {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch room');
    }
    const data = await response.json();
    return data.room;
  },

  // Create new room
  async createRoom(room: Omit<Room, 'id'>): Promise<Room> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(room),
    });
    if (!response.ok) {
      throw new Error('Failed to create room');
    }
    const data = await response.json();
    return data.room;
  },

  // Update room
  async updateRoom(id: string, room: Partial<Room>): Promise<Room> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(room),
    });
    if (!response.ok) {
      throw new Error('Failed to update room');
    }
    const data = await response.json();
    return data.room;
  },

  // Delete room
  async deleteRoom(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete room');
    }
  },
};