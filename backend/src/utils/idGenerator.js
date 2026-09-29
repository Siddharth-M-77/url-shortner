import { redis } from "../config/redis.js";

// Shuffled base62 alphabet so consecutive counters don't look sequential
const ALPHABET = "k9Xq2WmZ7bLpR4vNcT8sHfJ3yGdA6eUo1QwBnKtE5iMhCxS0jaYrPzVFulgOID";
const BASE = ALPHABET.length;
const COUNTER_KEY = "link:counter";
const CODE_LENGTH = 7;
// Code space: 62^7 ≈ 3.5 trillion unique codes
const SPACE = BigInt(BASE) ** BigInt(CODE_LENGTH);
// Large multiplier coprime with 62 (odd and not divisible by 31).
// (id * MULTIPLIER) mod SPACE is a bijection, so every counter value maps to a
// unique code, but consecutive counters produce codes that look random.
const MULTIPLIER = 1_580_030_173n;

function encodeBase62(num) {
  let n = BigInt(num);
  let code = "";
  while (n > 0n) {
    code = ALPHABET[Number(n % BigInt(BASE))] + code;
    n /= BigInt(BASE);
  }
  // Left-pad so every code has the same length
  return code.padStart(CODE_LENGTH, ALPHABET[0]);
}

// Raises the counter to at least `min` (never lowers it). Used to recover when the
// Redis counter was lost (flush, eviction, restart without persistence).
const RAISE_TO_SCRIPT = `
local cur = tonumber(redis.call("GET", KEYS[1]) or "0")
local min = tonumber(ARGV[1])
if cur < min then redis.call("SET", KEYS[1], min) return min end
return cur`;

export function ensureCounterAtLeast(min) {
  return redis.eval(RAISE_TO_SCRIPT, 1, COUNTER_KEY, String(min));
}

export async function generateShortCode() {
  // INCR is atomic, so parallel PM2 instances never receive the same number
  const id = await redis.incr(COUNTER_KEY);
  const scrambled = (BigInt(id) * MULTIPLIER) % SPACE;
  return encodeBase62(scrambled);
}
