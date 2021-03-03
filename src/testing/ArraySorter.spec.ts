import { ArraySorter, SortOrder } from '../index';

describe('ArraySorter', () => {
  describe('when initializing', () => {
    it('should default the sort order to asc', () => {
      const sorter = new ArraySorter();
      expect(sorter['_sortOrder']).toEqual(SortOrder.asc);
    });
    it('should take parameters in via a config object', () => {
      const config = { sortOrder: SortOrder.desc, properties: ['test', 'keys'] };
      const sorter = new ArraySorter(config);

      expect(sorter['_sortOrder']).toEqual(config.sortOrder);
      expect(sorter['_properties']).toEqual(
        new Map<number, Set<PropertyKey>>([[0, new Set(config.properties)]]),
      );
    });
  });

  describe('when using builder pattern to build sort options', () => {
    let sorter: ArraySorter<unknown>;
    beforeEach(() => {
      sorter = new ArraySorter();
    });

    it('should save the sortOrder option passed into the sortOrder() builder method', () => {
      expect(sorter['_sortOrder']).toEqual(SortOrder.asc);
      sorter.sortOrder(SortOrder.desc);
      expect(sorter['_sortOrder']).toEqual(SortOrder.desc);
    });

    it('should save the properties passed into the sortBy() builder method', () => {
      const propName = 'testProp';
      const additionalPropName = 'anotherProp';
      // no properties to begin with
      expect(sorter['_properties'].get(0)).toBeFalsy();
      // add a property name
      sorter.sortBy(propName);
      // expect property to be in the first level map object
      expect(sorter['_properties'].get(0)).toBeTruthy();
      expect(sorter['_properties'].get(0)?.has(propName)).toBeTruthy();
      // add an additional property name
      sorter.sortBy(additionalPropName);
      // expect both properties to exist
      expect(sorter['_properties'].get(0)).toBeTruthy();
      expect(sorter['_properties'].get(0)?.has(propName)).toBeTruthy();
      expect(sorter['_properties'].get(0)?.has(additionalPropName)).toBeTruthy();
    });

    describe('when passing in nested properties via config/builder methods', () => {
      it('should build a property map with the key being the level the properties are on and the value being the list of properties', () => {
        const nestedProp = 'test.prop';
        // config pattern
        const config = { sortOrder: SortOrder.desc, properties: [nestedProp] };
        const configSorter = new ArraySorter(config);
        nestedProp.split('.').forEach((x, i) => {
          // expect map to contain a key for each level a property exists on
          expect(configSorter['_properties'].has(i)).toBeTruthy();
          // expect prop names to be in their respective sets
          expect(configSorter['_properties'].get(i)?.has(x));
        });
        // builder method pattern
        const builtSorter = new ArraySorter().sortBy(nestedProp);
        nestedProp.split('.').forEach((x, i) => {
          // expect map to contain a key for each level a property exists on
          expect(builtSorter['_properties'].has(i)).toBeTruthy();
          // expect prop names to be in their respective sets
          expect(builtSorter['_properties'].get(i)?.has(x));
        });
      });
    });
  });
  describe('when sorting numbers', () => {
    let testArray: number[];
    beforeEach(() => {
      testArray = [7, 67, 120, 1, 0, 40, 42];
    });
    it('should sort by asc', () => {
      const sorter = new ArraySorter<number>().sort();
      expect(testArray.sort(sorter)).toEqual([0, 1, 7, 40, 42, 67, 120]);
    });

    it('should sort by desc', () => {
      const sorter = new ArraySorter<number>().sortOrder(SortOrder.desc).sort();
      expect(testArray.sort(sorter)).toEqual([120, 67, 42, 40, 7, 1, 0]);
    });
  });

  describe('when sorting strings', () => {
    let testArray: string[];
    beforeEach(() => {
      testArray = ['alpha 2', 'bravo', 'alpha', 'charlie', 'zulu', 'delta'];
    });
    it('should sort by asc', () => {
      const sorter = new ArraySorter().sort();
      expect(testArray.sort(sorter)).toEqual(['alpha', 'alpha 2', 'bravo', 'charlie', 'delta', 'zulu']);
    });

    it('should sort by desc', () => {
      const sorter = new ArraySorter({ sortOrder: SortOrder.desc }).sort();
      expect(testArray.sort(sorter)).toEqual(['zulu', 'delta', 'charlie', 'bravo', 'alpha 2', 'alpha']);
    });

    it('should be case insensative when sorting', () => {
      testArray = ['alpha 2', 'Bravo', 'Alpha', 'charlie', 'Zulu', 'delta'];
      const sorter = new ArraySorter().sort();
      expect(testArray.sort(sorter)).toEqual(['Alpha', 'alpha 2', 'Bravo', 'charlie', 'delta', 'Zulu']);
    });
  });

  describe('when sorting objects', () => {
    let testArray: { id: number; nested: { name: string } }[];
    beforeEach(() => {
      testArray = [
        { id: 1, nested: { name: 'alpha' } },
        { id: 10, nested: { name: 'Bravo' } },
        { id: 5, nested: { name: 'Foxtrot' } },
        { id: 3, nested: { name: 'delta' } },
        { id: 20, nested: { name: 'alpha' } },
      ];
    });
    it('should throw an error if no properties were passed in', () => {
      const sorter = new ArraySorter().sort();
      expect(() => testArray.sort(sorter)).toThrow();
    });

    it("should throw an error if a property which doesn't exist is passed in", () => {
      const sorter = new ArraySorter().sortBy('name').sort();
      expect(() => testArray.sort(sorter)).toThrow();
    });

    it('should sort by asc', () => {
      const sorter = new ArraySorter<{ id: number; nested: { name: string } }>().sortBy('id').sort();
      expect(testArray.sort(sorter)).toEqual([
        { id: 1, nested: { name: 'alpha' } },
        { id: 3, nested: { name: 'delta' } },
        { id: 5, nested: { name: 'Foxtrot' } },
        { id: 10, nested: { name: 'Bravo' } },
        { id: 20, nested: { name: 'alpha' } },
      ]);
    });

    it('should sort by desc', () => {
      const sorter = new ArraySorter<{ id: number; nested: { name: string } }>()
        .sortOrder(SortOrder.desc)
        .sortBy('id')
        .sort();
      expect(testArray.sort(sorter)).toEqual([
        { id: 20, nested: { name: 'alpha' } },
        { id: 10, nested: { name: 'Bravo' } },
        { id: 5, nested: { name: 'Foxtrot' } },
        { id: 3, nested: { name: 'delta' } },
        { id: 1, nested: { name: 'alpha' } },
      ]);
    });

    it('should sort based on nested properties', () => {
      const sorter = new ArraySorter<{ id: number; nested: { name: string } }>()
        .sortOrder(SortOrder.asc)
        .sortBy('nested.name')
        .sort();
      expect(testArray.sort(sorter)).toEqual([
        { id: 1, nested: { name: 'alpha' } },
        { id: 20, nested: { name: 'alpha' } },
        { id: 10, nested: { name: 'Bravo' } },
        { id: 3, nested: { name: 'delta' } },
        { id: 5, nested: { name: 'Foxtrot' } },
      ]);
    });

    it('should sort on multiple properties in the order they were passed in.', () => {
      const sorter = new ArraySorter<{ id: number; nested: { name: string } }>()
        .sortOrder(SortOrder.desc)
        .sortBy('nested.name')
        .sortBy('id')
        .sort();
      expect(testArray.sort(sorter)).toEqual([
        { id: 5, nested: { name: 'Foxtrot' } },
        { id: 3, nested: { name: 'delta' } },
        { id: 10, nested: { name: 'Bravo' } },
        { id: 20, nested: { name: 'alpha' } },
        { id: 1, nested: { name: 'alpha' } },
      ]);
    });
  });

  it('should throw an error when an unsupported type is passed in', () => {
    const testArray = [undefined, null, null];
    expect(() => testArray.sort(new ArraySorter().sort())).toThrow();
  });
});
