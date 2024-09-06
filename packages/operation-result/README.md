# Библиотека для возврата ошибок в типизированном виде.

Эта библиотека имеет target: ES2021. Она работает в Node16. Транспилировать библиотеку под необходимое окружение в браузере - ответственность потребителя. CRA и Vite транспилируют автоматически.

## Установка
`npm install @skbkontur/operation-result`

## Тип

Содержит типы: `OperationResult<TFault, TValue>`, `OperationFailed<TFault>` и `OperationSuccess<TValue>`.

## Функции-утилиты для OperationResult

1. `createFailure`, `createSuccess`;
2. `isSuccess`, `isFailure`;
3. `ensureSuccess`, `getValueOrThrow`;
4. `tryExecute` - принимает асинхронную функцию и возвращает `Promise<OperationResult<unknown, TResult>>`.
