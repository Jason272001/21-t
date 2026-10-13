import { cache } from "react";
import { cookies } from "next/headers";
import { dictionaries, localeCookie, resolveLocale } from "./i18n";

export const getLanguage = cache(async () => {
  const locale = resolveLocale((await cookies()).get(localeCookie)?.value);
  return { locale, messages: dictionaries[locale] };
});
