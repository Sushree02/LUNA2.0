// src/utils/moodEngine.ts

type WeatherMood =
  | "energetic"
  | "happy"
  | "relax"
  | "chill"
  | "dark";

export function getMoodFromWeatherAndTime(
  weatherMain: string,
  hour: number
): WeatherMood {
  // ---- TIME BASE MOOD ----
  let timeMood: WeatherMood;

  if (hour >= 5 && hour < 11) {
    timeMood = "energetic";
  } else if (hour >= 11 && hour < 17) {
    timeMood = "happy";
  } else if (hour >= 17 && hour < 21) {
    timeMood = "relax";
  } else {
    timeMood = "chill";
  }

  // ---- WEATHER OVERRIDE ----
  if (
    weatherMain === "Rain" ||
    weatherMain === "Drizzle" ||
    weatherMain === "Mist"
  ) {
    return "chill";
  }

  if (weatherMain === "Thunderstorm") {
    return "dark";
  }

  if (weatherMain === "Clear" && timeMood === "energetic") {
    return "energetic";
  }

  return timeMood;
}