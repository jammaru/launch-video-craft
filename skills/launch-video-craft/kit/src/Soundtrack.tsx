import { Html5Audio, Sequence, staticFile } from "remotion";

import demo from "./captured/demo.json";
import { copy } from "./copy";
import { span, typingEnd } from "./lib/motion";
import { timing as agent } from "./scenes/Agent.beats";
import { timing as command } from "./scenes/Command.beats";
import durations from "./scenes/durations.json";

type Sound = "click" | "key" | "pop" | "whoosh" | "clap" | "buzz" | "chime";
type Cue = [frame: number, sound: Sound, volume?: number];
type SceneId = keyof typeof durations;

function keys(from: number, to: number, every = span(3)): Cue[] {
  const cues: Cue[] = [];
  for (let at = from; at < to; at += every) cues.push([at, "key", 0.35]);
  return cues;
}

// Scene-local frames, all taken from the beat sheets so a reveal and its sound cannot drift apart.
const cues: Record<SceneId, Cue[]> = {
  Command: [
    [command.windowIn, "whoosh", 0.55],
    [command.focus, "click"],
    ...keys(command.typeStart, typingEnd(command.typeStart, demo.command, command.typePerFrame)),
    [command.enter, "key", 0.8],
    [command.firstLine, "pop", 0.5],
  ],
  Agent: [
    [agent.windowIn, "whoosh", 0.55],
    [agent.focus, "click"],
    ...keys(agent.typeStart, typingEnd(agent.typeStart, copy.agent.prompt, agent.typePerFrame)),
    [agent.send, "click"],
    [agent.using, "chime", 0.45],
    [agent.tool, "pop", 0.35],
    [agent.answer, "pop", 0.5],
  ],
};

export function Soundtrack() {
  let offset = 0;
  const placed = (Object.keys(durations) as SceneId[]).flatMap((id) => {
    const start = offset;
    offset += durations[id];
    return cues[id].map(([at, sound, volume = 1]) => ({ from: start + at, sound, volume }));
  });
  return (
    <>
      <Html5Audio src={staticFile("audio/bed.wav")} volume={0.6} />
      {placed.map(({ from, sound, volume }, index) => (
        <Sequence key={index} from={from} durationInFrames={span(45)} layout="none">
          <Html5Audio src={staticFile(`audio/${sound}.wav`)} volume={volume * 0.55} />
        </Sequence>
      ))}
    </>
  );
}
