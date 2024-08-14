import { Callback } from "./callback";

export class EventEmitter<T extends Record<PropertyKey, Parameters<any>>, K extends PropertyKey = keyof T> {
  private events: Partial<Record<K, Callback<T[K]>[]>> = {};

  on<E extends K>(event:E, callback:Callback<T[E]>) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    // @ts-ignore
    this.events[event].push(callback);
    return () => {
      this.off(event, callback);
    };
  }

  off<E extends K>(event:E, callback:Callback<any>) {
    this.events[event] = (this.events[event] ?? []).filter(cb => cb !== callback);
    return this;
  }

  emit<E extends K>(event:E, ...data:T[E]) {
    const listeners = this.events[event] ?? [];
    for (const listener of listeners) {
      listener.apply(null, data);
    }
    return this;
  }
}
