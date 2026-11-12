const crypto = require('crypto');
const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema(
  {
    ticketType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketType',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0 // Price in integer paise
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0 // quantity * pricePerUnit in paise
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    items: {
      type: [bookingItemSchema],
      required: true,
      validate: [(val) => val.length > 0, 'Booking must have at least one ticket item']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0 // in paise
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true
    },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'REFUND_PENDING'],
      default: 'PENDING_PAYMENT',
      index: true
    },
    holdExpiresAt: {
      type: Date,
      required: true,
      index: true
    },
    paymentId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1, status: 1 });
bookingSchema.index({ status: 1, holdExpiresAt: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
