import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  staff_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    required: true,
    enum: ['User', 'Admin'],
    validate: {
      validator: function(roles: string[]) {
        return roles.every(role => ['User', 'Admin'].includes(role));
      },
      message: 'Vai trò không hợp lệ. Vai trò phải là "User" hoặc "Admin"'
    }
  },
  rooms_manage: {
    type: [String],
    default: [],
  },
  avatar: {
    type: Buffer,
    default: null,
  },
  position: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
