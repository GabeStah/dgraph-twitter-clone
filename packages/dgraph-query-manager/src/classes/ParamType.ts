export interface ParamTypeInterface<T> {
  key: string;
  type: any;
}

export class ParamType<T> implements ParamTypeInterface<T> {
  key: string;
  type: any;

  constructor(name: string, type: T) {
    this.key = name;
    this.type = type;
  }
}
