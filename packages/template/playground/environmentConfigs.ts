import type { GetPlaygroundDevConfig, GetPlaygroundEnvironmentConfig } from "@skbkontur/widget-platform/browser";
import type { EnvironmentConfig } from "./EnvironmentConfig.js";

// для локальной разработки: npm run start и npm run preview
export const getDevConfig: GetPlaygroundDevConfig<EnvironmentConfig> = async () => {
  return {
    environmentConfig: {
      apiUrl: new URL("https://domain.ru/template-widget/api/"), // локально используем облачный
    },
  };
};

const loaderUrlPrefix = new URL("./widget/", window.location.href);
const apiUrl = new URL("./api/", window.location.href); // урл до бэкенда на текущей площадке с виджетом

export const getCloudConfig: GetPlaygroundEnvironmentConfig<EnvironmentConfig> = async () => {
  return {
    loaderUrlPrefix,
    environmentConfig: {
      apiUrl,
    },
  };
};

export const getProdConfig: GetPlaygroundEnvironmentConfig<EnvironmentConfig> = async () => {
  return {
    loaderUrlPrefix,
    environmentConfig: {
      apiUrl,
    },
  };
};

// чтобы добавить новое окружение index.{env}.html, добавь функцию сюда и напиши ее имя в .platform/config.ts
