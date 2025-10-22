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
    enum: ['Lecture', 'Head_of_deparment'],
    validate: {
      validator: function(roles: string[]) {
        return roles.every(role => ['Lecture', 'Head_of_deparment'].includes(role));
      },
      message: 'Vai trò không hợp lệ. Vai trò phải là "Lecture" hoặc "Head_of_deparment"'
    }
  },
  rooms_manage: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
