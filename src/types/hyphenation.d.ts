declare module 'hyphen/*' {
  type HyphenateSync = (text: string, options?: { hyphenChar?: string; minWordLength?: number }) => string;
  export const hyphenateSync: HyphenateSync;
  const hyphen: { hyphenateSync: HyphenateSync };
  export default hyphen;
}
