# pict-node

This library is a wrapper around Microsoft's [PICT](https://github.com/microsoft/pict) (Pairwise Independent Combinatorial Testing) tool, designed to work with Node.js for generating combinations of inputs for software testing. PICT is a powerful tool that helps reduce the number of tests needed while still ensuring comprehensive coverage by generating optimized combinations of inputs.

Before using this library, it's helpful to read Microsoft's official [PICT documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md) to learn about the tool and how it works.

## Installation

```sh
npm install --save-dev pict-node
```

## Overview

Imagine you have a function for creating order that accepts 6 parameters with several possible values for each argument.

| Parameter      | Possible values                          |
| -------------- | ---------------------------------------- |
| Location       | Ukraine, Poland, Lithuania, Germany, USA |
| Customer       | Individuals, Companies, Partners         |
| Time           | 05:00, 11:99, 15:00, 21:30, 23:59        |
| Payment System | VISA, MasterCard, PayPal, WebMoney, Qiwi |
| Product        | 1732, 319, 872, 650                      |
| Discount       | true, false                              |

This model has many possible combinations, which means we could have thousands of test cases to write and test. However, it's not practical to test all of them manually and in a reasonable amount of time. Instead, we can generate and test all possible pairs of values to achieve a good level of coverage.

```js
import { pict } from "pict-node";

const model = [
  {
    key: "location",
    values: ["Ukraine", "Poland", "Lithuania", "Germany", "USA"],
  },
  {
    key: "customer",
    values: ["Individuals", "Companies", "Partners"],
  },
  {
    key: "time",
    values: ["05:00", "11:99", "15:00", "21:30", "23:59"],
  },
  {
    key: "paymentSystem",
    values: ["VISA", "MasterCard", "PayPal", "WebMoney", "Qiwi"],
  },
  {
    key: "product",
    values: [
      {
        id: 1732,
      },
      {
        id: 319,
      },
      {
        id: 872,
      },
      {
        id: 650,
      },
    ],
  },
  {
    key: "discount",
    values: [true, false],
  },
];

const cases = await pict({ model });

for (const testCase of cases) {
  const result = createOrder({
    location: testCase.location,
    customer: testCase.customer,
    time: testCase.time,
    paymentSystem: testCase.paymentSystem,
    product: testCase.product,
    discount: testCase.discount,
  });

  expect(result).toBe("The order is accepted");
}
```

PICT will generate the following test cases:

```js
[
  // ... ... ...
  {
    location: "Lithuania",
    customer: "Individuals",
    time: "23:59",
    paymentSystem: "Qiwi",
    product: { id: 650 },
    discount: true,
  },
  {
    location: "USA",
    customer: "Partners",
    time: "05:00",
    paymentSystem: "VISA",
    product: { id: 319 },
    discount: false,
  },
  // ... ... ...
  {
    location: "Ukraine",
    customer: "Companies",
    time: "23:59",
    paymentSystem: "MasterCard",
    product: { id: 1732 },
    discount: true,
  },
  // ... ... ...
];
```

## Generating Test Cases

In most cases, to generate test cases, you can use the `pict` function. The main features of this function is that you can use any data type for the values of the model.

```js
import { pict } from "pict-node";

// Define test model
const model = [
  {
    key: "country",
    value: ["Ukraine", "Poland", "USA"],
  },
  {
    key: "age",
    value: [10, 16, 18, 25, 70],
  },
  {
    key: "product",
    value: [{ id: 50 }, { id: 350 }],
  },
];

// Generate test cases
const cases = await pict({ model });

// Iterate test cases
for (const testCase of cases) {
  const { country, age, product } = testCase;

  // Call a function with the current test case
  const result = await makeOrder({
    country,
    age,
    product,
  });

  // Verify that the function returns the expected result
  expect(result).toBe("The order is accepted");
}
```

By default, `pict-node` generates a pair-wise test suite (all pairs covered), but the order can be set by option `order` to a value larger than two.

```js
const cases = await pict(
  {
    model,
  },
  {
    order: 3,
  }
);
```

## TypeScript

Here is an example of using this tool with TypeScript:

```ts
import { pict, alias, weight } from "pict-node";

const model = [
  {
    key: "amount",
    //                           ↓↓↓↓↓↓↓↓
    values: [1, alias([2, "two"] as const), 3],
  },
  {
    key: "fruit",
    //                       ↓↓↓↓↓↓↓↓
    values: [weight("Banana" as const, 10), "Orange", "Apple"],
  },
  // ↓↓↓↓↓
] as const;

const cases = await pict({ model });
```

The type of `cases` will be:

```ts
Array<{
  amount: 1 | 2 | "two" | 3;
  fruit: "Banana" | "Orange" | "Apple";
}>;
```

**⚠️ Note that we use `as const` to get a literal types!**

Without `as const` the type of `cases` will be:

```ts
Array<{
  amount: number | string;
  fruit: string;
}>;
```

## Constraints

