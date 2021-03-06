/**
 * Enum for sort order values.
 * @readonly
 * @enum {'asc' | 'desc'}
 */
export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

type PrimitiveOrObject = 'object' | 'string' | 'number';

export class ArraySorter<T> {
  private _sortOrder: SortOrder = SortOrder.asc;
  private _properties: Map<number, Set<PropertyKey>> = new Map();
  /**@template T
   * @description Constructs a new ArraySorter<T>
   * @param {{sortOrder?: SortOrder, properties?: PropertyKey[]}} [config] an object with optional properties used to build the sort function
   * @constructor
   */
  constructor(config?: { sortOrder?: SortOrder; properties?: PropertyKey[] }) {
    if (config) {
      if (this.objectHasProperty(config, 'sortOrder') && config.sortOrder) {
        this.sortOrder(config.sortOrder);
      }
      if (this.objectHasProperty(config, 'properties') && config.properties && config.properties?.length > 0) {
        config.properties?.forEach((prop) => this.sortBy(prop));
      }
    }
  }
  // type safety functions
  private objectHasProperty<Z extends Record<string, unknown>, Y extends PropertyKey>(
    obj: Z,
    prop: Y,
  ): obj is Z & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
  }

  private typeGuard<Z>(o: unknown, className: PrimitiveOrObject): o is Z {
    return typeof o === className && o !== undefined && o !== null;
  }

  private isString(o: unknown): o is string {
    return this.typeGuard<string>(o, 'string');
  }

  private isObject(o: unknown): o is Record<string, unknown> {
    return this.typeGuard<Record<string, unknown>>(o, 'object');
  }
  private isNumber(o: unknown): o is number {
    return this.typeGuard<number>(o, 'number');
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
  private sortObjects(a: Record<PropertyKey, unknown>, b: Record<PropertyKey, unknown>, lvlsDeep: number) {
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
      .map((propToSort) => this.internalSort(a[propToSort as string], b[propToSort as string], ++lvlsDeep))
      .filter((val) => val);
    return values[0];
  }
  // private sort method used internally
  private internalSort(a: unknown, b: unknown, lvlsDeep = 0): number {
    if (this.isString(a) && this.isString(b)) {
      return this.sortStrings(a, b);
    } else if (this.isObject(a) && this.isObject(b)) {
      return this.sortObjects(a, b, lvlsDeep);
    } else if (this.isNumber(a) && this.isNumber(b)) {
      return this.sortNumbers(a, b);
    }
    throw new Error('variable type is not supported, converting to a string may work.');
  }
  /**
   * @description A method to update the sort order that the resulting sort function uses. Sort order is ascending by default.
   * @param {SortOrder} order An enum value used to determine the order in which items are sorted
   * @returns {ArraySorter<T>} The instance of the ArraySorter that the method was called on.
   * @example new ArraySorter().sortOrder(SortOrder.desc)
   */
  sortOrder(order: SortOrder): ArraySorter<T> {
    this._sortOrder = order;
    return this;
  }
  /**
   * @description A method to add the properities the resulting sort function uses. Properties are only required when sorting objects.
   * @param {PropertyKey} property a PropertyKey that exists on the objects that are to be sorted
   * @returns {ArraySorter<T>} The instance of the ArraySorter that the method was called on.
   * @example new ArraySorter().sortBy('myPropertyKey')
   */
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
  /**
   * @description A method to add the properities the resulting sort function uses. Properties are only required when sorting objects.
   * @returns {(a: T, b: T) => number} The sort function to be used within the Array.sort() method.
   * @example <caption>Inline Example</caption>
   * // create the sorter function and pass it in all in one line
   * myArray.sort(new ArraySorter().sort())
   * @example <caption>Multi-Line Example</caption>
   *  // create the sorter function
   *  const sorter = new ArraySorter()
   *    .sortOrder(SortOrder.desc)
   *    .sort();
   *  // usage
   *  myArray.sort(sorter)
   */
  sort() {
    return (a: T, b: T): number => this.internalSort(a, b);
  }
}
