import { EventEmitter } from '../EventEmitter';
import ResizeObserver from 'resize-observer-polyfill';

interface EventMap {
  'scroll': undefined;
  'resize': DOMRect;
}

export class ArticleRectObserver extends EventEmitter<EventMap> {
  private resizeObserver: ResizeObserver;
  private articleWidth: number = 0;
  private registry: Map<string, HTMLElement> = new Map();
  private scrollPos: number = window.scrollY;
  private animationFrame: number = NaN;
  private parent: HTMLElement | undefined = undefined;
  private sectionsScrollMap: Map<string, number> = new Map();

  constructor() {
    super();
    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
  }

  get scroll(): number {
    return this.scrollPos;
  }

  getSectionScroll(sectionId: string): number {
    const sectionTop = this.sectionsScrollMap.get(sectionId);
    if (sectionTop === undefined) return 0;
    return -(sectionTop / this.articleWidth - this.scrollPos);
  }

  getSectionTop(sectionId: string): number {
    const sectionTop = this.sectionsScrollMap.get(sectionId);
    return sectionTop ?? 0;
  }

  get width(): number {
    return this.articleWidth;
  }

  private setScroll(scroll: number) {
    this.scrollPos = scroll;
  }

  init(parent: HTMLElement) {
    this.parent = parent;
    const onScroll = () => {
      this.handleScroll(window.scrollY);
      if (!isNaN(this.animationFrame)) return;
      this.animationFrame = window.requestAnimationFrame(() => {
        this.animationFrame = NaN;
        this.emit('scroll', undefined);
      });
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      this.parent = undefined;
      window.removeEventListener('scroll', onScroll);
      if (!isNaN(this.animationFrame)) {
        window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = NaN;
      }
    };
  }

  register(el: HTMLElement, sectionId: string) {
    this.registry.set(sectionId, el);
    this.resizeObserver.observe(el);
    return () => {
      this.registry.delete(sectionId);
      this.resizeObserver.unobserve(el);
    };
  }

  private handleScroll = (scroll: number) => {
    this.setScroll(scroll / this.articleWidth);
  };

  private handleResize() {
    if (!this.parent) return;
    const parentBoundary = this.parent.getBoundingClientRect();
    this.articleWidth = parentBoundary.width;
    this.setScroll(window.scrollY / this.articleWidth);
    this.emit('resize', parentBoundary);
    for (const sectionId of this.registry.keys()) {
      const el = this.registry.get(sectionId);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      this.sectionsScrollMap.set(sectionId, rect.top - parentBoundary.top);
    }
  };
}
