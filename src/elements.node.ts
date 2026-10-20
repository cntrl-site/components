import { components } from './Components/components';
import type { ComponentElement } from './elements';

const elements = new Map<string, ComponentElement>(components.map(component => [component.id, component.element]));

export function hasComponentElement(id: string): boolean {
  return elements.has(id);
}

export function getComponentElement(id: string): ComponentElement | undefined {
  return elements.get(id);
}

export function loadComponentElement(id: string): Promise<ComponentElement | undefined> {
  return Promise.resolve(elements.get(id));
}
