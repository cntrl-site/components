import { Article } from '../../sdk/types/article/Article';
import { Section, SectionHeight } from '../../sdk/types/article/Section';
import { Layout } from '../../sdk/types/project/Layout';
import { Project } from '../../sdk/types/project/Project';
import { CustomItemRegistry } from './CustomItemRegistry';
import { CustomSectionRegistry } from './CustomSectionRegistry';
import { Component as TComponent } from '../../sdk/types/component/Component';
import { components } from '../../sdk/Components/components';

interface SdkContextInitProps {
  project: Project;
  article: Article;
}

export class CntrlSdkContext {
  private _layouts: Layout[] = [];
  private _fonts?: Project['fonts'] = undefined;
  private sectionHeightMap: Map<string, Record<string, SectionHeight>> = new Map();
  private components: Map<string, TComponent> = new Map();

  constructor(
    public readonly customItems: CustomItemRegistry,
    public readonly customSections: CustomSectionRegistry
  ) {}

  async resolveSectionData(sections: Section[]): Promise<Record<string, any>> {
    const resolvers = sections.map(section => {
      const resolver = section.name ? this.customSections.getResolver(section.name) : undefined;
      if (!resolver) return;
      return {
        name: section.name,
        resolver
      };
    }).filter(isDefined);
    return Object.fromEntries(
      await Promise.all(resolvers.map(async ({ name, resolver }) => [name, await resolver()]))
    );
  }

  init({ project, article }: SdkContextInitProps) {
    this.setLayouts(project.layouts);
    this.setComponents(components);
    this.setFonts(project.fonts);
    this.setSectionsHeight(article.sections);
  }

  setLayouts(layouts: Layout[]) {
    this._layouts = layouts;
  }

  private setComponents(components: TComponent[]) {
    for (const component of components) {
      this.components.set(component.id, component);
    }
  }

  private setFonts(fonts: Project['fonts']) {
    this._fonts = fonts;
  }

  setSectionsHeight(sections: Section[]) {
    for (const section of sections) {
      this.sectionHeightMap.set(section.id, section.height);
    }
  }

  getSectionHeightData(sectionId: string) {
    const sectionHeightData = this.sectionHeightMap.get(sectionId);
    return sectionHeightData;
  }

  get layouts(): Layout[] {
    return this._layouts;
  }

  get fonts(): Project['fonts'] | undefined {
    return this._fonts;
  }

  getComponent(id: string): TComponent | undefined {
    return this.components.get(id);
  }
}

function isDefined<T>(value: T): value is Exclude<T, undefined> {
  return value !== undefined;
}
