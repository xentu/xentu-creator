import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import lang_en from './Locale/en';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: lang_en }
    },
  });

export default i18n;