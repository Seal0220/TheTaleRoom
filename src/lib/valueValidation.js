export function hasDisplayValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function clampNumber(value, min, max) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
}
