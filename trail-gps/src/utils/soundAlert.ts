import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let lastAlertTime = 0;
const ALERT_COOLDOWN_MS = 8000; // Avisar màxim un cop cada 8 segons per no saturar el ciclista

/**
 * Emet un avís sonor i hàptic d'alta prioritat quan es detecta que s'ha sortit de la ruta
 */
export async function triggerOffTrackAlert() {
  const now = Date.now();
  if (now - lastAlertTime < ALERT_COOLDOWN_MS) {
    return;
  }
  lastAlertTime = now;

  // 1. Vibració hàptica d'avís
  try {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch (e) {
    console.log('Error triggering haptics:', e);
  }

  // 2. Beep acústic
  try {
    // Si estem en web o react-native podem utilitzar el so sintetitzat
    if (typeof window !== 'undefined' && window.AudioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 (880Hz)
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15); // Baixa a A4

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    console.log('Audio notification error:', e);
  }
}
