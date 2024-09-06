# Библиотека для построения Playground

Эта библиотека имеет target: ESNext. Транспилировать библиотеку под необходимое окружение в браузере - ответственность потребителя. CRA и Vite транспилируют автоматически.

ВНИМАНИЕ: Библиотека предназначена для тестирования и разработки. Не используйте в реальных потребителях. В библиотеку могут быть добавлены инструменты для дебага, которых на проде у потребителей быть не должно.
В реальных потребителях используйте [@skbkontur/widget-consumer-react-utils](../widget-consumer-react-utils/README.md), если необходима отрисовка виджета в контейнере потребителя. Либо собственные разработки.

В playground можно инициализировать виджет так же просто, как и в потребителях только с помощью библиотеки [@skbkontur/widget-consumer-react-utils](../widget-consumer-react-utils/README.md), однако это не так удобно для разработки и тестирования. Для playground:
* Важно подробное отображение ожидаемых и неожиданных ошибок на экране, в том числе ошибок `dispose`;
* Автоматическая перезагрузка при изменении кода (hot reload) или параметров инициализации виджета (помимо обновлений с помощью react fast refresh);
* Сохранение значений параметров для текущего пользователя и их автоматическое вычисление на основе текущей портальной сессии;
* Использование того же самый `npm-loader`, который будет подключен в реальных потребителей;
* Не требуется кеш (получать фронтовое API и рисовать виджет можно двумя независимыми этапами).

Данная библиотека работает совместно с [@skbkontur/widget-consumer-react-utils](../widget-consumer-react-utils/README.md), предоставляя последней требуемые данные для отрисовки виджета.

## Установка
`npm install @skbkontur/operation-result`

`npm install @skbkontur/widget-consumer-react-utils`

`npm install @skbkontur/widget-playground`

## Примеры

* [Минимальный пример](examples/Minimal/WidgetModule.tsx) для запуска внутри Storybook.
* [Расширенный пример](examples/Standard/PlaygroundTwoStep.tsx) подходит как для запуска внутри Storybook, так и в произвольном сервере. Требует минимальный пример.
* Пример использования библиотеки в [стандартном шаблоне на react](../template/playground/WidgetController.tsx) для старта виджетов.

Работу примера можно посмотреть в Storybook: `npm run storybook`.

## Содержимое

### Компоненты
* [ErrorComponent](./esm/components/ErrorComponent.tsx) для отображения исключений и ошибок
* [FaultComponent](./esm/components/FaultComponent.tsx) для отображения ошибок из `loader-builder` с типом `WidgetFaultConstraint` или более точным.

### Хуки

* [useGlobalLoader](./esm/providers/useGlobalLoader.tsx) предоставляет состояние `active` для `GlobalLoader` и функцию запуска.
* [useWidgetApi](./esm/providers/useWidgetApi.tsx) загружает и предоставляет экземпляр фронтового API виджета по функции `importWidgetModule`. Используется для получения экземпляра фронтового API одноэтапных виджетов, в которых не требуются HTMLElement-контейнер для отрисовки, и двухэтапных виджетов. Не требуется для одноэтапных виджетов, в зависимостях которого требуется HTMLElement-контейнер для немедленной отрисовки (для них можно сразу использовать хук `useWidgetRenderCallback`).
* [useWidgetRenderCallback](./esm/providers/useWidgetRenderCallback.tsx) конвертирует функцию отрисовки виджета из формата `loader-builder` в формат `WidgetRenderer` (для одноэтапных виджетов c `HTMLElemenent`-контейнером и двухэтапных виджетов). Предназначен для использования совместно `WidgetRenderer`.

