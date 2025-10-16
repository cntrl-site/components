import { CustomItemComponent } from './CustomItemTypes';

export class CustomItemRegistry {
  private definitions: Map<string, CustomItemComponent<string>> = new Map();

  define<T extends string>(type: T, component: CustomItemComponent<T>): this {
    this.definitions.set(type, component);
    return this;
  }

  get(type: string): CustomItemComponent<string> | undefined {
    return this.definitions.get(type);
  }
}
