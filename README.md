# ts-array-sort
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/sullyTheDev/ts-array-sort/npm-publish.yml?branch=main&style=flat-square)](https://github.com/sullyTheDev/ts-array-sort/actions)
[![Coverage Status](https://coveralls.io/repos/github/sullyTheDev/ts-array-sort/badge.svg?branch=refs/tags/v1.0.9)](https://coveralls.io/github/sullyTheDev/ts-array-sort?branch=refs/tags/v1.0.9)
[![npm](https://img.shields.io/npm/v/ts-array-sort?style=flat-square)](https://www.npmjs.com/package/ts-array-sort)
[![NPM License](https://img.shields.io/npm/l/ts-array-sort?style=flat-square)](https://opensource.org/licenses/ISC)
[![npm bundle size](https://img.shields.io/bundlephobia/min/ts-array-sort?style=flat-square)](https://bundlephobia.com/result?p=ts-array-sort) 

ts-array-sort is a simple utility to assist in sorting arrays for Typescript/Javascript. It supports sorting of numbers, strings, and objects out of the box and is very flexible when it comes to sorting objects with multiple or nested properties.

- **number** and **string** sorting made easy
- **nested object property** sorting is supported.
- **multiple object property** sorting in a single, readable statement.
- **No** run-time dependencies
- **~3kb** in size

## Usage
---
Install the package from npm
```
npm i ts-array-sort
```

Import the `ArraySorter` and `SortOrder` module members.
```ts
import { ArraySorter, SortOrder } from 'ts-array-sorter';
```
Build the sort function and pass it into `Array.sort()`
```ts
import { ArraySorter, SortOrder } from 'ts-array-sorter';
// ...

// Inline example using config object
console.log([3,5,7,1].sort(new ArraySorter({sortOrder: SortOrder.desc}).sort()))
// outputs [7,5,3,1]
```

## API
---
### constructor
```ts
const sorter = new ArraySorter();
```
or you can pass in an optional config object
```ts
const sorter = new ArraySorter({sortOrder: SortOrder.desc, properties: ['myProp1', 'myProp2']})
```
### Methods
---
#### **sortOrder**
Method that changes the sort order used by the built sort function.
the sort order defaults to ascending, meaning you should only ever have to use this function to change to descending or back from descending.
- @param `sortOrder: SortOrder`
- @returns `ArraySorter` (this)
```ts
new ArraySorter().sortOrder(SortOrder.desc);
```
---
#### **sortBy**
Method that adds a property to be sorted on. This function should only need to be called when sorting objects.  
*Note: Any calls to this function when sorting string or number arrays will be ignored.*  

- @param `property: PropertyKey`
- @returns `ArraySorter` (this)

```ts
// basic usage
new ArraySorter().sortBy('myProperty');
```

When sorting objects and no properties are provided or properties that do not exist on the objects are provided, an error will be thrown with a corresponding error message.  

You can specify a *n* amount of properties as long as they exist on every object in the array. If you specify more then 1 property to sort on, **the sort is applied in the order in which you add them**.

Additionally, ts-array-sort supports sorting on properties that are contained within nested data structures. To do this, seperate the object properties with a `.` as you would normally do with dot notation in JS, just in string form.
```ts
// nested property example
new ArraySorter().sortBy('nestedProp.id');
// adds an entry to sort on that looks like {nestedProp: {id: 1}}

// double nested
new ArraySorter().sortBy('user.name.firstName');
// adds an entry to sort on that looks like
// {user: {name: {firstName: 'Chris'}}}
```
---
#### **sort**
Method which provides the sort function that takes into account all the previously selected config options (i.e. sort order, properties). Pass this function into the built in `Array.propotype.sort()` method and it will sort the array based on the previously entered configuration.
- @returns `(a: T, b: T) => number`

```ts
// example usage
const sorter = new ArraySorter().sortOrder(SortOrder.desc).sort();
myArray.sort(sorter);
```
