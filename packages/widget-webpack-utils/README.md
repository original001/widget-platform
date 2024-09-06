# Библиотека для настройки `webpack` для сборки виджета

## Установка
`npm install @skbkontur/widget-webpack-utils`

##

Результатом работы `webpack` при сборке виджета должен быть бандл, в точке входа которого есть строка `export createWidgetApi`. Т.е. чанк должен быть ES-модулем с экспортом функции с именем `createWidgetApi`.
По-умолчанию `webpack` не умеет собирать ES-модули. Чтобы его научить можно использовать два варианта:

1. Включить экспериментальный режим в конфиге `webpack`:

```json5
{
    output: {
        filename: "[name].js",
        module: true,
        library: {
            type: "module",
        },
    },
    experiments: {
        outputModule: true,
    },
}
```

Больше информации: https://webpack.js.org/configuration/output/#outputmodule

2. Использовать `webpack` плагин для `exportLibraryAsEsm` из `loader-builder`:

```typescript
import { exportLibraryAsEsm } from "loader-builder";

const libraryName = "___EXPORT_BANNER_PLACEHOLDER___";

export default {
    ...otherWebpackConfig,
    output: {
        filename: "[name].js",
        scriptType: "module",
        library: {
            name: libraryName,
            type: "var",
        },
    },
    plugins: [exportLibraryAsEsm({ libraryName })],
};
```

Предварительно необходимо настроить экспорт библиотеки типа `var`.

## Работа с `externals`

Есть два подхода к использованию `externals`-зависимостей сборщика (например, `react` или `react-dom`), полученных от `npm-loader` или `js-loader` с помощью объекта `dependencies`:

-   Сохранение в глобальную переменную;
-   Доступ через замыкание.

Примеры всех способов есть в тестах `loader-builder`.

### Сохранение externals в глобальную переменную

Сохранять `externals` можно либо в `window`, либо в глобальную переменную специальных модулей.

При использовании `webpack` с помощью магического комментария способ реализуем без создания дополнительных чанков. `Vite` и `rollup` магические комментарии не поддерживают и сделают дополнительные чанки, а это может быть минусом использования данного способа для этих бандлеров.

#### Сохранение `externals` в `window`:

1. В `createWidgetApi` первым действием из первого параметра получаем зависимости и сохраняем их в `window`, если их там еще нет.
2. Остальной код виджета получаем с помощью динамического импорта: `await import(/* webpackMode: "eager" */  "./App.js")`. Магический комментарий сообщает `webpack`, что не нужно создавать отдельный чанк. Без комментария код приложения будет в отдельном чанке. Динамический импорт вне зависимости от наличия комментария гарантирует, что код `App.js` и всех его зависимостей (т.е. всего остального приложения) не будет выполнен до установки `externals` в `window`.
3. В конфиге `webpack` прописываем `externals`.

Плюсы:

1. Самый простой.

Минус способа:

1. Засоряется `window`.
2. Инициализация модулей виджета не изолирована. Могут быть проблемы если виджет отрисовывается в другом виджете и напрямую в приложении-потребителе.

Для `iframe` минусы не актуальны, а плюс простоты остается.

#### Сохранение `externals` в глобальную переменную специальных модулей

1. Создаем пустой модуль (`js`-файл) с единственным содержимым: top-level переменной объектного типа `dependencies`.
2. В `createWidgetApi` первым параметром получаем зависимости и сохраняем их в переменную созданного модуля, если их там еще нет.
3. Остальной код виджета получаем с помощью динамического импорта: `await import(/* webpackMode: "eager" */ "./App.js")`.
4. Для каждой `external`-зависимости создаем специальный модуль (`js`-файл) в котором импортируем глобальную переменную первого модуля и рееэкспортируем его часть в формате `commonjs`: `module.exports = require("./dependencies.js").react`. Необходимо использовать `CommonJS`, так как синтаксис ES-модулей не позволяет экспортировать объект как `namespace`.
5. В конфиге `webpack` настраиваем алиасы модулей для каждой `external`-зависимости на ранее созданные модули (`js`-файлы).

Плюсы:

1. Не засоряет `window`.

Минус способа:

1. Требуется создавать `js`-файл для каждого модуля вручную или генерировать виртуальные модули.
2. Инициализация модулей виджета не изолирована. Могут быть проблемы если виджет отрисовывается в другом виджете, а также напрямую в приложении-потребителе.

### Работа с помощью замыкания:

Используем функцию `provideExternalDependenciesViaClosure` из `loader-builder`, которая оборачивает первый чанк бандла в функцию, в которой доступны `externals` как через локальную переменную этой функции:

```typescript
import {provideExternalDependenciesViaClosure} from "loader-builder";

const libraryName = "___EXPORT_BANNER_PLACEHOLDER___";
const exposeVariableName = "__dynamicExternals__";
const {plugins} = provideExternalDependenciesViaClosure({
    libraryName,
    exposeVariableName,
    externalsCalculator: async (dependencies: TestDependencies) => ({ success: true, value: dependencies.externals }),
});

export default {
    ...,
    plugins: [...plugins],
    externals: {
        react: exposeVariableName + ".react",
        "react-dom": exposeVariableName + ".reactDOM",
    },
}
```

Плюсы:

1. Полная изоляция загружаемых модулей виджетов.
2. Не требуется использовать динамические импорты в коде виджета.
3. Типизация `externals`: нельзя использовать зависимость, которая не была передана в `importWidgetModule`.
4. Позволяет асинхронно выбирать, какие модули использовать: переданные из npm-loader или загрузить из своего чанка.

Минусы:

1. Не работает, если собирать бандл как честный `ES`-модуль.
2. Нужно обеспечить, чтобы все `externals`-модули были в первом чанке, так как только он оборачивается в функцию. Это автоматически случается, если настроен только один чанк.