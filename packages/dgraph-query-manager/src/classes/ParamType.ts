export interface ParamTypeInterface<T> {
  isSubstitution: boolean;
  key: string;
  type: any;
}

export class ParamType<T> implements ParamTypeInterface<T> {
  isSubstitution = false;
  key: string;
  type: any;

  constructor(name: string, type: T, isSubstitution = false) {
    this.isSubstitution = isSubstitution;
    this.key = name;
    this.type = type;
  }
}
