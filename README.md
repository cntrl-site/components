# Control Components

This is custom components for control editor and public websites.
## Lazy elements

`@cntrl-site/components/elements` gives the built-in component implementations without loading all of them up front:

- `hasComponentElement(id)`: whether `id` is a built-in component.
- `getComponentElement(id)`: the element, if it has already loaded.
- `loadComponentElement(id)`: loads it. Concurrent calls share one request.
- `hasComponentElementFailed(id)`: true after a failed load, until a retry succeeds.

In the browser every component is its own chunk. After a failed load, calls within the next 2 s (then 4 s) return the same rejection instead of fetching again, and a component gets at most 3 attempts per page load.

Under the `node` export condition the entry resolves to `elements.node`, which has every element synchronously, so server rendering includes all components.

### Jest

jsdom test environments resolve the `browser` and `require` conditions rather than `node`, and Jest can't run the browser variant's native `import()` without `--experimental-vm-modules`. Map the subpath to the node variant in `jest.config.js`:

```js
moduleNameMapper: {
  '^@cntrl-site/components/elements$': require.resolve('@cntrl-site/components/elements'),
},
```

`require.resolve` runs in Node while the config loads, so it returns `dist/elements.node.js`.
