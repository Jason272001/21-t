export const articleCategories = [
  { name: "Computer Basics", slug: "computer-basics" },
  { name: "Cybersecurity", slug: "cybersecurity" },
  { name: "Artificial Intelligence", slug: "ai" },
  { name: "IT Career", slug: "it-career" },
  { name: "Networking", slug: "networking" },
];

export const courseCategories = [
  "Computer Basics",
  "Networking",
  "Cybersecurity",
  "Artificial Intelligence",
  "IT Support",
  "Web Development",
  "Career Preparation",
  "Office Applications",
].map((name) => ({ name, slug: name.toLowerCase().replaceAll(" ", "-") }));

export const instructors = [
  {
    fullName: "Ko Aung Min",
    slug: "aung-min",
    jobTitle: "Senior Network Engineer",
    expertise: ["Networking", "IT Support", "CompTIA"],
    certifications: ["CompTIA Network+", "Cisco CCNA"],
    experience: "8+ years in enterprise networking and IT operations",
  },
  {
    fullName: "Ma Hnin Thiri",
    slug: "hnin-thiri",
    jobTitle: "Cybersecurity Awareness Trainer",
    expertise: ["Cybersecurity", "Digital Safety", "Security Policy"],
    certifications: ["Security+", "Google Cybersecurity Certificate"],
    experience: "6+ years helping teams build safe digital habits",
  },
  {
    fullName: "Ko Ye Lin",
    slug: "ye-lin",
    jobTitle: "AI Productivity Consultant",
    expertise: ["AI Tools", "Automation", "Prompting"],
    certifications: ["Microsoft AI Fundamentals"],
    experience: "5+ years delivering productivity training for businesses",
  },
  {
    fullName: "Ma Phyu Phyu",
    slug: "phyu-phyu",
    jobTitle: "Web Development Instructor",
    expertise: ["HTML", "CSS", "JavaScript", "React"],
    certifications: ["Meta Front-End Developer"],
    experience: "7+ years building websites and training junior developers",
  },
  {
    fullName: "Ko Thant Zin",
    slug: "thant-zin",
    jobTitle: "IT Career Coach",
    expertise: ["Career Planning", "Interview", "Resume"],
    certifications: ["Career Development Facilitator"],
    experience: "9+ years mentoring IT job seekers",
  },
  {
    fullName: "Ma Ei Mon",
    slug: "ei-mon",
    jobTitle: "Office Applications Trainer",
    expertise: ["Excel", "Word", "PowerPoint", "Digital Literacy"],
    certifications: ["Microsoft Office Specialist"],
    experience: "10+ years teaching computer basics and office workflows",
  },
];

const articleBodies = [
  "ဒီဆောင်းပါးမှာ အခြေခံနားလည်ရမည့်အချက်တွေကို လက်တွေ့အသုံးချနိုင်အောင် ရှင်းပြထားပါတယ်။ အဆင့်လိုက်စစ်ဆေးပြီး သင့်ရဲ့နေ့စဉ်နည်းပညာအသုံးပြုမှုကို ပိုမိုလုံခြုံ၊ မြန်ဆန်၊ ထိရောက်အောင် ပြုလုပ်နိုင်ပါတယ်။",
  "စတင်လေ့လာသူများအတွက် အရေးကြီးဆုံးက မူလအခြေခံကိုမှန်မှန်ကန်ကန်သိခြင်းဖြစ်ပါတယ်။ အချက်တစ်ချက်ချင်းစီကို သေချာလုပ်ဆောင်ပါက အချိန်ကုန်သက်သာပြီး ပြဿနာဖြေရှင်းနိုင်စွမ်းလည်း မြင့်တက်လာပါမယ်။",
];

export const articles = [
  "ကွန်ပျူတာ နှေးနေရင် ဒီ ၅ ချက် စစ်ပါ",
  "Password လုံခြုံအောင် ဘယ်လိုထားမလဲ",
  "Public Wi-Fi သုံးတဲ့အခါ သတိထားရမယ့်အချက်များ",
  "Scam Message တွေကို ဘယ်လိုခွဲခြားမလဲ",
  "ဖုန်း Battery မြန်မြန်ကုန်ရတဲ့အကြောင်းရင်းများ",
  "AI ကို နေ့စဉ်အလုပ်မှာ ဘယ်လိုအသုံးချမလဲ",
  "Facebook Account Hack မခံရအောင် ဘယ်လိုကာကွယ်မလဲ",
  "IT Career စချင်သူ ဘာကနေစလေ့လာရမလဲ",
  "Phone Storage ပြည့်နေရင် ဘာလုပ်ရမလဲ",
  "Wi-Fi နှေးနေရင် စစ်ဆေးရမယ့်အချက်များ",
  "Networking အခြေခံကို ဘယ်လိုစလေ့လာမလဲ",
  "Cybersecurity Career အတွက် လိုအပ်တဲ့ Skills များ",
].map((title, index) => ({
  title,
  slug: `article-${index + 1}`,
  excerpt: `${title} ဆိုတဲ့အကြောင်းအရာကို မြန်မာလို ရိုးရှင်းပြီး လက်တွေ့ကျကျ လေ့လာနိုင်ရန် ပြင်ဆင်ထားပါတယ်။`,
  content: `${articleBodies[index % 2]}\n\n## အရေးကြီးသော အချက်များ\n\n- အခြေခံ setting များကို စစ်ဆေးပါ\n- လုံခြုံရေးနှင့် privacy ကို ဦးစားပေးပါ\n- မသေချာသည့် link များကို မဖွင့်ပါနှင့်\n- Backup နှင့် update များကို ပုံမှန်ပြုလုပ်ပါ\n\n## လက်တွေ့အသုံးချရန်\n\nဒီနေ့ကစပြီး အနည်းဆုံး အချက်တစ်ချက်ကို သင့် device သို့မဟုတ် အလုပ်လုပ်ငန်းစဉ်ထဲမှာ စမ်းသပ်အသုံးချပါ။`,
  categorySlug: articleCategories[index % articleCategories.length].slug,
  tags: ["မြန်မာလို IT", "21CT", index % 2 === 0 ? "Beginner" : "Security"],
  featured: index < 4,
  readingTime: 4 + (index % 4),
  views: 1200 - index * 57,
}));

