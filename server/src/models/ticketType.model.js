const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Ticket tier name is required'],
      trim: true,
      maxlength: [100, 'Tier name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    // Price in integer paise (₹1 = 100 paise) to prevent floating-point rounding bugs
    price: {
      type: Number,
      required: [true, 'Price in paise is required'],
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    // Reserved count represents temporary holds currently checked out but not yet paid
    reservedCount: {
      type: Number,
      default: 0,
      min: [0, 'Reserved count cannot be negative']
    },
    // Sold count represents confirmed, paid tickets
    soldCount: {
      type: Number,
      default: 0,
      min: [0, 'Sold count cannot be negative']
    },
    salesStartsAt: {
      type: Date
    },
    salesEndsAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for finding active ticket tiers for an event quickly
ticketTypeSchema.index({ event: 1, isActive: 1 });

// Virtual property: calculate currently available tickets
ticketTypeSchema.virtual('availableCapacity').get(function () {
  return Math.max(0, this.totalCapacity - (this.reservedCount + this.soldCount));
});

ticketTypeSchema.set('toJSON', { virtuals: true });
ticketTypeSchema.set('toObject', { virtuals: true });

const TicketType = mongoose.model('TicketType', ticketTypeSchema);

module.exports = TicketType;
