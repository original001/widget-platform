# Шаблон для старта виджетов

## Чтобы запустить

```
npm install && npm start
```


## Инструкция по созданию нового виджета из шаблона

0. Спроектируй фронтовое API виджета.
1. Скопируй код папки себе в репозиторий. Например, командами
```
cp -r widget-platform/packages/template my-widget
```
2. Просмотри структуру проекта. В папке `widget` размещается код виджета. В папке `playground` код песочницы для тестирования.
4. Запусти виджет командой `npm install && npm start`. Перейди по URL из консоли и проверь, что виджет работает.
5. Если стандартный контракт подходит, то кастомизируй его под свои потребности:
    * Укажи зависимости виджета (apiKey, apiUrl, account) в типе `ImportDependencies` в файле `platformTypes.ts`.
    * Укажи параметры отрисовки виджета (container) в типе `InitParams`.
    * Укажи возможные ошибки получения начального состояния виджета в типе `WidgetImportFaults`.
    * При необходимости кастомизируй иные ошибки в перечисленных типах.
7. Передай требуемые аргументы в песочнице в файле `playground/WidgetModule.tsx`.
8. Собери виджет командой `npm run build`.
9. Исходники виджета и песочницы лежат в папке `.artifacts`. Их можно захостить на произвольном веб-сервере.
10. Исходники npm-пакета лежат в папке `.artifacts/npm-loader`. Собрать пакет можно командой `npm pack`. Затем собранный пакет можно протестировать. Если тесты прошли, то собранный npm-пакет можно опубликовать командой `npm publish`.
11. Опубликованный `npm-пакет` необходимо подключить потребителю.


### Trunbleshooting

При загрузке сторибука ошибка 504: Нужно очистить папку `.artifacts/cache`.
