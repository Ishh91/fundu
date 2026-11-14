import mongoose from 'mongoose';
import { createSchema } from './baseSchema.js';

const systemErrorSchema = createSchema(
  {
    type: { type: String, default: 'client_error' },
    message: { type: String, required: true },
    stack: { type: String, default: '' },
    url: { type: String, default: '' },
    path: { type: String, default: '' },
    component_stack: { type: String, default: '' },
    user_id: { type: String, default: null },
    user_email: { type: String, default: null },
    user_agent: { type: String, default: '' },
    ip: { type: String, default: '' },
    metadata: { type: Object, default: () => ({}) },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

// Auto-cleanup errors older than 30 days
systemErrorSchema.index({ created_at: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const SystemError = mongoose.models.SystemError || mongoose.model('SystemError', systemErrorSchema);

