const mongoose = require('mongoose');

// Define the blueprint (Schema) for a User document
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['customer', 'staff', 'owner'],
      default: 'customer'
    }
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true
  }
);

// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
