export type Locale = "uk" | "en";

export type TranslationKey =
  | "nav.communities"
  | "nav.myInitiatives"
  | "nav.myCommunities"
  | "nav.logout"
  | "common.loading"
  | "communities.title"
  | "communities.subtitle"
  | "communities.create"
  | "communities.empty"
  | "communities.join"
  | "communities.open"
  | "initiatives.title"
  | "initiatives.subtitle"
  | "initiatives.create"
  | "initiatives.empty"
  | "myCommunities.title"
  | "myCommunities.subtitle"
  | "legal.cookie"
  | "legal.accept"
  | "legal.privacy"
  | "legal.terms";

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  uk: {
    "nav.communities": "Спільноти",
    "nav.myInitiatives": "Мої ініціативи",
    "nav.myCommunities": "Мої спільноти",
    "nav.logout": "Вийти",
    "common.loading": "Завантаження...",
    "communities.title": "Відкривай спільноти",
    "communities.subtitle":
      "Соціальний фід ініціатив: долучайся, підтримуй, запускай зміни разом.",
    "communities.create": "Створити спільноту",
    "communities.empty": "Поки немає спільнот. Створи першу.",
    "communities.join": "Долучитись",
    "communities.open": "Відкрити",
    "initiatives.title": "Мої ініціативи",
    "initiatives.subtitle":
      "Ініціативи, які ти створив(-ла) або підтримав(-ла) внеском.",
    "initiatives.create": "Створити ініціативу",
    "initiatives.empty": "Поки немає ініціатив.",
    "myCommunities.title": "Мої спільноти",
    "myCommunities.subtitle":
      "Спільноти, де ти учасник(-ця), організатор(-ка) або модератор(-ка).",
    "legal.cookie":
      "Ми використовуємо cookies для сесії входу, безпеки та покращення досвіду.",
    "legal.accept": "Зрозуміло",
    "legal.privacy": "Політика конфіденційності",
    "legal.terms": "Умови користування",
  },
  en: {
    "nav.communities": "Communities",
    "nav.myInitiatives": "My Initiatives",
    "nav.myCommunities": "My Communities",
    "nav.logout": "Logout",
    "common.loading": "Loading...",
    "communities.title": "Discover communities",
    "communities.subtitle":
      "Social initiative feed: join, contribute, and make impact together.",
    "communities.create": "Create community",
    "communities.empty": "No communities yet. Create the first one.",
    "communities.join": "Join",
    "communities.open": "Open",
    "initiatives.title": "My Initiatives",
    "initiatives.subtitle": "Initiatives you created or supported.",
    "initiatives.create": "Create initiative",
    "initiatives.empty": "No initiatives yet.",
    "myCommunities.title": "My Communities",
    "myCommunities.subtitle": "Communities where you are a member.",
    "legal.cookie":
      "We use cookies for secure sessions, safety, and better experience.",
    "legal.accept": "Accept",
    "legal.privacy": "Privacy Policy",
    "legal.terms": "Terms of Use",
  },
};
