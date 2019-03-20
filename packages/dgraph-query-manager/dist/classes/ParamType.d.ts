export interface ParamTypeInterface<T> {
    key: string;
    type: any;
}
export declare class ParamType<T> implements ParamTypeInterface<T> {
    key: string;
    type: any;
    constructor(name: string, type: T);
}
