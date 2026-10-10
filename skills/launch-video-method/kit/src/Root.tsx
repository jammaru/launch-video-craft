import { Composition, Folder } from "remotion";

import { Film, scenes, TOTAL } from "./Film";
import durations from "./scenes/durations.json";
import { FPS, HEIGHT, WIDTH } from "./theme";

const frame = { fps: FPS, width: WIDTH, height: HEIGHT };

export function Root() {
  return (
    <>
      <Composition id="Launch" component={Film} durationInFrames={TOTAL} {...frame} />
      <Folder name="Shots">
        {scenes.map(({ id, Component }) => (
          <Composition key={id} id={`Shot-${id}`} component={Component} durationInFrames={durations[id]} {...frame} />
        ))}
      </Folder>
      {/*
        A composition that is supposed to fail (to film the product rejecting something) goes here with
        lazyComponent, so its error breaks only its own render:
        <Composition id="Rejected" lazyComponent={() => import("./checks/Rejected")} durationInFrames={1} {...frame} />
      */}
    </>
  );
}
