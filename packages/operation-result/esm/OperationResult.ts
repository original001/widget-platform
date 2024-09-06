export type OperationFailed<TFault> = {
    readonly success: false;
    readonly fault: TFault;
};

export type OperationSuccess<TValue> = {
    readonly success: true;
    readonly value: TValue;
};

export type OperationResult<TFault, TValue> = OperationFailed<TFault> | OperationSuccess<TValue>;