export const courses = [
  ["Computer Basic Course", "computer-basic-course", "Computer Basics", "BEGINNER", "Ma Ei Mon"],
  ["Networking Fundamentals", "networking-fundamentals", "Networking", "BEGINNER", "Ko Aung Min"],
  ["Cybersecurity Awareness", "cybersecurity-awareness", "Cybersecurity", "BEGINNER", "Ma Hnin Thiri"],
  ["CompTIA Network+ Preparation", "comptia-network-plus", "Networking", "INTERMEDIATE", "Ko Aung Min"],
  ["IT Support Technician Training", "it-support-technician", "IT Support", "INTERMEDIATE", "Ko Aung Min"],
  ["AI Tools for Work and Business", "ai-tools-for-work", "Artificial Intelligence", "BEGINNER", "Ko Ye Lin"],
  ["Web Development Fundamentals", "web-development-fundamentals", "Web Development", "BEGINNER", "Ma Phyu Phyu"],
  ["IT Career and Interview Preparation", "it-career-interview", "Career Preparation", "BEGINNER", "Ko Thant Zin"],
].map(([title, slug, category, level, instructor], index) => ({
  title,
  slug,
  category,
  level,
  instructor,
  shortDescription:
    "လက်တွေ့လုပ်ငန်းခွင်မှာ အသုံးချနိုင်မည့် အခြေခံမှအလယ်အလတ်အဆင့် IT သင်တန်း။",
  fullDescription:
    "သင်တန်းသားများအတွက် theory နည်းနည်း၊ practice များများ သင်ကြားပြီး portfolio, troubleshooting mindset နှင့် career readiness တို့ကို ထည့်သွင်းပေးထားသည်။",
  duration: index % 2 === 0 ? "6 weeks" : "8 weeks",
  deliveryType: index % 3 === 0 ? "HYBRID" : index % 3 === 1 ? "ONLINE_LIVE" : "IN_PERSON",
  price: index === 0 ? 0 : 150000 + index * 25000,
  discountPrice: index > 1 ? 120000 + index * 20000 : null,
  featured: index < 4,
  outcomes: [
    "အခြေခံ concept များကို မြန်မာလို နားလည်နိုင်မည်",
    "လက်တွေ့ lab များလုပ်နိုင်မည်",
    "IT career အတွက် next step ကို သိနိုင်မည်",
  ],
  requirements: ["Computer သို့မဟုတ် smartphone", "Internet connection", "လေ့လာလိုစိတ်"],
  targetAudience: ["ကျောင်းသား/ကျောင်းသူများ", "အလုပ်ရှာနေသူများ", "Career change လုပ်ချင်သူများ"],
}));

export const testimonials = [
  "မြန်မာလိုရှင်းပြတာကြောင့် နားလည်လွယ်ပြီး လက်တွေ့လုပ်ကြည့်နိုင်ခဲ့ပါတယ်။",
  "IT career စဖို့ ဘာလုပ်ရမလဲဆိုတာ အခုမှ သေချာမြင်လာတယ်။",
  "Class schedule နဲ့ material တွေ စနစ်တကျရှိလို့ အရမ်းအဆင်ပြေပါတယ်။",
  "Cybersecurity awareness ကို မိသားစုနဲ့ပါ ပြန်မျှဝေနိုင်ခဲ့ပါတယ်။",
  "Instructor တွေက professional ဖြစ်ပြီး မေးခွန်းတိုင်းကို စိတ်ရှည်ရှည်ဖြေပါတယ်။",
  "AI tools ကို office work မှာနေ့တိုင်းအသုံးချနိုင်လာတယ်။",
  "Networking basics ကို အခြေခံကနေ lab နဲ့သင်လို့ ယုံကြည်မှုတက်လာပါတယ်။",
  "Course fee နဲ့ရတဲ့ value ကတန်ပါတယ်။",
  "Beginner အတွက် မရှက်ဘဲမေးနိုင်တဲ့ learning environment ရှိပါတယ်။",
  "Interview preparation section က အလုပ်လျှောက်ရာမှာ အထောက်အကူဖြစ်ပါတယ်။",
  "21CT page မှာဖတ်တဲ့ article တွေကတိုတိုနဲ့အသုံးဝင်ပါတယ်။",
  "Admin support က မြန်ပြီး enrollment process ကရှင်းပါတယ်။",
].map((body, index) => ({
  studentName: ["Aye Chan", "Myo Min", "Su Hlaing", "Kyaw Zin"][index % 4],
  rating: 5 - (index % 2),
  body,
}));
