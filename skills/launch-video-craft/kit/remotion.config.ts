import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(17);
Config.setPixelFormat("yuv420p");
// SwiftShader in headless Chrome fails to create a WebGL context. Angle is the renderer
// that actually comes up, including for a film that never uses it.
Config.setChromiumOpenGlRenderer("angle");
