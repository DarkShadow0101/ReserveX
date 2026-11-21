const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: [true, 'Webhook event ID is required'],
      unique: true,
      index: true
    },
    eventType: {
      type: String,
      required: [true, 'Webhook event type is required'],
      index: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ['PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED'],
      default: 'PROCESSING',
      index: true
    },
    attempts: {
      type: Number,
      default: 1
    },
    errorMessage: {
      type: String,
      default: null
    },
    processedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);

module.exports = WebhookEvent;
