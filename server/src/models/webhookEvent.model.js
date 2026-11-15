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
      enum: ['PROCESSED', 'FAILED', 'IGNORED'],
      default: 'PROCESSED',
      index: true
    },
    errorMessage: {
      type: String,
      default: null
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);

module.exports = WebhookEvent;
