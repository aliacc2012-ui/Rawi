export type Locale = "en" | "ar";

export const locales: Locale[] = ["en", "ar"];
export const defaultLocale: Locale = "en";

export const dictionaries = {
  en: {
    dir: "ltr" as const,
    nav: { features: "Features", gallery: "Gallery", pricing: "Pricing", open: "Open RAWI", switch: "العربية" },
    hero: {
      eyebrow: "UAE-BORN \u2022 MADE FOR CREATORS",
      titlePre: "Your work deserves ",
      titleHighlight: "better",
      titlePost: " than a Drive link.",
      body: "Deliver photos and films through cinematic, branded client galleries built for the way creators actually work.",
      startFree: "Start free",
      viewDemo: "View demo gallery \u2192",
      trust: ["No credit card", "Photos + video", "Arabic + English"],
    },
    auth: {
      signIn: "Sign in",
      signUp: "Create account",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      fullName: "Full name",
      forgot: "Forgot password?",
      noAccount: "New to RAWI?",
      haveAccount: "Already have an account?",
      terms: "I agree to the Terms and Privacy Policy",
    },
    dashboard: {
      welcome: "Good evening",
      storage: "Storage",
      newProject: "New project",
      recentProjects: "Recent projects",
      viewAll: "View all",
      emptyTitle: "Welcome to RAWI.",
      emptyBody: "Your work deserves a better delivery experience. Create your first project and turn your photos and films into a client-ready gallery.",
      emptyCta: "Create first project",
    },
  },
  ar: {
    dir: "rtl" as const,
    nav: { features: "المميزات", gallery: "المعرض", pricing: "الأسعار", open: "افتح راوي", switch: "English" },
    hero: {
      eyebrow: "من الإمارات \u2022 لصنّاع المحتوى",
      titlePre: "شغلك يستحق ",
      titleHighlight: "أفضل",
      titlePost: " من رابط درايف.",
      body: "سلّم الصور والأفلام من خلال معارض سينمائية تحمل هويتك، مصممة لطريقة عمل المبدعين.",
      startFree: "ابدأ مجاناً",
      viewDemo: "شاهد معرضاً تجريبياً \u2190",
      trust: ["بدون بطاقة ائتمان", "صور وفيديو", "عربي وإنجليزي"],
    },
    auth: {
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      fullName: "الاسم الكامل",
      forgot: "نسيت كلمة المرور؟",
      noAccount: "جديد على راوي؟",
      haveAccount: "لديك حساب بالفعل؟",
      terms: "أوافق على الشروط وسياسة الخصوصية",
    },
    dashboard: {
      welcome: "مساء الخير",
      storage: "التخزين",
      newProject: "مشروع جديد",
      recentProjects: "المشاريع الأخيرة",
      viewAll: "عرض الكل",
      emptyTitle: "أهلاً بك في راوي.",
      emptyBody: "شغلك يستحق تجربة تسليم أفضل. أنشئ مشروعك الأول وحوّل صورك وأفلامك إلى معرض جاهز لعملائك.",
      emptyCta: "إنشاء أول مشروع",
    },
  },
} satisfies Record<Locale, unknown>;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
