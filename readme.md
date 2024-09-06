# Платфома виджетов

- шаринг зависимостей через npm пакет
- песочница с HMR для виджета
- настроенный vite
- генерация npm-loader
- preview собранного виджета
- встроенная аналитика бандла
- изоляция бандла через same-origin iframe

### Это демонстрационный проект

Мы стремимся узнать, есть ли в open source потребность в такой технологии. Если вы заинтересовались, дайте нам знать: поставьте звездочку в github, оставьте issue, напишите мне в telegram [@vtolstikov](https://t.me/vtolstikov).

### Для запуска проекта

Выполни из корня:

```
npm install && npm run build
```

Затем из папки `packages/template` выполни:

```
npm start
```

В консоли появится урл, по которому можно открыть страницу с песочницей и виджетом.

Браузер не сможет открыть страницу, т.к. он не доверяет серту, который в проекте. Нужно либо доверится серту, либо сгенерировать свой.

Чтобы сгенерировать свой:
1. Сделать как предлагают [тут](https://stackoverflow.com/a/41366949). Вместо example.com нужно поставить `localhost`.
2. Серт в проекте нужно заменить на сгенерированный. Серт находится в папке `packages/https-test-certificate`

Далее в любом случае нужно добавить сертификат в доверенные. Для этого можно использовать [эту](https://pq.hosting/help/instructions/340-kak-ustanovit-sertifikaty-v-google-chrome.html) инструкцию и Google Chrome.

После этого приложение должно открыться. Чтобы загрузить виджет нажмите два тогла "Импортировать виджет" и "Отрисовать виджет".

### Требования к потребителю виджета

Описаны в [тут](./docs/demands.md).

### Требования платформы при разработке виджета

- Полная поддержка esm (type: module)
- Typescript >= 5

### Подключение в существующий виджет

Подключи пакет

```
npm install @skbkontur/widget-platform
```

### Структура проекта

Платформа требует следующие файлы для работы:

```
📦Project
 ├ 📂.platform
 │ └ 📜config.ts
 ├ 📂exports
 │ ├ 📜index.ts
 │ └ 📜platformTypes.ts
 ├ 📂jsLoader
 │ ├ 📜index.ts
 │ └ 📜vite.config.ts
 ├ 📂playground
 │ ├ 📜environmentConfigs.ts
 │ ├ 📜index.tsx
 │ └ 📜vite.config.ts
 ├ 📂widget
 │ ├ 📜index.tsx
 │ └ 📜vite.config.ts
 └ 📜package.json
```


#### package.json

Используется для npm-loader и для виджета. Подключай в dependencies только то, что должно быть в npm-loader. Остальное - в devDependencies. Также в dependencies есть несколько служебных зависимостей, которые подключаются во время генерации npm-loader:
- @skbkontur/loader-builder
- @skbkontur/operation-result

Осторожно меняй поля в этом package.json, т.к. они используются не только для виджета, но и попадают в node_modules потребителя. Например, поле `sideEffects: false` может быть полезен для npm пакета, но сломать рантайм виджета.

Чтобы подключить npm-loader в песочницу, достаточно импортировать модуль с именем в этом package.json.

#### playground

Должен содержать файл `index.tsx?`. Это входная точка для компонента песочницы. Должен экспортировать функцию, которая принимает в параметры настройки из конфига, `HTMLElement` и урл виджета.

#### widget

Должен содержать файл `index.tsx?`. Это входная точка для виджета. Должен экспортировать функцию `createWidgetApi` как `default`.

#### jsLoader

js-loader - это промежуточный чанк перед загрузкой основного скрипта виджета. Нужен, чтобы создать same-origin iframe. Также позволяет сделать некоторые дополнительные настройки.

Папка должна содержать файл `index.ts`. Это входная точка. Файл должен содержать экспорты `getJsLoaderDependencies` и `generateCsp`.

`getJsLoaderDependencies` - позволяет передать в виджет свои зависимости, чтобы они не попали в iframe.

`generateCsp` - позволяет донастроить политики CSP.


#### config.ts

- `sharedModules` – Зависимости, которые нужно переиспользовать между потребителем и виджетом. Как подключаются зависимости, читай в [статье](https://staff.skbkontur.ru/article/64f62798fa36a404535ac105#stanpm). Платформа использует window. Пакет, который переиспользуется, обязательно должен быть в [dependencies](#dependencies) package.json.
  Если нужно поднять версию пакета, который переиспользуется, делай это по [гайду](#обновление-зависимостей).
- `playground:`
  - `port` - порт для dev-server
  - `checkersConfig` - конфигурация [vite-plugin-checker](https://www.npmjs.com/package/vite-plugin-checker).
- `jsLoader:`
  - `sharedModules` -  Аналогично `sharedModules` платформы, но поддерживает явное указание, в каком формате импортируется зависимость: `namespace`, `imports`
  - `checkersConfig` - конфигурация [vite-plugin-checker](https://www.npmjs.com/package/vite-plugin-checker).
- `widget`
  - `checkersConfig` - конфигурация [vite-plugin-checker](https://www.npmjs.com/package/vite-plugin-checker).

#### vite.config.ts
Не обязателен.

Если вам требуется переопределить некоторые настройки vite, то нужно добавить файл vite.config.ts в соответствующую папку. Этот конфиг перезапишет найстройки платформы. Перезапишутся не все настройки, а только указанные. Вот так может выглядеть файл:

```ts
import {defineConfig} from 'vite'

export default defineConfig(_config => ({
  server: {
    port: 5555
  }
}))
```

Не рекомендуется настраивать outDir, т.к. может некорректно работать команда `preview`. Лучше сделать батник в проекте, который скопирует скрипты куда надо.

#### exports

Папка для npm-loader.

Во время сборки платформы собирается npm-loader. В нем создается публичный метод `importWidgetModule`. Чтобы он был типизирован корректно, нужно указать свои типы в файле `platformTypes.ts`.

Чтобы экпортировать дополнительные типы в npm-loader, нужно указать их в файле `index.ts`

Если есть типы, которые нужны для `index.ts`, но которые не нужно экспортировать, создай их в другом файле.

#### environmentConfigs.ts

Настройки песочницы для разных окружений или локальной разработки. Для каждого окружения — функция, возвращающая его настройки.

Пример:
```ts
// playground/environmentConfigs.ts
import type { GetPlaygroundDevConfig, GetPlaygroundEnvironmentConfig } from "@skbkontur/widget-platform/browser";

type MyEnvironmentConfig = { apiUrl: URL };

export const getDevConfig: GetPlaygroundDevConfig<MyEnvironmentConfig> = async () => {
  return {
    environmentConfig: {
      apiUrl: new URL("https://internal.domain.ru/template-widget/api/"), // локально используем облачный
    },
  };
};

export const getCloudConfig: GetPlaygroundEnvironmentConfig<MyEnvironmentConfig> = async () => {
  return {
    loaderUrlPrefix: new URL("./widget/", window.location.href),
    environmentConfig: {
      apiUrl: new URL("./api/", window.location.href), // урл до бэкенда на текущей площадке с виджетом
    },
  };
};

export const getProdConfig: GetPlaygroundEnvironmentConfig<EnvironmentConfig> = async () => {
  return {
    loaderUrlPrefix: new URL("./widget/", window.location.href),
    environmentConfig: {
      apiUrl: new URL("https://domain.ru/template-widget/api/"),
    },
  };
};
```

##### Что возвращают функции

- `loaderUrlPrefix` — урл до задеплоенной папки с артефактами виджета. Плейграунд будет искать лоудер виджета по урлу `${loaderUrlPrefix}/loader.js`.
- `environmentConfig` — дополнительные настройки плейграунда. Их тип ты задаешь сам — смотря что хочешь менять между площадками: урлы, апи-ключи.

`environmentConfig` из текущего окружения будет приходить в [`renderPlayground`](#playground) в поле `environmentConfig`, а урл до лоудера виджета `${loaderUrlPrefix}/loader.js` — в поле `widgetUrl`.

##### Какие окружения бывают

Функция `getDevConfig` должна быть всегда, настройки из нее применяются, когда запускаешь `widget-platform start`, `preview` или `watch`. В `getDevConfig` поле `loaderUrlPrefix` определять не нужно: при локальной разработке урлом раздачи виджета управляет сама платформа.

Остальные окружения ты определяешь сам, в `.platform/config.ts`. В объекте `playground.htmlConfigs` для каждого окружения укажи:
- ключ — имя html-ки, точки входа в плейграунд в этом окружении,
- значение — имя функции из `environmentConfigs.ts` с настройками этого окружения.

```ts
// .platform/config.ts
export default (): Config => ({
  ...
  playground: {
    htmlConfigs: {
      "index.cloud.html": "getCloudConfig",
      "index.prod.html": "getProdConfig",
    },
    ...
  },
})
```
##### Html-ки плейграунда

Команда `widget-platform build` сгенерирует файл `index.{env}.html` для каждого окружения из `playground.htmlConfigs` и положит его в `.artifacts/playground/`. Каждый `index.{env}.html` открывает плейграунд с настройками своего окружения.

##### Передача урлов для динамических площадок

Пример:
На каждую ветку монорепы создается тестовая площадка со своими доменами, отдельно — для апи, отдельно — для статики, отдельно — для плейграунда:

- `https://my-widget-{branch123}.domain.ru/loader.js` — лоудер
- `https://my-playground-{branch123}.domain.ru/` — плейграунд
- `https://my-api-{branch123}.domain.ru/` — АПИ

Чтобы не перечислять все ветки в конфиге, создай для них одно окружение и вычисляй настройки по `window.location.href`:

```ts
export const getStagingConfig: GetPlaygroundEnvironmentConfig<MyEnvironmentConfig> = async () => {
  const branch = extractBranchName(window.location.href);
  return {
    loaderUrlPrefix: new URL(`https://my-widget-${branch}.domain.ru/`),
    environmentConfig: {
      apiUrl: new URL(`https://my-api-${branch}.domain.ru/`),
    },
  };
};
```

Если нужен урл на том же домене, что и плейграунд, создавай его относительно `window.location.href`:
```ts
    environmentConfig: {
      apiUrl: new URL("./api/", window.location.href),
    },
```

##### Альтернативные способы передать настройки

`environmentConfigs.ts` — это реализация способа "несколько `index.<env>.html` в бандле". Чтобы реализовать другие, оставь в `environmentConfigs.ts` пустой `getDevConfig` и `getIndexHtmlConfig` с `loaderUrlPrefix` и вычисляй настройки в `renderPlayground` по-другому:

```ts
// playground/environmentConfigs.ts
import type { GetPlaygroundDevConfig, GetPlaygroundEnvironmentConfig } from "@skbkontur/widget-platform/browser";

export const getDevConfig: GetPlaygroundDevConfig = async () => {
  return { environmentConfig: undefined };
};

export const getIndexHtmlConfig: GetPlaygroundEnvironmentConfig<EnvironmentConfig> = async () => {
  return {
    loaderUrlPrefix: new URL("./widget/", window.location.href),
    environmentConfig: undefined,
  };
};

// .platform/config.ts
export default (): Config => ({
  ...
  playground: {
    htmlConfigs: {
      "index.html": "getIndexHtmlConfig",
    },
    ...
  },
})
```

##### Настройки для самого виджета

`environmentConfigs.ts` работают только в плейграунде и никак не влияют на работу виджетов внутри реальных потребителей. Чтобы управлять настройками в этих случаях, возвращай их с бэка в АПИ или используй другие способы.

### Команды

**start** — создает vite server через js api. Использует конфиги платформы. HMR работает одинаково и для песочницы для и для виджета, т.е. изменение кода виджета моментально его применяет.
Конфиги из `getDevConfig` в [playground/environmentConfigs.ts](./packages/template/playground/environmentConfigs.ts) попадают в `renderPlayground`. 

**build** — собирает виджет и песочницу. Все операции идут параллельно. На выходе в проекте появляется папка dist. К этим файлам добавляется stats.html с информацией о билде.

Типизацию в приложении ни start, ни build, не проверяют. Чтобы проверять, подключи vite-plugin-checker, как в [примере](./packages/template/.platform/config.ts#L8).

И start, и build собирают пакет npm-loader, готовый к публикации.

**preview** — Хостит собранную песочницу и скрипты виджета на одном порту. Дает возможность проверить работу production сборки. Включает в себя команду **build**.

**watch** - Запускает **preview** и **watch** файлов одновременно.

### Артефакты

На диаграмме ниже показано, куда складываются артефакты сборки:

```
📦Project
 ┣ 📂.artifacts
 ┃ ┣ 📂cache
 ┃ ┣ 📂npm-loader
 ┃ ┣ 📂playground
 ┃ ┣ 📂stats
 ┃ ┗ 📂widget
```

##### Раздача статики
`widget-platform` только собирает все нужные файлы в папку `.artifacts`. Чтобы опубликовать их в интернет, тебе нужен сервер статики.

Сервер статики должен раздавать 2 папки: `.artifacts/playground` и `.artifacts/widget`. Урлы можешь выбирать свои, но часто делают так:
- `https://some-url.kontur.ru/[maybe-some-path]/` — папка `.artifacts/playground`, в корне, чтоб долго не искать.
- `https://some-url.kontur.ru/[maybe-some-path]/widget/` — папка `.artifacts/widget`.

Остальные папки не раздавай: там есть внутренняя информация о системе сборки, которую опасно показывать наружу.

Если пишешь свой сервер, учти такие сложности:

**Разные правила кэширования для файлов с хэшами и без**

Файлы в папках `.artifacts/{playground или widget}/assets` с хэшами в имени. Кэшируй их навечно: `Cache-Control: public, max-age=31536000, immutable`.
Файлы снаружи `assets` — без хэшей. Ревалидируй их на сервере: `Cache-Control: public, no-cache`

**200 вместо 304 из-за етега**

Nginx понижает etag-и до weak, когда сжимает. Из-за этого при серверной ревалидации файл перестает считаться тем же, который был, и вместо быстрого 304 сервер отдает долгий 200. 
**Решение**: Зипуй в своем сервисе, в .NET — используй `UseResponseCompression`.

**404 при обновлениях**

Чтобы загрузить виджет, нужно несколько запросов за скриптами и большинство из них имеют хэши в названии, которые меняются при релизах. Если запрос за `loader.js` попадет на реплику с новой версией, а `assets/index-1234abcd.js` уйдет на реплику со старой, она не найдет файл с таким именем, вернет 404 и пользователи не смогут загрузить виджет.
**Решение**: храни на сервере одновременно и новую, и старую версию бандла. Начинай раздавать новую только тогда, когда все реплики обновились.

###### Виджет
Просто раздай папку `.artifacts/widget` своим сервером статики.

###### Плейграунд

Раздай папку `.artifacts/playground` своим сервером статики.

**Если используешь [environmentConfigs.ts](#environmentconfigsts)**, научи свой сервер раздачи понимать, в каком окружении он работает, и по запросу плейграунда возвращать его `index.{env}.html`. Остальные html-ки нужно не отдавать, иначе на проде засветятся настройки тестовых окружений.

### Работа с window

Платформа виджетов под капотом использует same-origin iframe. Это помогает изолировать рантайм виджета, подписываться на onerror ошибки и выставлять свои csp политики. Но это создает некоторые ограничения.

Same-origin iframe исполняет js код виджета в новом iframe на том же домене. При этом отрисовка DOM выполняется в родителе. Нужно учитывать это при использовании UI библиотек. Если такая библиотека использует window напрямую, то она получит window не родителя, а виджета. Такое поведение можно обходить несколькими способами:

Если библиотека для доступа к window использует `@skbkontur/global-object` (например, `@skbkontur/react-ui`), то поместить `@skbkontur/global-object` в `sharedModules` у jsLoader. Т.е. global-object возвращает глобальные объекты в контексте потребителя, а не виджета.

Если библиотека не использует `@skbkontur/global-object`, но позволяет переопределить window, то можно определить его как `@skbkontur/global-object`.

Если библиотека не позволяет переопределить window, то можно ее вынести в js-loader. Для этого зависимость нужно добавить в `getJsLoaderDependencies` в файле `jsLoader/index.ts`. js-loader исполняется в контексте потребителя, а значит будет использован нужный window.

Второй способ решения этой проблемы - транспилировать код библиотеки так, чтобы все использования window стали использовать `@skbkontur/global-object`.

### Обновление зависимостей

Если ты шаришь зависимости через опцию shared, то нужно правильно обновлять зависимости. Иначе виджет может сломаться в рантайме. Чтобы этого не произошло, следуй инструкции:

1. Убери из shared зависимость, которую обновляешь. Выпусти виджет.
2. Опубликуй новую версию npm-loader.
3. Подключи потребителям новую версию npm-loader.
4. Дождись выпуска **всех** потребителей.
5. Верни в shared свою зависимость. Выпусти виджет.

Почему именно такая последовательность? Если коротко: зависимости, которые мы переиспользуем, находятся в бандле пользователя. Поэтому без перевыпуска потребителя, мы не можем начать использовать новую версию зависимости.

Эта инструкция справедлива как для изменения мажорных версий, так и при некоторых минорных. Для минорных версий это нужно делать, когда используется новое апи, которое не поддерживается в версии потребителя.

### Roadmap

- [ ] Система плагинов для более точной настройки платформы
- [ ] Телеметрия
- [ ] esm для шаринга зависимостей

### Trubleshooting

- `Transforming destructuring to the configured target environment ("chrome49", "edge112", "firefox102", "ios15.6", "safari15.6" + 2 overrides) is not supported yet`
  Решение: в browserslist должны быть указаны только те браузеры, которые поддерживает vite.

- 504 (Outdated Optimize Dep) - пересобрать или попробовать обновить страницу. Происходит, если ту же платформу подключить к другому виджету
