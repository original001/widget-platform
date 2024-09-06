import { test } from "@playwright/test";

function getStoryPath(group: string, path: string): string {
  const searchParams = new URLSearchParams();
  searchParams.set("path", "/story/" + group + "--" + path);
  return `?${searchParams.toString()}`;
}

function requiredOption(fieldName: string): never {
  throw Error(`Option "${fieldName}" is required. Is should be defined.`);
}

type StorybookUrlFixture = {
  readonly storyGroup: string;
  readonly storyPath: string;
  readonly storybookUrl: URL;
};

export const storybookUrlFixture = test.extend<StorybookUrlFixture>({
  storyGroup: [() => requiredOption("storyGroup"), { option: true }],
  storyPath: [() => requiredOption("storyPath"), { option: true }],
  async storybookUrl({ baseURL, storyGroup, storyPath }, use) {
    const searchParamsQuery = getStoryPath(storyGroup, storyPath);
    await use(new URL(searchParamsQuery, baseURL));
  },
});
