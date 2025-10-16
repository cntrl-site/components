export type Listener<P> = (payload: P) => void;
type Listeners<EventMap> = {
  [E in keyof (EventMap)]?: Listener<EventMap[E]>[];
};

export abstract class EventEmitter<EventMap> {
  protected listeners: Listeners<EventMap> = {};

  on<E extends (keyof EventMap)>(
    event: E,
    listener: Listener<EventMap[E]>
  ): () => void {
    if (!Array.isArray(this.listeners[event])) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(listener);
    return () => {
      this.off(event, listener);
    };
  }

  off<E extends (keyof EventMap)>(
    event: E,
    listener: Listener<EventMap[E]>
  ): void {
    const filtered = this.listeners[event]?.filter(l => l !== listener);
    this.listeners[event] = filtered && filtered.length > 0 ? filtered : undefined;
  }

  protected emit<E extends (keyof EventMap)>(event: E, payload: EventMap[E]): void {
    const listeners = this.listeners[event];
    if (!Array.isArray(listeners)) return;
    for (const listener of listeners) {
      try {
        listener(payload);
      } catch (error) {
        console.error(error instanceof Error ? error.stack : error);
      }
    }
  }
}
