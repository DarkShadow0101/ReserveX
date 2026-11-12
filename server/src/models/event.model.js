const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    venue: {
      type: String,
      trim: true,
      default: ''
    },
    startsAt: {
      type: Date,
      required: [true, 'Event start date and time are required']
    },
    endsAt: {
      type: Date,
      required: [true, 'Event end date and time are required']
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required']
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying events within an organization by status
eventSchema.index({ organization: 1, status: 1 });

// Index for public event discovery (finding published upcoming events)
eventSchema.index({ status: 1, startsAt: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
