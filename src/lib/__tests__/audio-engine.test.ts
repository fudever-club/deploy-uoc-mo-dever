import { describe, it, expect } from "vitest";
import {
  playTactileClick,
  playPoemMagicSound,
  playLanternAscendChime,
  playReactionSound,
  playSlotTickSound,
  playCelebrationFanfare,
  playFireworkBurstSound,
  playMysteryDropChime,
} from "../audio-synthesizer";

describe("Web Audio Synthesizer Engine", () => {
  it("should safely invoke all sound synthesis functions in Node/SSR environment without throwing", () => {
    expect(() => playTactileClick()).not.toThrow();
    expect(() => playPoemMagicSound()).not.toThrow();
    expect(() => playLanternAscendChime()).not.toThrow();
    expect(() => playSlotTickSound()).not.toThrow();
    expect(() => playCelebrationFanfare()).not.toThrow();
    expect(() => playFireworkBurstSound()).not.toThrow();
    expect(() => playMysteryDropChime()).not.toThrow();
  });

  it("should handle various emoji reaction sounds without error", () => {
    const emojis = ["🏮", "❤️", "✨", "🚀", "🐞", "🔥", "🎉", "unknown_emoji"];
    emojis.forEach((emoji) => {
      expect(() => playReactionSound(emoji)).not.toThrow();
    });
  });
});
