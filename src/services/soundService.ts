import { Audio } from 'expo-av';
import { useAppStore } from '@/store/appStore';

type SoundKey =
  | 'xp'
  | 'levelUp'
  | 'streak'
  | 'unlock'
  | 'tap'
  | 'correct'
  | 'wrong';

const soundFiles: Record<SoundKey, number> = {
  xp: require('@/assets/sounds/xp.mp3'),
  levelUp: require('@/assets/sounds/level-up.mp3'),
  streak: require('@/assets/sounds/streak.mp3'),
  unlock: require('@/assets/sounds/unlock.mp3'),
  tap: require('@/assets/sounds/tap.mp3'),
  correct: require('@/assets/sounds/correct.mp3'),
  wrong: require('@/assets/sounds/wrong.mp3'),
};

const loadedSounds: Partial<Record<SoundKey, Audio.Sound>> = {};

export async function loadSounds() {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
  });
  for (const key of Object.keys(soundFiles) as SoundKey[]) {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFiles[key]);
      loadedSounds[key] = sound;
    } catch {
      // Sound file missing — fail silently
    }
  }
}

export async function playSound(key: SoundKey) {
  try {
    const { soundEnabled } = useAppStore.getState();
    if (!soundEnabled) return;

    const sound = loadedSounds[key];
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Never crash the app for a missing sound
  }
}

export async function unloadSounds() {
  for (const sound of Object.values(loadedSounds)) {
    try {
      await sound?.unloadAsync();
    } catch {
      // ignore unload errors
    }
  }
}
