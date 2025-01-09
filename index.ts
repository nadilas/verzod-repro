import {
  createVersionedEntity,
  defineVersion,
  entityReference,
  InferredEntity,
} from "verzod";
import { z } from "zod";
import { zerialize } from "zodex";

const getVersionFn = (data: unknown) => {
  return typeof data === "object" &&
    data !== null &&
    "v" in data &&
    typeof data["v"] === "number"
    ? data["v"]
    : null;
};

const b_v1 = z.object({
  v: z.literal(1),
  id: z.string(),
});

const b = createVersionedEntity({
  latestVersion: 1,
  versionMap: {
    1: defineVersion({
      initial: true,
      schema: b_v1,
    }),
  },
  getVersion: getVersionFn,
});

const LazyUnion = z.lazy(() => {
  return z.union([entityReference(template), entityReference(b)]);
});

type LazyUnion = z.infer<typeof LazyUnion>;

interface template_base {
  id: string;
}

type template_v1 = template_base & {
  v: 1;
  date: Date;
  objects: Array<LazyUnion>;
};

const template_v1: z.ZodType<template_v1> = z.object({
  v: z.literal(1),
  id: z.string(),
  date: z.date(),
  objects: z.array(LazyUnion),
});

const template = createVersionedEntity({
  latestVersion: 1,
  versionMap: {
    1: defineVersion({
      initial: true,
      schema: template_v1,
    }),
  },
  getVersion: getVersionFn,
});

type template = InferredEntity<typeof template>;

const versioned_request_v1 = z.object({
  v: z.literal(1),
  id: z.string(),
  date: z.date(),
  template: entityReference(template),
});

const versioned_request = createVersionedEntity({
  latestVersion: 1,
  versionMap: {
    1: defineVersion({
      initial: true,
      schema: versioned_request_v1,
    }),
  },
  getVersion: getVersionFn,
});

type versioned_request = InferredEntity<typeof versioned_request>;

const v = {
  v: 1,
  id: "1",
  date: new Date(),
  template: {
    v: 1,
    id: "1",
    date: new Date(),
    objects: [
      {
        v: 1,
        id: "1",
      },
      {
        v: 1,
        id: "2",
        date: new Date(),
        objects: [
          {
            v: 1,
            id: "3",
            objects: [],
          },
          {
            v: 1,
            id: "5",
          },
        ],
      },
    ],
  },
};

console.log("type ends up as any?");
console.log(zerialize(entityReference(versioned_request)));

const parsed = versioned_request.safeParse(v);
console.log("parsed?");
console.log(parsed);
console.log(JSON.stringify(parsed, null, 2));
