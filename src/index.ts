import { make } from "./define";
import { alias } from "./operators/alias";
import { negative } from "./operators/negative";
import { weight } from "./operators/weight";

async function and() {
  const time = performance.now();

  const result = await make(
    {
      model: [
        {
          name: "type",
          values: ["Single", "Span", "Stripe", "Mirror", "RAID-5"],
        },
        {
          name: "size",
          values: ["10", "100", "500", "1000", "5000", "10000", "40000"],
        },
        {
          name: "method",
          values: ["Quick", "Slow"],
        },
        {
          name: "system",
          values: ["FAT", "FAT32", "NTFS"],
        },
        {
          name: "cluster",
          values: [
            "512",
            "1024",
            "2048",
            "4096",
            "8192",
            "16384",
            "32768",
            "65536",
          ],
        },
        {
          name: "compression",
          values: ["on", "off"],
        },
      ],
      // seed: {
      //   type: [-1, "RAID-5"],
      //   system: ["FAT32"],
      // },
      // sub: [
      //   {
      //     keys: ["cluster", "size"],
      //     order: 2,
      //   },
      // ],
    } as const,
    {
      order: 2,
    }
  );

  // for (const item of result) {
  //   console.log(item.type);
  // }

  console.log(performance.now() - time);
}

and();
