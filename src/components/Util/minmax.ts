// minmax from numberUtils.js from Azgaar.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/master/utils/numberUtils.js#L10C1-L12C2
export function minmax(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
