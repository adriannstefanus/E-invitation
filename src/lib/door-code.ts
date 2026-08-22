import { randomInt } from "crypto";

export function createDoorCode() {
  return String(randomInt(100000, 1000000));
}

export { formatDoorCode, isDoorCodeQuery } from "@/lib/door-code-format";
