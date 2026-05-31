/**
 * Notification Sound Service
 * Handles playing audio alerts for different notification types
 */

export type NotificationSoundType =
  | 'new-lead'
  | 'new-message'
  | 'high-priority'
  | 'booking'
  | 'warning'
  | 'success';

const SOUND_FILES: Record<NotificationSoundType, string> = {
  'new-lead': '/sounds/new-lead.mp3',
  'new-message': '/sounds/new-message.mp3',
  'high-priority': '/sounds/high-priority.mp3',
  'booking': '/sounds/booking.mp3',
  'warning': '/sounds/warning.mp3',
  'success': '/sounds/success.mp3',
};

// Cache for preloaded audio elements
const audioCache: Map<string, HTMLAudioElement> = new Map();

/**
 * Check if audio is supported
 */
export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && 'Audio' in window;
}

/**
 * Preload a sound file for faster playback
 */
export function preloadSound(soundType: NotificationSoundType): void {
  if (!isAudioSupported()) return;

  const soundFile = SOUND_FILES[soundType];
  if (!audioCache.has(soundFile)) {
    const audio = new Audio(soundFile);
    audio.preload = 'auto';
    audioCache.set(soundFile, audio);
  }
}

/**
 * Preload all notification sounds
 */
export function preloadAllSounds(): void {
  Object.keys(SOUND_FILES).forEach((key) => {
    preloadSound(key as NotificationSoundType);
  });
}

/**
 * Play a notification sound
 */
export async function playNotificationSound(
  soundType: NotificationSoundType,
  volume: number = 0.7
): Promise<void> {
  if (!isAudioSupported()) return;

  try {
    const soundFile = SOUND_FILES[soundType];
    let audio = audioCache.get(soundFile);

    if (!audio) {
      audio = new Audio(soundFile);
      audioCache.set(soundFile, audio);
    }

    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    // Audio playback may fail due to browser autoplay policies
    console.debug('[NotificationSounds] Audio playback blocked:', error);
  }
}

/**
 * Stop all currently playing sounds
 */
export function stopAllSounds(): void {
  audioCache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

/**
 * Map notification type to sound type
 */
export function getNotificationSoundType(notificationType: string): NotificationSoundType | null {
  switch (notificationType) {
    case 'NewLead':
    case 'LeadQualified':
    case 'FormSubmission':
      return 'new-lead';
    case 'NewMessage':
    case 'ConversationAssigned':
      return 'new-message';
    case 'LeadAssigned':
    case 'ConversationEscalated':
      return 'high-priority';
    case 'BookingScheduled':
    case 'BookingReminder':
      return 'booking';
    case 'Warning':
    case 'UsageAlert':
    case 'PaymentFailed':
      return 'warning';
    case 'Success':
    case 'ChannelConnected':
    case 'CrmSyncComplete':
      return 'success';
    default:
      return null;
  }
}

