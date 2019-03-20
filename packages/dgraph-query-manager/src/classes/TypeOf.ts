export interface TypeOfInterface<T> {
  new (): T;
}

export function TypeOf<T>(type: TypeOfInterface<T>): T {
  return new type();
}
