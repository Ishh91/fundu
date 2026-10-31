import mongoose from 'mongoose';

const serviceablePincodeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      default: 'Lucknow',
      trim: true,
    },
    state: {
      type: String,
      default: 'Uttar Pradesh',
      trim: true,
    },
    locality: {
      type: String,
      default: '',
      trim: true,
    },
    services: {
      type: [String],
      default: ['sell', 'repair'],
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for fast lookup of active serviceable pincodes per service
serviceablePincodeSchema.index({ pincode: 1, is_active: 1, services: 1 });

export const ServiceablePincode =
  mongoose.models.ServiceablePincode ||
  mongoose.model('ServiceablePincode', serviceablePincodeSchema, 'serviceablepincodes');
