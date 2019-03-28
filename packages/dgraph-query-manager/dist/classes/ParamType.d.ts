export interface ParamTypeInterface<T> {
  isSubstitution: boolean;
  key: string;
  type: any;
}
export declare class ParamType<T> implements ParamTypeInterface<T> {
  isSubstitution: boolean;
  key: string;
  type: any;
  constructor(name: string, type: T, isSubstitution?: boolean);
}
