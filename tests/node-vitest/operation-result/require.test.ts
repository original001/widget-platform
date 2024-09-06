import { describe, expect, test } from "vitest";

import operationResult = require("@skbkontur/operation-result");

const { createFailure, createSuccess, isFailure, isSuccess } = operationResult;
describe("require", () => {
    test("success should be isSuccess", async () => {
        const result = createSuccess(40);
        expect(isSuccess(result)).toBe(true);
    });

    test("success should be isSuccess", async () => {
        const result = createSuccess(40);
        expect(isFailure(result)).toBe(false);
    });
    test("success should be isSuccess", async () => {
        const result = createFailure(40);
        expect(isSuccess(result)).toBe(false);
    });
    test("success should be isSuccess", async () => {
        const result = createFailure(40);
        expect(isFailure(result)).toBe(true);
    });
});
