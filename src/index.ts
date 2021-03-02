export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

type PrimitiveOrObject = 'object' | 'string' | 'number';

export class ArraySorter<T> {
  // sort instance fn that calls the private sort() method.
  // defined like this for conviently placing into array.sort()
  public sort = () => (a: T, b: T) => this.internalSort(a, b);
  private _sortOrder: SortOrder = SortOrder.asc;
  private _properties: Map<number, Set<PropertyKey>> = new Map();

  constructor(config?: { sortOrder: SortOrder; properties: PropertyKey[] }) {
    if (config) {
      if (this.objectHasProperty(config, 'sortOrder')) {
        this.sortOrder(config.sortOrder);
      }
      if (this.objectHasProperty(config, 'properties')) {
        config.properties.forEach((prop) => this.sortBy(prop));
      }
    }
  }
  // type safety functions
  private objectHasProperty<Z extends {}, Y extends PropertyKey>(obj: Z, prop: Y): obj is Z & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
  }

  private typeGuard<Z>(o: unknown, className: PrimitiveOrObject): o is Z {
    return typeof o === className;
  }

  private isString(o: unknown): o is string {
    return this.typeGuard<string>(o, 'string');
  }

  private isObject(o: unknown): o is {} {
    return this.typeGuard<object>(o, 'object');
  }
  private isNumber(o: unknown): o is number {
    return this.typeGuard<number>(0, 'number');
  }
  // end of type safety functions

  // sort strings logic
  private sortStrings(a: string, b: string) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (this._sortOrder === SortOrder.asc) {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    return b < a ? -1 : b > a ? 1 : 0;
  }
  // sort numbers logic
  private sortNumbers(a: number, b: number) {
    if (this._sortOrder === SortOrder.asc) {
      return a - b;
    }
    return b - a;
  }
  // sort complex objects recursively logic
  private sortObjects(a: any, b: any, lvlsDeep: number) {
    // ensure properties were specified
    if (!this._properties.size) {
      throw new Error('In order to sort objects you need to specify the property or properties you wish to sort by.');
    }
    const propsArray = Array.from(this._properties.get(lvlsDeep) as Set<PropertyKey>);
    // ensure properties exist on the object at a given level
    const hasRequiredProps = propsArray.every(
      (prop) => this.objectHasProperty(a, prop) && this.objectHasProperty(b, prop),
    );

    if (!hasRequiredProps) {
      throw new Error('Objects must have the properties specified to sort on them.');
    }

    const values = propsArray
      .map((propToSort) => this.internalSort(a[propToSort], b[propToSort], ++lvlsDeep))
      .filter((val) => val);
    return values[0];
  }
  // private sort method used internally
  private internalSort(a: any, b: any, lvlsDeep = 0): any {
    if (this.isString(a) && this.isString(b)) {
      return this.sortStrings(a, b);
    } else if (this.isObject(a) && this.isObject(b)) {
      return this.sortObjects(a, b, lvlsDeep);
    } else if (this.isNumber(a) && this.isNumber(b)) {
      return this.sortNumbers(a, b);
    }
  }
  // can call this function to choose sort direction
  sortOrder(order: SortOrder): ArraySorter<T> {
    this._sortOrder = order;
    return this;
  }
  // use this function to declare n number of properties to sort on
  sortBy(property: PropertyKey): ArraySorter<T> {
    const stringProp = property.toString();
    const propsTree = stringProp.split('.');
    propsTree.forEach((prop, i) => {
      this._properties.set(
        i,
        this._properties.get(i) ? (this._properties.get(i) as Set<PropertyKey>).add(prop) : new Set([prop]),
      );
    });
    return this;
  }
}
