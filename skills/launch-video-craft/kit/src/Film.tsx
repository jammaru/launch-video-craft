import type { ComponentType } from "react";
import { AbsoluteFill, Series } from "remotion";

import durations from "./scenes/durations.json";
import { Agent } from "./scenes/Agent";
import { Command } from "./scenes/Command";
import { Soundtrack } from "./Soundtrack";

export type SceneId = keyof typeof durations;

// One entry per shot, in film order. Lengths live in durations.json.
export const scenes: { id: SceneId; Component: ComponentType }[] = [
  { id: "Command", Component: Command },
  { id: "Agent", Component: Agent },
];

export const TOTAL = scenes.reduce((total, scene) => total + durations[scene.id], 0);

export function Film() {
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      <Series>
        {scenes.map(({ id, Component }) => (
          <Series.Sequence key={id} name={id} durationInFrames={durations[id]}>
            <Component />
          </Series.Sequence>
        ))}
      </Series>
      <Soundtrack />
    </AbsoluteFill>
  );
}
