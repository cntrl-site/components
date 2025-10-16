import React, { PropsWithChildren } from 'react';

export class CustomSectionRegistry {
  private definitions: Map<string, CustomSection<any>> = new Map();

  define<TData>(name: string, section: CustomSection<TData>): this {
    this.definitions.set(name, section);
    return this;
  }

  getComponent(name: string): CustomSectionComponent<any> | undefined {
    return this.definitions.get(name)?.component;
  }

  getResolver(name: string): (() => Promise<any>) | undefined {
    return this.definitions.get(name)?.dataResolver;
  }
}

type CustomSection<TData = {}> = {
  component: CustomSectionComponent<TData>,
  dataResolver?: () => Promise<TData>
};

type CustomSectionComponent<TData> = React.FC<PropsWithChildren<{ data: TData }>>;
