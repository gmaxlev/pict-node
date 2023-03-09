export interface PictCliOptions {
  // file: string;
  orderOfCombinations: number;
  // separatorForValues: string;
  // separatorForAliases: string;
  // negativeValuePrefix: string;
  random: boolean | number;
  caseSensitive: boolean;
  // statistics: boolean;
  fileWithSeedingRows: string;
}

export type PickCliOptions<Key extends keyof PictCliOptions> = Pick<
  PictCliOptions,
  Key
>;

export type Brand<Base, Bran> = Base & { __BRAND__: Bran } & {
  __WITNESS__: Base;
};
