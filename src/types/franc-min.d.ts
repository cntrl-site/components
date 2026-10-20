declare module 'franc-min' {
  function franc(value: string, options?: { minLength?: number; whitelist?: string[]; blacklist?: string[] }): string;
  export = franc;
}
