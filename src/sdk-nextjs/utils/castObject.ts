type Ctor = {
  new(...args: any): any;
};

export function castObject<O extends Ctor>(value: unknown, ctor: O): InstanceType<O> {
  if (value instanceof ctor) {
    return value;
  }
  throw new TypeError(`passed value "${String(value)}" is not instance of ${ctor.name}`);
}
