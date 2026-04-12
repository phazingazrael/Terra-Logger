// minmax from numberUtils.js from Azgaar.
// https://github.com/Azgaar/Fantasy-Map-Generator/tree/0e84a0d72e4e1275f62d66b509ef74e1d2be2d40/utils/numberUtils.js#L10C1-L12C2
export function minmax(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
