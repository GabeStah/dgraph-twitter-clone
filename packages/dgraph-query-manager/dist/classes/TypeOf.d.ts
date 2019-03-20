export interface TypeOfInterface<T> {
    new (): T;
}
export declare function TypeOf<T>(type: TypeOfInterface<T>): T;
