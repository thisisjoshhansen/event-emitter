import { Callback } from "./callback";

export type OnMethod<T extends Record<PropertyKey, Parameters<any>>, K extends PropertyKey = keyof T> = <E extends K>(event: E, callback: Callback<T[E]>) => () => void;
export type OffMethod<T extends Record<PropertyKey, Parameters<any>>, K extends PropertyKey = keyof T> = <E extends K>(event: E, callback: Callback<any>) => Listener<T>;
export type Listener<T extends Record<PropertyKey, Parameters<any>>, K extends PropertyKey = keyof T> = {
  on: OnMethod<T, K>,
  off: OffMethod<T, K>,
};
export type EmitMethod<T extends Record<PropertyKey, Parameters<any>>, K extends PropertyKey = keyof T> = <E extends K>(event: E, ...data: T[E]) => void;

export function createEmitterListener<T extends Record<PropertyKey, Parameters<any>>, K extends PropertyKey = keyof T>() {
  const events: Partial<Record<K, Callback<T[K]>[]>> = {};

  const listener: Listener<T,K> = {
    
    on: <E extends K>(event:E, callback:Callback<T[E]>) => {
      if (!events[event]) {
        events[event] = [];
      }
      // @ts-ignore
      events[event].push(callback);
      return () => {
        listener.off(event, callback);
      };
    },

    off: <E extends K>(event:E, callback:Callback<any>) => {
      events[event] = (events[event] ?? []).filter(cb => cb !== callback);
      return listener;
    },
  }

  const emit = <E extends K>(event:E, ...data:T[E]) => {
    const listeners = events[event] ?? [];
    for (const listener of listeners) {
      listener.apply(null, data);
    }
    return emit;
  }

  return { listener, emit };
}
