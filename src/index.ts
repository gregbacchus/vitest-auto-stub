import { type Mock, vi } from 'vitest';

// RecursivePartial definition based on https://stackoverflow.com/a/51365037
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<RecursivePartial<U>>
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P];
};

export function stub<T extends {}>(base: RecursivePartial<T> = {}): T {
  const store = new Map();
  return new Proxy(base, {
    get(target, prop) {
      // biome-ignore lint/suspicious/noExplicitAny: This is a type that is meant to be used as a placeholder
      if (prop in target) return (target as any)[prop];
      if (prop === 'then') return undefined;
      if (!store.has(prop)) store.set(prop, vi.fn());
      return store.get(prop);
    },
    has(target, prop) {
      if (prop in target) return true;
      if (prop === 'then') return false;
      return true;
    },
  }) as T;
}

// biome-ignore lint/suspicious/noExplicitAny: This is a type that is meant to be used as a placeholder
type Fn = (...args: any[]) => any;
type StubValue<T> = T extends Fn ? Mock : T;

export type Stub<T> = {
  [P in keyof T]: StubValue<T[P]>;
};

export function reveal<T extends {}>(original: T): Stub<T> {
  return original as Stub<T>;
}
