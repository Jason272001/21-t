import type { Metadata } from "next";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  Compass,
  Heart,
  Network,
  Server,
  ShieldCheck,
  Sprout,
  Users,
  Wrench,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { getLanguage } from "@/lib/i18n-server";

const copy = {
  en: {
    label: "About 21CT",
    title: "Technology that opens doors.",
    intro:
      "We believe technology should feel within reach. At 21st Century Technology, our passion is helping people understand it, build confidence, and turn knowledge into practical skills.",
    read: "Start learning",
    contact: "Talk with us",
    belief: "Learn with purpose. Build with care.",
    beliefBody:
      "From a learner’s first steps to a business’s next challenge, we want technology to make everyday work and life better.",
    missionLabel: "Our passion",
    missionTitle: "Clear explanations. Practical learning. More possibilities.",
    missionBody:
      "Learning IT can feel overwhelming when the language is unfamiliar or the lessons seem far from real life. We want to make that first step easier for Burmese learners through approachable explanations, useful articles, and opportunities to put knowledge into practice.",
    missionEnd:
      "Our purpose is to help people ask questions, solve problems, and keep learning as technology changes. We care about what learners can understand and apply, not just the information they can remember.",
    valuesTitle: "What guides us",
    values: [
      [
        "Access to understanding",
        "Explain ideas clearly and make room for beginners, different backgrounds, and questions.",
      ],
      [
        "Skills with a purpose",
        "Connect learning to everyday tasks, useful projects, and the problems people actually face.",
      ],
      [
        "Care and responsibility",
        "Treat people, their information, and the technology they rely on with respect.",
      ],
    ],
    futureLabel: "Our direction",
    futureTitle: "Education today. A wider role in technology tomorrow.",
    futureBody:
      "Our long-term ambition is to grow beyond technology education and help companies plan, build, and maintain the IT systems they depend on. These are areas we plan to develop, rather than services we are announcing as available today.",
    planned: "Planned service area",
    services: [
      [
        "Networks & connectivity",
        "Business networks, Wi-Fi, and reliable connections between people, offices, and systems.",
      ],
      [
        "Servers & infrastructure",
        "Server setup, infrastructure planning, and approaches to access, backups, and ongoing maintenance.",
      ],
      [
        "Software & web solutions",
        "Websites, business applications, and software that supports an organization’s day-to-day workflows.",
      ],
      [
        "IT support & solutions",
        "Practical technical support, troubleshooting, and guidance shaped around each company’s needs.",
      ],
    ],
    roadmapTitle: "How we want to grow",
    roadmap: [
      [
        "Our focus now",
        "Build a strong learning foundation",
        "Share practical technology knowledge in Burmese and develop a learning experience that helps people move forward.",
      ],
      [
        "As we grow",
        "Connect knowledge with real practice",
        "Expand learning resources and opportunities to work through useful projects and real-world problems.",
      ],
      [
        "Our longer-term ambition",
        "Support businesses with IT",
        "Develop the skills, processes, and support needed to offer dependable technology services to companies.",
      ],
    ],
    invitationTitle: "Let’s build what comes next.",
    invitationBody:
      "Whether you want to learn, share an idea, or discuss a future business need, we would like to hear from you. Your questions help shape where 21CT goes next.",
    courses: "Explore courses",
    metadata:
      "Meet 21CT: our passion for practical technology education in Burmese and our future plans for business networks, servers, software, and IT solutions.",
  },
  my: {
    label: "21CT အကြောင်း",
    title: "အခွင့်အလမ်းသစ်တွေ ဖွင့်ပေးမယ့် နည်းပညာ။",
    intro:
      "နည်းပညာဆိုတာ လူတိုင်း လက်လှမ်းမီပြီး နားလည်အသုံးချနိုင်တဲ့ အရာဖြစ်သင့်တယ်လို့ ကျွန်ုပ်တို့ ယုံကြည်ပါတယ်။ 21st Century Technology ရဲ့ စိတ်အားထက်သန်မှုက လူတွေကို နည်းပညာ နားလည်လာစေဖို့၊ ယုံကြည်မှုရှိလာစေဖို့နဲ့ အသိပညာကို လက်တွေ့ကျွမ်းကျင်မှုအဖြစ် ပြောင်းလဲနိုင်စေဖို့ပါ။",
    read: "စတင်လေ့လာရန်",
    contact: "ဆက်သွယ်ဆွေးနွေးရန်",
    belief: "ရည်ရွယ်ချက်ရှိရှိ သင်ယူပါ။ စေတနာပါပါ ဖန်တီးပါ။",
    beliefBody:
      "သင်ယူသူတစ်ဦးရဲ့ ပထမခြေလှမ်းကနေ လုပ်ငန်းတစ်ခုရဲ့ စိန်ခေါ်မှုအသစ်အထိ နည်းပညာက နေ့စဉ်ဘဝနဲ့ အလုပ်တွေကို ပိုကောင်းစေဖို့ ကျွန်ုပ်တို့ ရည်ရွယ်ပါတယ်။",
    missionLabel: "ကျွန်ုပ်တို့ရဲ့ စိတ်အားထက်သန်မှု",
    missionTitle:
      "ရှင်းလင်းတဲ့ သင်ကြားမှု။ လက်တွေ့အသုံးချနိုင်တဲ့ ပညာ။ ပိုမိုကျယ်ပြန့်တဲ့ အခွင့်အလမ်း။",
    missionBody:
      "ဘာသာစကား အခက်အခဲရှိတဲ့အခါ၊ သင်ခန်းစာတွေက လက်တွေ့ဘဝနဲ့ ဝေးနေတဲ့အခါ IT ကို စလေ့လာရတာ ခက်ခဲနိုင်ပါတယ်။ မြန်မာသင်ယူသူတွေအတွက် နားလည်လွယ်တဲ့ ရှင်းပြချက်တွေ၊ အသုံးဝင်တဲ့ ဆောင်းပါးတွေနဲ့ လက်တွေ့လေ့ကျင့်နိုင်မယ့် အခွင့်အလမ်းတွေကနေ ပထမခြေလှမ်းကို ပိုလွယ်ကူစေချင်ပါတယ်။",
    missionEnd:
      "နည်းပညာတွေ ပြောင်းလဲနေပေမဲ့ မေးခွန်းမေးရဲဖို့၊ ပြဿနာဖြေရှင်းတတ်ဖို့နဲ့ ဆက်လက်သင်ယူနိုင်ဖို့က ကျွန်ုပ်တို့ရဲ့ ရည်ရွယ်ချက်ပါ။ အချက်အလက်တွေ မှတ်မိရုံထက် သင်ယူသူတွေ ဘာကို နားလည်ပြီး ဘယ်လိုအသုံးချနိုင်သလဲဆိုတာကို အလေးထားပါတယ်။",
    valuesTitle: "ကျွန်ုပ်တို့ အလေးထားတဲ့ တန်ဖိုးများ",
    values: [
      [
        "နားလည်သင်ယူခွင့်",
        "စတင်လေ့လာသူတွေ၊ နောက်ခံမတူသူတွေနဲ့ မေးခွန်းတွေကို ကြိုဆိုပြီး နားလည်လွယ်အောင် ရှင်းပြဖို့။",
      ],
      [
        "အသုံးဝင်တဲ့ ကျွမ်းကျင်မှု",
        "သင်ယူမှုကို နေ့စဉ်အလုပ်တွေ၊ လက်တွေ့ project တွေနဲ့ တကယ်ကြုံရတဲ့ ပြဿနာတွေနဲ့ ချိတ်ဆက်ပေးဖို့။",
      ],
      [
        "စေတနာနဲ့ တာဝန်ယူမှု",
        "လူတွေ၊ သူတို့ရဲ့ အချက်အလက်တွေနဲ့ အားထားအသုံးပြုနေတဲ့ နည်းပညာစနစ်တွေကို လေးစားစွာ ကိုင်တွယ်ဖို့။",
      ],
    ],
    futureLabel: "ရှေ့ဆက်မယ့် ဦးတည်ချက်",
    futureTitle: "ယနေ့ နည်းပညာပညာရေးမှ မနက်ဖြန် လုပ်ငန်းသုံး IT ဖြေရှင်းချက်များဆီသို့။",
    futureBody:
      "ရေရှည်မှာ နည်းပညာပညာရေးထက် ပိုမိုကျယ်ပြန့်စွာ တိုးတက်ပြီး ကုမ္ပဏီတွေ အားထားရတဲ့ IT စနစ်တွေကို စီမံကိန်းချခြင်း၊ တည်ဆောက်ခြင်းနဲ့ ထိန်းသိမ်းခြင်းတို့မှာ ကူညီပေးနိုင်ဖို့ ရည်မှန်းထားပါတယ်။ အောက်ပါကဏ္ဍတွေဟာ အနာဂတ်မှာ ဖော်ဆောင်လိုတဲ့ အစီအစဉ်တွေဖြစ်ပြီး လက်ရှိ ဝန်ဆောင်မှု စတင်ပေးနေပြီလို့ ကြေညာထားခြင်း မဟုတ်ပါ။",
    planned: "အနာဂတ် ဝန်ဆောင်မှု အစီအစဉ်",
    services: [
      [
        "ကွန်ရက်နဲ့ ချိတ်ဆက်မှု",
        "လုပ်ငန်းသုံး network၊ Wi-Fi နဲ့ လူတွေ၊ ရုံးတွေနဲ့ စနစ်တွေကြား တည်ငြိမ်တဲ့ ချိတ်ဆက်မှုများ။",
      ],
      [
        "ဆာဗာနဲ့ အခြေခံစနစ်များ",
        "Server တပ်ဆင်ခြင်း၊ IT အခြေခံစနစ် စီမံခြင်း၊ အသုံးပြုခွင့်၊ backup နဲ့ ပုံမှန်ထိန်းသိမ်းမှု အစီအစဉ်များ။",
      ],
      [
        "ဆော့ဖ်ဝဲနဲ့ ဝက်ဘ်ဖြေရှင်းချက်များ",
        "Website၊ လုပ်ငန်းသုံး application နဲ့ အဖွဲ့အစည်းရဲ့ နေ့စဉ်လုပ်ငန်းစဉ်တွေကို ကူညီပေးမယ့် software များ။",
      ],
      [
        "IT အကူအညီနဲ့ ဖြေရှင်းချက်များ",
        "ကုမ္ပဏီတစ်ခုချင်းစီရဲ့ လိုအပ်ချက်နဲ့ ကိုက်ညီမယ့် နည်းပညာအကူအညီ၊ ပြဿနာရှာဖွေဖြေရှင်းခြင်းနဲ့ အကြံပေးခြင်း။",
      ],
    ],
    roadmapTitle: "ကျွန်ုပ်တို့ တိုးတက်ချင်တဲ့ လမ်းကြောင်း",
    roadmap: [
      [
        "လက်ရှိ အာရုံစိုက်မှု",
        "ခိုင်မာတဲ့ သင်ယူမှုအခြေခံ တည်ဆောက်ခြင်း",
        "လက်တွေ့နည်းပညာ အသိပညာကို မြန်မာဘာသာနဲ့ မျှဝေပြီး သင်ယူသူတွေ ရှေ့ဆက်နိုင်မယ့် သင်ယူမှုအတွေ့အကြုံကို ဖော်ဆောင်ဖို့။",
      ],
      [
        "ဆက်လက်တိုးတက်လာချိန်",
        "အသိပညာနဲ့ လက်တွေ့ကို ချိတ်ဆက်ခြင်း",
        "သင်ယူစရာအရင်းအမြစ်တွေ တိုးချဲ့ပြီး အသုံးဝင်တဲ့ project တွေနဲ့ လက်တွေ့ပြဿနာတွေကို လေ့ကျင့်ဖြေရှင်းနိုင်ဖို့။",
      ],
      [
        "ရေရှည် ရည်မှန်းချက်",
        "လုပ်ငန်းတွေကို IT နဲ့ ပံ့ပိုးခြင်း",
        "ကုမ္ပဏီတွေအတွက် အားထားနိုင်တဲ့ နည်းပညာဝန်ဆောင်မှု ပေးနိုင်ဖို့ ကျွမ်းကျင်မှု၊ လုပ်ငန်းစဉ်နဲ့ ပံ့ပိုးမှုတွေကို တည်ဆောက်ဖို့။",
      ],
    ],
    invitationTitle: "နောက်ခြေလှမ်းကို အတူတူ ဖန်တီးကြမယ်။",
    invitationBody:
      "သင်ယူချင်တာဖြစ်ဖြစ်၊ အကြံဉာဏ်တစ်ခု မျှဝေချင်တာဖြစ်ဖြစ်၊ အနာဂတ်လုပ်ငန်းလိုအပ်ချက်တစ်ခု ဆွေးနွေးချင်တာဖြစ်ဖြစ် ကျွန်ုပ်တို့ထံ ဆက်သွယ်နိုင်ပါတယ်။ သင့်မေးခွန်းတွေက 21CT ရဲ့ ရှေ့ဆက်မယ့် လမ်းကြောင်းကို ပုံဖော်ရာမှာ အထောက်အကူ ဖြစ်စေပါတယ်။",
    courses: "သင်တန်းများ ကြည့်ရန်",
    metadata:
      "21CT ရဲ့ မြန်မာဘာသာ နည်းပညာပညာရေးအပေါ် စိတ်အားထက်သန်မှုနဲ့ အနာဂတ် network၊ server၊ software နဲ့ လုပ်ငန်းသုံး IT ဝန်ဆောင်မှု အစီအစဉ်များ။",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getLanguage();
  return { title: copy[locale].label, description: copy[locale].metadata };
}

export default async function AboutPage() {
  const { locale } = await getLanguage();
  const c = copy[locale];
  const valueIcons = [Users, Compass, Heart];
  const serviceIcons = [Network, Server, Code2, Wrench];

  return (
    <main className="bg-page text-foreground">
      <section className="tech-grid border-b border-line/10 px-4 py-16 lg:px-6 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-accent">{c.label}</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-snug tracking-tight md:text-6xl md:leading-snug">
              {c.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-muted">{c.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/articles">{c.read}</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                {c.contact}
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-3xl border border-accent/25 bg-surface p-7 shadow-[0_0_60px_rgba(34,211,238,0.08)] sm:p-9">
            <div aria-hidden="true" className="mb-8 flex items-center gap-3 text-accent">
              <span className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
                <BookOpen size={30} />
              </span>
              <span className="h-px flex-1 bg-accent/25" />
              <span className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
                <Sprout size={30} />
              </span>
              <span className="h-px flex-1 bg-accent/25" />
              <span className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
                <Network size={30} />
              </span>
            </div>
            <p className="text-2xl font-bold leading-relaxed">{c.belief}</p>
            <p className="mt-4 leading-8 text-muted">{c.beliefBody}</p>
            <p className="mt-8 border-t border-line/10 pt-5 text-xs font-bold uppercase tracking-widest text-subtle">
              21st Century Technology
            </p>
          </div>
        </div>
      </section>

      <section
        className="mx-auto grid max-w-7xl gap-7 px-4 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-6 lg:py-20"
        aria-labelledby="mission-title"
      >
        <div>
          <p className="text-sm font-bold text-accent">{c.missionLabel}</p>
          <h2 id="mission-title" className="mt-4 text-3xl font-black leading-relaxed">
            {c.missionTitle}
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-9 text-muted">
          <p>{c.missionBody}</p>
          <p>{c.missionEnd}</p>
        </div>
      </section>

      <section
        className="border-y border-line/10 bg-surface px-4 py-16 lg:px-6"
        aria-labelledby="values-title"
      >
        <div className="mx-auto max-w-7xl">
          <h2 id="values-title" className="text-2xl font-black leading-relaxed">
            {c.valuesTitle}
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {c.values.map(([title, body], i) => {
              const Icon = valueIcons[i];
              return (
                <article key={title} className="rounded-2xl border border-line/10 bg-page p-6">
                  <Icon aria-hidden="true" className="text-accent" size={28} />
                  <h3 className="mt-5 text-lg font-bold leading-8">{title}</h3>
                  <p className="mt-3 leading-8 text-muted">{body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20"
        aria-labelledby="future-title"
      >
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-accent">{c.futureLabel}</p>
          <h2
            id="future-title"
            className="mt-4 text-3xl font-black leading-relaxed md:text-4xl md:leading-relaxed"
          >
            {c.futureTitle}
          </h2>
          <p className="mt-5 text-lg leading-9 text-muted">{c.futureBody}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {c.services.map(([title, body], i) => {
            const Icon = serviceIcons[i];
            return (
              <article
                key={title}
                className="rounded-2xl border border-line/10 bg-surface p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <Icon aria-hidden="true" size={30} className="shrink-0 text-accent" />
                  <span className="rounded-full border border-line/15 px-3 py-1.5 text-xs leading-6 text-subtle">
                    {c.planned}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold leading-9">{title}</h3>
                <p className="mt-3 leading-8 text-muted">{body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="border-y border-line/10 bg-surface px-4 py-16 lg:px-6"
        aria-labelledby="roadmap-title"
      >
        <div className="mx-auto max-w-7xl">
          <h2 id="roadmap-title" className="text-3xl font-black leading-relaxed">
            {c.roadmapTitle}
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {c.roadmap.map(([stage, title, body], i) => (
              <li key={stage} className="border-t-2 border-accent/30 pt-6">
                <span aria-hidden="true" className="text-3xl font-black text-accent">
                  0{i + 1}
                </span>
                <p className="mt-4 text-sm font-semibold leading-7 text-subtle">{stage}</p>
                <h3 className="mt-2 text-xl font-bold leading-9">{title}</h3>
                <p className="mt-3 leading-8 text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="rounded-3xl border border-accent/20 bg-accent/5 p-7 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <ShieldCheck aria-hidden="true" className="mb-5 text-accent" size={30} />
            <h2 className="text-3xl font-black leading-relaxed">{c.invitationTitle}</h2>
            <p className="mt-4 leading-8 text-muted">{c.invitationBody}</p>
          </div>
          <div className="mt-7 flex shrink-0 flex-wrap gap-3 lg:mt-0 lg:max-w-60">
            <ButtonLink href="/contact">
              {c.contact}
              <ArrowUpRight aria-hidden="true" size={17} className="ml-2 shrink-0" />
            </ButtonLink>
            <ButtonLink href="/courses" variant="secondary">
              {c.courses}
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
