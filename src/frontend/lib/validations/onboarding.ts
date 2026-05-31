/**
 * Onboarding validation schemas
 */

import { z } from 'zod';

export const businessProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name is too long'),
  industry: z.string().min(1, 'Please select an industry'),
  companySize: z.string().min(1, 'Please select company size'),
  timezone: z.string().min(1, 'Please select a timezone'),
  crmPlatform: z.string().optional(),
  leadType: z.string().optional(),
  mainObjective: z.string().optional(),
});

export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

export const channelSetupSchema = z.object({
  channels: z.array(z.object({
    type: z.string(),
    enabled: z.boolean(),
    credentials: z.object({
      twilioAccountSid: z.string().optional(),
      twilioAuthToken: z.string().optional(),
    }).optional(),
  })),
  automations: z.array(z.string()).optional(),
});

export type ChannelSetupFormData = z.infer<typeof channelSetupSchema>;

export const phoneSetupSchema = z.object({
  type: z.string(),
  existingNumber: z.string().optional(),
  newNumber: z.string().optional(),
});

export const callHandlingSchema = z.object({
  forwardNumber: z.string().optional(),
  sendSmsOnMissed: z.boolean(),
  enableOutboundAi: z.boolean(),
});

export const aiConfigurationSchema = z.object({
  budget: z.number().min(0).max(100),
  authority: z.number().min(0).max(100),
  need: z.number().min(0).max(100),
  timeline: z.number().min(0).max(100),
  phoneSetup: phoneSetupSchema.optional(),
  callHandling: callHandlingSchema.optional(),
  persona: z.string().optional(),
  businessHours: z.string().optional(),
  calendarProvider: z.string().optional(),
  followUpPreference: z.string().optional(),
  enableAutoResponse: z.boolean().optional(),
});

export type AIConfigurationFormData = z.infer<typeof aiConfigurationSchema>;