> Read [PICT documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md#constraints) to get more information about constraints.

Constraints are only applicable when using the `strings` function, which only accepts `string` values and provides additional options:

- `aliasSeparator` - the separator used for aliases (default: `|`)
- `valueSeparator` - the separator used for values (default: `,`)
- `negativePrefix` - the prefix used for negative values (default: `~`)
- `caseSensitive` - [case sensitive](https://github.com/Microsoft/pict/blob/main/doc/pict.md#case-sensitiveness) (default: `false`)

> ⚠️ Be aware that the characters used for `aliasSeparator`, `valueSeparator`, and `negativePrefix` cannot be used in your values. If you must use them, you must replace them using the second argument (options).

```js
import { strings } from "pict-node";

const model = [
  {
    key: "type",
    values: ["Primary", "Logical", "Single"],
  },
  {
    key: "size",
    values: ["10", "100", "500", "1000", "5000", "10000", "40000"],
  },
  {
    key: "fileSystem",
    values: ["FAT", "FAT32", "NTFS"],
  },
];

const constraints = [
  'IF [fileSystem] = "FAT"   THEN [Size] <= 4096;',
  'IF [fileSystem] = "FAT32" THEN [Size] <= 32000;',
];

const cases = await strings(
  {
    model,
    constraints,
  },
  {
    caseSensitive: true,
  }
);
```

If you need to use values of different types, you can use the `pict` function instead of the `strings` function. This way, you can specify any type you want for the values of your model.

## Sub-Models

> Read [PICT documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md#sub-models) to get more information about sub-models.

Sub-models can be used with both the `pict` and `strings` API functions, and they are defined using the `sub` property.

```js
import { pict } from "pict-node";

const model = [
  {
    key: "platform",
    values: ["x86", "x64", "arm"],
  },
  {
    key: "ram",
    values: [1, 4, 64],
  },
  {
    key: "os",
    values: ["Win7", "Win8", "Win10"],
  },
  {
    key: "browser",
    values: ["Edge", "Opera", "Chrome", "Firefox"],
  },
];

const sub = [
  {
    keys: ["os", "browser"],
    order: 2, // optional
  },
];

const cases = await pict({
  model,
  sub,
});
```

## Seeding

> Read [PICT documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md#seeding) to get more information about seeding.

Seeding can be used with both the `pict` and `strings` API functions, and they are defined using the `seed` property.

```js
import { pict } from "pict-node";

const model = [
  {
    key: "platform",
    values: ["x86", "x64", "arm"],
  },
  {
    key: "ram",
    values: [1, 4, 64],
  },
  {
    key: "os",
    values: ["Win7", "Win8", "Win10"],
  },
  {
    key: "browser",
    values: ["Edge", "Opera", "Chrome", "Firefox"],
  },
];

const seed = {
  ram: [64],
  browser: ["Opera", "Firefox"],
};

const cases = await pict({
  model,
  seed,
});
```

## Aliasing

> Read [PICT documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md#aliasing) to get more information about aliasing.

There is a special function `alias` that can be used to create aliases for values. It can be used with both the `pict` and `strings` API functions.

```js
import { pict, alias } from "pict-node";

const model = [
  {
    key: "os",
    values: ["Win7", "Win8", alias(["Win10", "Windows10"])],
  },
  {
    key: "platform",
    values: ["x86", "x64", "arm"],
  },
  {
    key: "ram",
    values: [1, 4, 64],
  },
];

const cases = await pict({ model });
```

## Negative Testing

> Read [PICT documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md#negative-testing) to get more information about negative testing.

There is a special function `negative` that can be used to create a value for negative testing. It can be used with both the `pict` and `strings` API functions.

```js
import { pict, negative } from "pict-node";

const model = [
  {
    key: "A",
    values: [negative(-1), 0, 1, 2],
  },
  {
    key: "B",
    values: [negative(-1), 0, 1, 2],
  },
];

const cases = await pict({ model });
```

## Weighting

> Read [PICT documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md#weighting) to get more information about weighting.

There is a special function `weight` that can be used to create a value with weight. It can be used with both the `pict` and `strings` API functions.

```js
import { pict, weight } from "pict-node";

const model = [
  {
    key: "type",
    values: [weight("Primary", 5), "Logical", "Single", "Span"],
  },
  {
    key: "formatMethod",
    values: ["quick", "slow"],
  },
  {
    key: "fileSystem",
    values: ["FAT", "FAT32", weight("NTFS", 10)],
  },
];

const cases = await pict({ model });
```

## Randomization

> Read [PICT documentation](https://github.com/Microsoft/pict/blob/main/doc/pict.md#output-format) to get more information about randomization.

If the model does not change, running it repeatedly will result in the same output. To introduce randomness, you can use the `random` option.

It applies to `pict`, `strings` and `native` API.

```js
import { pict, negative } from "pict-node";

const model = [
  // ...
];

const cases = await pict(
  { model },
  {
    random: true,
    // random: 19285 - or using with seed
  }
);
```

## Native PICT Models

You can use native PICT models with `native` API function.

`native` accepts the following options (optional):

- `order` - order of combinations (default: 2)
- `random` - [randomization](https://github.com/Microsoft/pict/blob/main/doc/pict.md#output-format)
- `aliasSeparator` - the separator used for aliases (default: `|`)
- `valueSeparator` - the separator used for values (default: `,`)
- `negativePrefix` - the prefix used for negative values (default: `~`)
- `caseSensitive` - [case sensitive](https://github.com/Microsoft/pict/blob/main/doc/pict.md#case-sensitiveness) (default: `false`)

A model can be a file:

```js
import { native } from "pict-node";

const cases = await native({
  model: {
    file: "path/to/file",
    seed: "path/to/seed/file", // optional,
    options: {
      caseSensitive: true,
    },
  },
});
```

A model and a seed can be a string:

```js
import { native } from "pict-node";

const cases = native({
  model: `
  PLATFORM:  x86, x64, arm
  RAM:       1GB, 4GB, 64GB
  OS:        Win7, Win8, Win10
  Browser:   Edge, Opera, Chrome, Firefox
  `,
});
```
