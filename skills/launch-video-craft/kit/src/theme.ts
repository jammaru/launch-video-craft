import { loadFont as loadDisplay } from "@remotion/google-fonts/Manrope";
import { loadFont as loadChat } from "@remotion/google-fonts/InterTight";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadUi } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });
const ui = loadUi("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const chat = loadChat("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

export const fonts = {
  display: `${display.fontFamily}, sans-serif`,
  ui: `${ui.fontFamily}, sans-serif`,
  // The agent chat and the terminal: Inter Tight for what the agent says, JetBrains Mono for commands and output.
  chat: `${chat.fontFamily}, sans-serif`,
  mono: `${mono.fontFamily}, ui-monospace, monospace`,
};

// Replace with the product's own tokens (its CSS variables or design-system palette).
export const color = {
  ink: "#1d1420",
  paper: "#ffffff",
  gray: "#e7e5e8",
  muted: "#6f6773",
  line: "#ebe8ee",
  lilac: "#cdb5f5",
  violet: "#7c4fd8",
  blush: "#f7b3b8",
  rose: "#e0566c",
  sun: "#f5c518",
  green: "#2f9e5b",
};

export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;
