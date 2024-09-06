import { createFailure, createSuccess, getValueOrThrow } from "@skbkontur/operation-result";
import { describe, expect, test } from "vitest";

describe("getOrThrow", () => {
    test("should throw", () => {
        const provider = () => getValueOrThrow(createFailure(20));

        expect(provider).toThrow();
    });

    test("should pass", () => {
        const expectedValue = 30;

        const result = getValueOrThrow(createSuccess(expectedValue));

        expect(result).toBe(expectedValue);
    });
});
