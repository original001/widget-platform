import { createFailure, createSuccess, tryExecute } from "@skbkontur/operation-result";
import { describe, expect, test } from "vitest";

describe("tryExecute", () => {
    test("should catch", async () => {
        const expectedError = 50;

        const result = await tryExecute(async () => {
            throw expectedError;
        });

        expect(result).toEqual(createFailure(expectedError));
    });

    test("should pass", async () => {
        const expectedValue = 40;

        const result = await tryExecute(async () => expectedValue);

        expect(result).toEqual(createSuccess(expectedValue));
    });
});
