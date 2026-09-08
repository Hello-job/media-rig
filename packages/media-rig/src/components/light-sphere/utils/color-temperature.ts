export function colorTemperatureToHex(kelvin: number) {
  const temperature = kelvin / 100;
  let red: number;
  let green: number;
  let blue: number;

  if (temperature <= 66) {
    red = 255;
    green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
    blue =
      temperature <= 19
        ? 0
        : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
  } else {
    red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592);
    green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492);
    blue = 255;
  }

  const channelToHex = (channel: number) =>
    Math.min(255, Math.max(0, Math.round(channel)))
      .toString(16)
      .padStart(2, "0");

  return `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}`;
}
