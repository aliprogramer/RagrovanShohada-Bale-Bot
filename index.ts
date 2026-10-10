import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
const baleToken = Deno.env.get("BALE_BOT_TOKEN")!;

const BOT_USERNAME = "Rahrovan_sh_bot";

const supabase = createClient(supabaseUrl, serviceKey);

const headers = {
  "Content-Type": "application/json",
};

/* =========================================================
   BALE
   ========================================================= */

async function sendMessage(
  chatId: string,
  text: string,
  keyboard?: unknown,
) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };

  if (keyboard) {
    body.reply_markup = keyboard;
  }

  try {
    await fetch(
      `https://tapi.bale.ai/bot${baleToken}/sendMessage`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      },
    );
  } catch (error) {
    console.error("Bale sendMessage error:", error);
  }
}

/* =========================================================
   MENUS
   ========================================================= */

function mainMenu(role: string) {
  if (role === "admin") {
    return {
      keyboard: [
        [{ text: "👥 مدیریت کاربران" }],
        [{ text: "🎯 مأموریت‌ها" }, { text: "🏆 رتبه‌بندی" }],
        [{ text: "🎁 جوایز" }, { text: "📊 گزارش‌ها" }],
        [{ text: "⚙️ تنظیمات" }],
      ],
      resize_keyboard: true,
    };
  }

  if (role === "coach") {
    return {
      keyboard: [
        [{ text: "🎓 متربی‌های من" }],
        [
          { text: "🎯 مأموریت‌ها" },
          { text: "⏳ بررسی فعالیت‌ها" },
        ],
        [
          { text: "🏆 رتبه‌بندی" },
          { text: "📊 گزارش من" },
        ],
        [{ text: "👤 پروفایل" }],
      ],
      resize_keyboard: true,
    };
  }

  return {
    keyboard: [
      [{ text: "🎯 مأموریت‌های من" }],
      [
        { text: "⭐ امتیاز من" },
        { text: "🧭 مسیر رشد من" },
        { text: "🏆 رتبه‌بندی" },
      ],
      [
        { text: "🎖️ نشان‌های من" },
        { text: "🎁 جوایز" },
      ],
      [{ text: "👤 پروفایل" }],
    ],
    resize_keyboard: true,
  };
}

function usersMenu() {
  return {
    keyboard: [
      [
        { text: "👨‍🏫 مربی‌ها" },
        { text: "🎓 متربی‌ها" },
      ],
      [{ text: "➕ افزودن مربی" }],
      [{ text: "📋 همه کاربران" }],
      [{ text: "⚙️ عملیات کاربر" }],
      [{ text: "🔗 مدیریت مربی و متربی" }],
      [{ text: "🔙 بازگشت" }],
    ],
    resize_keyboard: true,
  };
}

function coachMenu() {
  return {
    keyboard: [
      [{ text: "➕ افزودن متربی" }],
      [{ text: "📋 فهرست متربی‌های من" }],
      [{ text: "🔙 بازگشت" }],
    ],
    resize_keyboard: true,
  };
}

function coachMissionMenu() {
  return {
    keyboard: [
      [{ text: "➕ ایجاد مأموریت" }],
      [{ text: "📋 مأموریت‌های من" }],
      [{ text: "📦 آرشیو مأموریت‌ها" }],
      [{ text: "🔙 بازگشت" }],
    ],
    resize_keyboard: true,
  };
}

function traineeMissionMenu() {
  return {
    keyboard: [
      [{ text: "📋 مأموریت‌های فعال" }],
      [{ text: "⏳ فعالیت‌های من" }],
      [{ text: "🔙 بازگشت" }],
    ],
    resize_keyboard: true,
  };
}

function adminMissionMenu() {
  return {
    keyboard: [
      [{ text: "📋 مشاهده مأموریت‌ها" }],
      [{ text: "📊 گزارش مأموریت‌ها" }],
      [{ text: "🔙 بازگشت" }],
    ],
    resize_keyboard: true,
  };
}

/* =========================================================
   HELPERS
   ========================================================= */

function inviteKeyboard(inviteCode: string) {
  const link =
    `https://ble.ir/${BOT_USERNAME}?start=${encodeURIComponent(inviteCode)}`;

  return {
    inline_keyboard: [
      [
        {
          text: "🔗 فعال‌سازی حساب",
          url: link,
        },
      ],
    ],
  };
}

function generateInviteCode(): string {
  return Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
}

function normalizeMobile(value: string): string | null {
  let mobile = value
    .trim()
    .replace(/[^\d+]/g, "");

  if (mobile.startsWith("+98")) {
    mobile = "0" + mobile.slice(3);
  }

  if (mobile.startsWith("98")) {
    mobile = "0" + mobile.slice(2);
  }

  if (/^09\d{9}$/.test(mobile)) {
    return mobile;
  }

  return null;
}

async function generateUniqueInviteCode(): Promise<string | null> {
  for (let i = 0; i < 10; i++) {
    const candidate = generateInviteCode();

    const { data: found } = await supabase
      .from("kanoon_users")
      .select("id")
      .eq("invite_code", candidate)
      .maybeSingle();

    if (!found) {
      return candidate;
    }
  }

  return null;
}

function cleanText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function missionCode(id: number): string {
  return `M${String(id + 99).padStart(3, "0")}`;
}

function missionIdFromCode(value: string): number | null {
  const match = value.trim().match(/^M(\d{3})$/i);

  if (!match) {
    return null;
  }

  const codeNumber = Number(match[1]);

  if (codeNumber < 100) {
    return null;
  }

  return codeNumber - 99;
}


const ASSIGN_PAGE_SIZE = 6;

function missionAssignModeKeyboard() {
  return {
    keyboard: [
      [{ text: "👤 یک متربی" }, { text: "👥 چند متربی" }],
      [{ text: "👥 همه متربی‌های فعال" }],
      [{ text: "🔙 بازگشت" }],
    ],
    resize_keyboard: true,
  };
}

function missionListKeyboard(
  missions: Array<{ id: number; title: string }>,
  page = 0,
) {
  const start = page * ASSIGN_PAGE_SIZE;
  const items = missions.slice(start, start + ASSIGN_PAGE_SIZE);
  const keyboard: Array<Array<{ text: string }>> = [];

  for (let i = 0; i < items.length; i += 2) {
    const row: Array<{ text: string }> = [];
    for (const mission of items.slice(i, i + 2)) {
      row.push({
        text: `🎯 ${missionCode(mission.id)} | ${mission.title}`,
      });
    }
    keyboard.push(row);
  }

  const nav: Array<{ text: string }> = [];
  if (page > 0) nav.push({ text: "⬅️ صفحه قبل" });
  if (start + ASSIGN_PAGE_SIZE < missions.length) nav.push({ text: "➡️ صفحه بعد" });
  if (nav.length) keyboard.push(nav);
  keyboard.push([{ text: "🔙 بازگشت" }]);

  return { keyboard, resize_keyboard: true };
}

function reviewSubmissionKeyboard(
  submissions: Array<{ id: number; traineeName: string }>,
) {
  const keyboard: Array<Array<{ text: string }>> = [];

  for (const submission of submissions) {
    keyboard.push([
      { text: `🔎 #${submission.id} | ${submission.traineeName}` },
    ]);
  }

  keyboard.push([{ text: "🔙 بازگشت" }]);
  return { keyboard, resize_keyboard: true };
}

function traineeMissionSelectionKeyboard(
  missions: Array<{ id: number; title: string }>,
  page = 0,
) {
  const totalPages = Math.max(1, Math.ceil(missions.length / ASSIGN_PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = safePage * ASSIGN_PAGE_SIZE;
  const items = missions.slice(start, start + ASSIGN_PAGE_SIZE);
  const keyboard: Array<Array<{ text: string }>> = [];

  for (const mission of items) {
    keyboard.push([
      { text: `🎯 ${missionCode(mission.id)} | ${mission.title}` },
    ]);
  }

  const nav: Array<{ text: string }> = [];
  if (safePage > 0) nav.push({ text: "⬅️ صفحه قبل" });
  if (safePage < totalPages - 1) nav.push({ text: "➡️ صفحه بعد" });
  if (nav.length) keyboard.push(nav);
  keyboard.push([{ text: "🔙 بازگشت" }]);

  return { keyboard, resize_keyboard: true };
}

function missionManageKeyboard() {
  return {
    keyboard: [
      [{ text: "👤 واگذاری مأموریت" }],
      [{ text: "⏹️ پایان مأموریت" }],
      [{ text: "🔙 بازگشت" }],
    ],
    resize_keyboard: true,
  };
}

function missionAssignmentKeyboard(
  trainees: Array<{ id: string; display_name: string }>,
  page: number,
  selectedIndexes: number[] = [],
  multi = false,
) {
  const totalPages = Math.max(1, Math.ceil(trainees.length / ASSIGN_PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = safePage * ASSIGN_PAGE_SIZE;
  const items = trainees.slice(start, start + ASSIGN_PAGE_SIZE);
  const keyboard: Array<Array<{ text: string }>> = [];

  for (let i = 0; i < items.length; i += 2) {
    const row: Array<{ text: string }> = [];
    for (const item of items.slice(i, i + 2)) {
      const absoluteIndex = start + i + (row.length + 0);
      const selected = selectedIndexes.includes(absoluteIndex + 1);
      row.push({
        text: `${selected ? "✅" : "⬜"} ${absoluteIndex + 1}. ${item.display_name}`,
      });
    }
    keyboard.push(row);
  }

  const nav: Array<{ text: string }> = [];
  if (safePage > 0) nav.push({ text: "⬅️ صفحه قبل" });
  if (safePage < totalPages - 1) nav.push({ text: "➡️ صفحه بعد" });
  if (nav.length) keyboard.push(nav);

  if (multi) {
    keyboard.push([
      { text: "👥 همه متربی‌های فعال" },
      { text: "✅ تأیید انتخاب" },
    ]);
  }
  keyboard.push([{ text: "🔙 بازگشت" }]);

  return { keyboard, resize_keyboard: true };
}

function navigationButtonTexts(): Set<string> {
  return new Set([
    "👥 مدیریت کاربران", "🎯 مأموریت‌ها", "🏆 رتبه‌بندی", "🎁 جوایز", "📊 گزارش‌ها", "⚙️ تنظیمات",
    "👨‍🏫 مربی‌ها", "🎓 متربی‌ها", "➕ افزودن مربی", "📋 همه کاربران", "⚙️ عملیات کاربر", "🔗 مدیریت مربی و متربی",
    "🎓 متربی‌های من", "📋 فهرست متربی‌های من", "➕ افزودن متربی",
    "➕ ایجاد مأموریت", "📋 مأموریت‌های من", "📦 آرشیو مأموریت‌ها", "⏳ فعالیت‌های در انتظار بررسی", "⏳ بررسی فعالیت‌ها", "👤 واگذاری مأموریت", "⏹️ پایان مأموریت",
    "📋 مشاهده مأموریت‌ها", "📊 گزارش مأموریت‌ها", "🎯 مأموریت‌های من", "📋 مأموریت‌های فعال", "⏳ فعالیت‌های من",
    "⭐ امتیاز من", "🧭 مسیر رشد من", "🎖️ نشان‌های من", "👤 پروفایل", "📊 گزارش من",
    "🎁 جوایز", "🎁 فهرست جوایز", "🎟️ جوایز دریافتی و درخواست‌ها", "➕ افزودن جایزه", "📋 فهرست جوایز", "🎟️ درخواست‌های جایزه",
  ]);
}

async function awardBadges(userId: string, xp: number) {
  const defaults = [
    { name:"شروع قدرتمند", description:"رسیدن به 100 امتیاز", icon:"🌱", xp_required:100 },
    { name:"رهرو پرتلاش", description:"رسیدن به 250 امتیاز", icon:"🔥", xp_required:250 },
    { name:"قدم‌های استوار", description:"رسیدن به 500 امتیاز", icon:"🏅", xp_required:500 },
    { name:"الگوی جمع", description:"رسیدن به 1000 امتیاز", icon:"🏆", xp_required:1000 },
  ];
  for (const badge of defaults) {
    await supabase.from("badges").upsert(badge, { onConflict: "name" });
  }
  const { data: badges } = await supabase.from("badges").select("id,xp_required").lte("xp_required", xp);
  if (!badges?.length) return;
  const { data: existing } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId);
  const existingIds = new Set((existing ?? []).map((x: any) => x.badge_id));
  const newRows = badges.filter((b: any) => !existingIds.has(b.id)).map((b: any) => ({ user_id: userId, badge_id: b.id }));
  if (newRows.length) await supabase.from("user_badges").upsert(newRows, { onConflict: "user_id,badge_id" });
}

async function notifyRewardReview(userId: string, title: string, status: "approved" | "rejected") {
  const { data: target } = await supabase.from("kanoon_users").select("bale_chat_id").eq("id", userId).maybeSingle();
  if (!target?.bale_chat_id) return;
  const message = status === "approved"
    ? `🎉 خبر خوب!\n\nدرخواست جایزه «${title}» توسط مدیر تأیید شد.\n\nامیدواریم از جایزه‌ات لذت ببری. 🌷`
    : `📌 نتیجه درخواست جایزه\n\nدرخواست «${title}» تأیید نشد.\n\nاگر امتیاز از حساب شما برای این درخواست رزرو شده بود، به موجودی شما برگردانده شد.`;
  await sendMessage(String(target.bale_chat_id), message, mainMenu("trainee"));
}

async function notifyMissionAssigned(
  traineeIds: string[],
  mission: { id: number; title: string; xp_reward: number },
) {
  if (traineeIds.length === 0) return;

  const { data: trainees } = await supabase
    .from("kanoon_users")
    .select("id, bale_chat_id, is_active")
    .in("id", traineeIds);

  for (const trainee of trainees ?? []) {
    if (!trainee.is_active || !trainee.bale_chat_id) continue;

    await sendMessage(
      String(trainee.bale_chat_id),
      `🎯 مأموریت تازه‌ای برای شما فعال شد.\n\n` +
      `━━━━━━━━━━━━━━\n` +
      `🎯 ${mission.title}\n` +
      `⭐ پاداش: ${mission.xp_reward} امتیاز\n` +
      `🆔 ${missionCode(mission.id)}\n` +
      `━━━━━━━━━━━━━━\n\n` +
      `برای دیدن جزئیات و ثبت فعالیت، روی «🎯 مأموریت‌های من» بزنید.`,
      mainMenu("trainee"),
    );
  }
}

async function notifyCoachOfSubmission(
  trainee: { id: string; display_name: string; coach_id: string | null },
  mission: { id: number; title: string; xp_reward: number },
  proofText: string,
) {
  if (!trainee.coach_id) return;

  const { data: coach } = await supabase
    .from("kanoon_users")
    .select("bale_chat_id, is_active")
    .eq("id", trainee.coach_id)
    .eq("role", "coach")
    .maybeSingle();

  if (!coach?.is_active || !coach.bale_chat_id) return;

  await sendMessage(
    String(coach.bale_chat_id),
    `🔔 فعالیت جدید برای بررسی\n\n` +
    `👤 متربی: ${trainee.display_name}\n` +
    `🎯 مأموریت: ${mission.title}\n` +
    `🆔 ${missionCode(mission.id)}\n` +
    `⭐ پاداش: ${mission.xp_reward} امتیاز\n\n` +
    `📝 گزارش متربی:\n${proofText || "بدون توضیح"}\n\n` +
    `👇 برای بررسی، «⏳ بررسی فعالیت‌ها» را بزنید.`,
    mainMenu("coach"),
  );
}

async function notifyTraineeReview(
  trainee: { id: string; display_name: string; bale_chat_id: string | null },
  mission: { id: number; title: string; xp_reward: number },
  action: "approved" | "rejected",
) {
  if (!trainee.bale_chat_id) return;

  const { data: fresh } = await supabase
    .from("kanoon_users")
    .select("xp, level")
    .eq("id", trainee.id)
    .maybeSingle();

  const message = action === "approved"
    ? `🎉 آفرین ${trainee.display_name}!\n\n` +
      `فعالیت شما با موفقیت توسط مربی تأیید شد.\n\n` +
      `━━━━━━━━━━━━━━\n` +
      `🎯 ${mission.title}\n` +
      `⭐ +${mission.xp_reward} امتیاز\n` +
      `💎 مجموع امتیاز: ${fresh?.xp ?? 0}\n` +
      `⚡ سطح فعلی: ${fresh?.level ?? 1}\n` +
      `🏅 ${levelInfo(fresh?.level ?? 1).icon} ${levelInfo(fresh?.level ?? 1).title}\n` +
      `━━━━━━━━━━━━━━\n\n` +
      `ادامه بده؛ هر قدم کوچک، یک قدم به رتبه‌های بالاتر است. 🌱`
    : `📌 نتیجه بررسی فعالیت\n\n` +
      `فعالیت شما برای «${mission.title}» این بار تأیید نشد.\n\n` +
      `نگران نباشید؛ توضیحات مأموریت را دوباره بررسی کنید و در صورت نیاز فعالیت را با گزارش کامل‌تر ارسال کنید. 💪`;

  await sendMessage(
    String(trainee.bale_chat_id),
    message,
    mainMenu("trainee"),
  );
}

const LEVELS = [
  { level: 1, title: "آغاز راه", icon: "🌱" },
  { level: 2, title: "قدم اول", icon: "🚶" },
  { level: 3, title: "رهرو", icon: "🌿" },
  { level: 4, title: "پرتلاش", icon: "🔥" },
  { level: 5, title: "استوار", icon: "🛡️" },
  { level: 6, title: "پیشرو", icon: "⭐" },
  { level: 7, title: "اثرگذار", icon: "✨" },
  { level: 8, title: "الگو", icon: "🏅" },
  { level: 9, title: "قهرمان مسیر", icon: "🏆" },
  { level: 10, title: "رهرو ممتاز", icon: "👑" },
];

function levelInfo(level: number) {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, level - 1))] ?? LEVELS[0];
}

function levelProgress(xp: number) {
  const safeXp = Math.max(0, xp);
  const level = Math.min(LEVELS.length, Math.floor(safeXp / 100) + 1);
  const currentBase = (level - 1) * 100;
  const nextTarget = level >= LEVELS.length ? null : level * 100;
  const progress = nextTarget === null
    ? 100
    : Math.max(0, Math.min(100, Math.round(((safeXp - currentBase) / 100) * 100)));
  return { level, currentBase, nextTarget, progress };
}

function progressBar(percent: number, width = 10) {
  const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function xpCard(user: { display_name: string; xp: number; level: number }) {
  const calculated = levelProgress(user.xp);
  const info = levelInfo(calculated.level);
  const remaining = calculated.nextTarget === null ? 0 : Math.max(0, calculated.nextTarget - user.xp);
  const levelText = `${info.icon} سطح ${calculated.level} — ${info.title}`;
  const targetText = calculated.nextTarget === null
    ? "🏁 بالاترین سطح مسیر را فتح کرده‌ای"
    : `🎯 ${remaining} امتیاز تا سطح ${calculated.level + 1}`;
  return [
    `⭐ امتیاز کل: ${user.xp}`,
    `🏅 ${levelText}`,
    `📈 ${progressBar(calculated.progress)} ${calculated.progress}%`,
    targetText,
  ].join("\n");
}

function levelPathCard(xp: number) {
  const calculated = levelProgress(xp);
  const lines = LEVELS.map((item) => {
    const state = item.level < calculated.level ? "✅" : item.level === calculated.level ? "👉" : "🔒";
    const target = (item.level - 1) * 100;
    return `${state} ${item.icon} سطح ${item.level} — ${item.title} (${target} امتیاز)`;
  });
  return `🧭 مسیر رشد من\n\n${lines.join("\n")}\n\n📍 جایگاه فعلی: سطح ${calculated.level} از ${LEVELS.length}\n📊 ${progressBar(calculated.progress)} ${calculated.progress}%`;
}

function userOperationKeyboard(target: { is_active: boolean; role: string }) {
  const toggle = target.is_active ? "⛔ غیرفعال کردن" : "✅ فعال کردن";
  const rows: Array<Array<{ text: string }>> = [
    [{ text: toggle }, { text: "🔄 بازنشانی اتصال Bale" }],
  ];
  if (target.role === "trainee") rows.push([{ text: "🔗 تغییر مربی" }]);
  rows.push([{ text: "❌ لغو" }]);
  return { keyboard: rows, resize_keyboard: true };
}

function rewardsMenu(role: string) {
  if (role === "admin") {
    return {
      keyboard: [
        [{ text: "➕ افزودن جایزه" }, { text: "📋 فهرست جوایز" }],
        [{ text: "🎟️ درخواست‌های جایزه" }],
        [{ text: "🔙 بازگشت" }],
      ], resize_keyboard: true,
    };
  }
  return {
    keyboard: [
      [{ text: "🎁 فهرست جوایز" }],
      [{ text: "🎟️ جوایز دریافتی و درخواست‌ها" }],
      [{ text: "🔙 بازگشت" }],
    ], resize_keyboard: true,
  };
}

function rewardListKeyboard(rewards: Array<{ id: number; title: string }>) {
  const keyboard: Array<Array<{ text: string }>> = [];
  for (const reward of rewards) keyboard.push([{ text: `🎁 #${reward.id} | ${reward.title}` }]);
  keyboard.push([{ text: "🔙 بازگشت" }]);
  return { keyboard, resize_keyboard: true };
}

function rewardReviewKeyboard(items: Array<{ id: number; name: string }>) {
  const keyboard: Array<Array<{ text: string }>> = [];
  for (const item of items) keyboard.push([{ text: `🎟️ #${item.id} | ${item.name}` }]);
  keyboard.push([{ text: "🔙 بازگشت" }]);
  return { keyboard, resize_keyboard: true };
}

function parseTemp(
  value: string | null,
): Record<string, string> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return parsed;
    }

    return {};
  } catch {
    return {};
  }
}

function tempJson(
  data: Record<string, string>,
): string {
  return JSON.stringify(data);
}

async function clearState(userId: string) {
  await supabase
    .from("kanoon_users")
    .update({
      bot_state: null,
      bot_temp_data: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

function roleText(role: string): string {
  if (role === "admin") {
    return "👑 مدیر اجرایی";
  }

  if (role === "coach") {
    return "👨‍🏫 مربی";
  }

  return "🎓 متربی";
}

/* =========================================================
   MAIN
   ========================================================= */

Deno.serve(async (req) => {
  try {
    /* =====================================================
       METHOD
       ===================================================== */

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method not allowed",
        }),
        {
          status: 405,
          headers,
        },
      );
    }

    /* =====================================================
       UPDATE
       ===================================================== */

    const update = await req.json();

    const message = update?.message;

    if (!message) {
      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    const chatId = String(
      message.chat?.id ?? "",
    );

    const text = String(
      message.text ?? "",
    ).trim();

    if (!chatId) {
      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       START / DEEP LINK
       ===================================================== */

    const startMatch =
      text.match(/^\/start(?:\s+(.+))?$/i);

    const isStart = !!startMatch;

    const startPayload =
      startMatch?.[1]?.trim() || null;

    /* =====================================================
       FIND CURRENT USER
       ===================================================== */

    let { data: user } =
      await supabase
        .from("kanoon_users")
        .select(`
          id,
          display_name,
          role,
          xp,
          level,
          is_active,
          registration_state,
          bot_state,
          bot_temp_data,
          mobile,
          invite_code,
          activation_status,
          coach_id
        `)
        .eq("bale_chat_id", chatId)
        .maybeSingle();

    /* =====================================================
       INVITE ACTIVATION
       ===================================================== */

    if (
      isStart &&
      startPayload
    ) {
      const { data: invitedUser } =
        await supabase
          .from("kanoon_users")
          .select(`
            id,
            display_name,
            role,
            activation_status,
            invite_code,
            coach_id
          `)
          .eq(
            "invite_code",
            startPayload,
          )
          .eq(
            "activation_status",
            "pending",
          )
          .maybeSingle();

      if (!invitedUser) {
        await sendMessage(
          chatId,
          "❌ لینک دعوت معتبر نیست یا قبلاً استفاده شده است.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      if (
        user &&
        user.id !== invitedUser.id
      ) {
        await sendMessage(
          chatId,
          "⚠️ این حساب Bale قبلاً به یک کاربر دیگر متصل شده است.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const { error } =
        await supabase
          .from("kanoon_users")
          .update({
            bale_chat_id: chatId,
            activation_status: "active",
            registration_state: "active",
            invite_code: null,
            bot_state: null,
            bot_temp_data: null,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            invitedUser.id,
          );

      if (error) {
        console.error(
          "Activation error:",
          error,
        );

        await sendMessage(
          chatId,
          "❌ فعال‌سازی حساب انجام نشد.\nلطفاً دوباره تلاش کنید.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      if (
        invitedUser.role ===
        "coach"
      ) {
        await sendMessage(
          chatId,
          `✅ حساب مربی شما با موفقیت فعال شد.\n\n👨‍🏫 ${invitedUser.display_name}\n\nبه حلقه‌های رهروان شهدا خوش آمدید. 🌱`,
          mainMenu("coach"),
        );
      } else {
        await sendMessage(
          chatId,
          `✅ حساب شما با موفقیت فعال شد.\n\n👤 ${invitedUser.display_name}\n\nبه حلقه‌های رهروان شهدا خوش آمدید. 🌱`,
          mainMenu("trainee"),
        );
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       NORMAL START
       ===================================================== */

    if (isStart) {
      if (user) {
        if (!user.is_active) {
          await sendMessage(
            chatId,
            "⛔ حساب شما غیرفعال است.",
          );

          return new Response(
            JSON.stringify({ ok: true }),
            { headers },
          );
        }

        if (
          user.activation_status ===
          "pending"
        ) {
          await sendMessage(
            chatId,
            "⏳ حساب شما هنوز فعال نشده است.\n\nلطفاً لینک دعوتی را که برای شما ارسال شده است باز کنید.",
          );

          return new Response(
            JSON.stringify({ ok: true }),
            { headers },
          );
        }

        await sendMessage(
          chatId,
          `سلام ${user.display_name} 👋\n\n⭐ امتیاز: ${user.xp} امتیاز\n⚡ سطح: ${user.level}\n\nبه حلقه‌های رهروان شهدا خوش آمدید.`,
          mainMenu(user.role),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      /* ===================================================
         NEW USER
         =================================================== */

      const { error } =
        await supabase
          .from("kanoon_users")
          .insert({
            bale_chat_id: chatId,
            display_name: "کاربر جدید",
            role: "trainee",
            xp: 0,
            level: 1,
            is_active: true,
            registration_state:
              "awaiting_name",
            activation_status:
              "active",
            bot_state: null,
            bot_temp_data: null,
          });

      if (error) {
        console.error(
          "Registration insert error:",
          error,
        );

        await sendMessage(
          chatId,
          "❌ خطایی در شروع ثبت‌نام رخ داد.\nلطفاً دوباره تلاش کنید.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await sendMessage(
        chatId,
        "👋 به حلقه‌های رهروان شهدا خوش آمدید.\n\nبرای ثبت‌نام، لطفاً نام و نام خانوادگی خود را ارسال کنید.",
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       UNKNOWN USER
       ===================================================== */

    if (!user) {
      await sendMessage(
        chatId,
        "ابتدا دستور /start را ارسال کنید.",
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       INACTIVE
       ===================================================== */

    if (!user.is_active) {
      await sendMessage(
        chatId,
        "⛔ حساب شما غیرفعال است.",
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       MANUAL INVITE CODE
       ===================================================== */

    if (
      user.activation_status ===
      "pending"
    ) {
      if (/^\d{6}$/.test(text)) {
        const {
          data: invitedUser,
        } = await supabase
          .from("kanoon_users")
          .select(`
            id,
            display_name,
            role
          `)
          .eq(
            "invite_code",
            text,
          )
          .eq(
            "activation_status",
            "pending",
          )
          .maybeSingle();

        if (!invitedUser) {
          await sendMessage(
            chatId,
            "❌ کد دعوت صحیح نیست یا قبلاً استفاده شده است.",
          );

          return new Response(
            JSON.stringify({ ok: true }),
            { headers },
          );
        }

        const { error } =
          await supabase
            .from("kanoon_users")
            .update({
              bale_chat_id: chatId,
              activation_status:
                "active",
              registration_state:
                "active",
              invite_code: null,
              bot_state: null,
              bot_temp_data: null,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              invitedUser.id,
            );

        if (error) {
          await sendMessage(
            chatId,
            "❌ فعال‌سازی انجام نشد.",
          );

          return new Response(
            JSON.stringify({ ok: true }),
            { headers },
          );
        }

        await sendMessage(
          chatId,
          `✅ حساب شما فعال شد.\n\n👤 ${invitedUser.display_name}`,
          mainMenu(
            invitedUser.role,
          ),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await sendMessage(
        chatId,
        "🔑 لطفاً کد دعوت ۶ رقمی یا لینک فعال‌سازی خود را استفاده کنید.",
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       REGISTRATION
       ===================================================== */

    if (
      user.registration_state ===
      "awaiting_name"
    ) {
      const name =
        cleanText(text);

      if (
        !name ||
        name.length < 2
      ) {
        await sendMessage(
          chatId,
          "لطفاً نام و نام خانوادگی معتبر خود را ارسال کنید.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const { error } =
        await supabase
          .from("kanoon_users")
          .update({
            display_name: name,
            registration_state:
              "active",
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            user.id,
          );

      if (error) {
        await sendMessage(
          chatId,
          "❌ ثبت‌نام انجام نشد.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await sendMessage(
        chatId,
        `🎉 خوش آمدی ${name}!\n\nبه «حلقه‌های رهروان شهدا» خوش آمدی. 🌱\nاز همین امروز می‌توانی مأموریت انجام بدهی، امتیاز بگیری و قدم‌به‌قدم پیشرفت کنی.\n\n⭐ امتیاز: 0\n⚡ سطح: 1\n\n👇 از منوی زیر شروع کن.`,
        mainMenu("trainee"),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       GLOBAL NAVIGATION — menu buttons always interrupt a state
       ===================================================== */

    if (
      navigationButtonTexts().has(text) &&
      text !== "🔙 بازگشت"
    ) {
      await clearState(user.id);
    }

    /* =====================================================
       GLOBAL BACK — works in every input/state
       ===================================================== */

    if (text === "🔙 بازگشت") {
      const state = user.bot_state ?? "";
      await clearState(user.id);

      if (user.role === "admin" && (
        state.startsWith("add_coach_") ||
        state.startsWith("admin_")
      )) {
        await sendMessage(chatId, "👥 مدیریت کاربران", usersMenu());
      } else if (user.role === "coach" && (
        state.startsWith("add_trainee_")
      )) {
        await sendMessage(chatId, "🎓 مدیریت متربی‌ها", coachMenu());
      } else if (user.role === "coach" && (
        state.startsWith("mission_") ||
        state.startsWith("review_")
      )) {
        await sendMessage(chatId, "🎯 مدیریت مأموریت‌ها", coachMissionMenu());
      } else if (user.role === "trainee" && state.startsWith("trainee_submit_")) {
        await sendMessage(chatId, "🎯 مأموریت‌های من", traineeMissionMenu());
      } else {
        await sendMessage(chatId, "منوی اصلی:", mainMenu(user.role));
      }

      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    /* =====================================================
       ADMIN → USER MANAGEMENT
       ===================================================== */

    if (
      user.role === "admin" &&
      text === "👥 مدیریت کاربران"
    ) {
      await clearState(user.id);

      await sendMessage(
        chatId,
        "👥 مدیریت کاربران\n\nیک گزینه را انتخاب کنید:",
        usersMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → COACH LIST
       ===================================================== */

    if (
      user.role === "admin" &&
      text === "👨‍🏫 مربی‌ها"
    ) {
      const {
        data: coaches,
        error,
      } = await supabase
        .from("kanoon_users")
        .select(`
          display_name,
          mobile,
          xp,
          level,
          activation_status,
          is_active,
          bale_chat_id
        `)
        .eq(
          "role",
          "coach",
        )
        .order(
          "display_name",
          { ascending: true },
        );

      if (error) {
        await sendMessage(
          chatId,
          "❌ دریافت فهرست مربی‌ها انجام نشد.",
          usersMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      if (
        !coaches ||
        coaches.length === 0
      ) {
        await sendMessage(
          chatId,
          "👨‍🏫 هنوز مربی‌ای ثبت نشده است.",
          usersMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      let output =
        "👨‍🏫 فهرست مربی‌ها\n\n";

      coaches.forEach(
        (coach, index) => {
          const status =
            coach.activation_status ===
              "active" &&
            coach.is_active
              ? "🟢 فعال"
              : "🟡 غیرفعال/در انتظار";

          output +=
            `${index + 1}. ${coach.display_name}\n` +
            `📱 ${coach.mobile ?? "-"}\n` +
            `⭐ ${coach.xp ?? 0} امتیاز\n` +
            `⚡ سطح ${coach.level ?? 1}\n` +
            `${status}\n\n`;
        },
      );

      await sendMessage(
        chatId,
        output,
        usersMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → TRAINEE LIST
       ===================================================== */

    if (
      user.role === "admin" &&
      text === "🎓 متربی‌ها"
    ) {
      const {
        data: trainees,
        error,
      } = await supabase
        .from("kanoon_users")
        .select(`
          id,
          display_name,
          mobile,
          xp,
          level,
          activation_status,
          is_active,
          coach_id
        `)
        .eq(
          "role",
          "trainee",
        )
        .order(
          "display_name",
          { ascending: true },
        );

      if (error) {
        await sendMessage(
          chatId,
          "❌ دریافت فهرست متربی‌ها انجام نشد.",
          usersMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      if (
        !trainees ||
        trainees.length === 0
      ) {
        await sendMessage(
          chatId,
          "🎓 هنوز متربی‌ای ثبت نشده است.",
          usersMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const coachIds = [
        ...new Set(
          trainees
            .map(
              (item) =>
                item.coach_id,
            )
            .filter(Boolean),
        ),
      ];

      const coachMap:
        Record<string, string> = {};

      if (coachIds.length > 0) {
        const {
          data: coaches,
        } = await supabase
          .from("kanoon_users")
          .select(`
            id,
            display_name
          `)
          .in(
            "id",
            coachIds,
          );

        for (
          const coach of
            coaches ?? []
        ) {
          coachMap[coach.id] =
            coach.display_name;
        }
      }

      let output =
        "🎓 فهرست متربی‌ها\n\n";

      trainees.forEach(
        (trainee, index) => {
          const status =
            trainee.activation_status ===
              "active" &&
            trainee.is_active
              ? "🟢 فعال"
              : "🟡 در انتظار";

          const coachName =
            trainee.coach_id
              ? (
                  coachMap[
                    trainee.coach_id
                  ] ??
                  "نامشخص"
                )
              : "بدون مربی";

          output +=
            `${index + 1}. ${trainee.display_name}\n` +
            `📱 ${trainee.mobile ?? "-"}\n` +
            `👨‍🏫 ${coachName}\n` +
            `⭐ ${trainee.xp} امتیاز | ⚡ سطح ${trainee.level}\n` +
            `${status}\n\n`;
        },
      );

      await sendMessage(
        chatId,
        output,
        usersMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → ALL USERS
       ===================================================== */

    if (
      user.role === "admin" &&
      text === "📋 همه کاربران"
    ) {
      const {
        data: users,
        error,
      } = await supabase
        .from("kanoon_users")
        .select(`
          display_name,
          role,
          mobile,
          xp,
          level,
          activation_status,
          is_active
        `)
        .order(
          "created_at",
          { ascending: false },
        );

      if (error) {
        await sendMessage(
          chatId,
          "❌ دریافت کاربران انجام نشد.",
          usersMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      let output =
        "📋 همه کاربران\n\n";

      (
        users ?? []
      ).forEach(
        (item, index) => {
          const status =
            item.activation_status ===
              "active" &&
            item.is_active
              ? "🟢"
              : "🟡";

          output +=
            `${index + 1}. ${roleText(item.role)} ${item.display_name}\n` +
            `📱 ${item.mobile ?? "-"}\n` +
            `${status} | ⭐ ${item.xp} امتیاز | ⚡ سطح ${item.level}\n\n`;
        },
      );

      if (
        !users ||
        users.length === 0
      ) {
        output =
          "📋 کاربری ثبت نشده است.";
      }

      await sendMessage(
        chatId,
        output,
        usersMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → COACH / TRAINEE RELATION
       ===================================================== */

    if (
      user.role === "admin" &&
      text ===
        "🔗 مدیریت مربی و متربی"
    ) {
      const {
        data: trainees,
        error,
      } = await supabase
        .from("kanoon_users")
        .select(`
          display_name,
          coach_id
        `)
        .eq(
          "role",
          "trainee",
        )
        .order(
          "display_name",
          { ascending: true },
        );

      if (error) {
        await sendMessage(
          chatId,
          "❌ دریافت ارتباط مربی و متربی انجام نشد.",
          usersMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const coachIds = [
        ...new Set(
          (
            trainees ?? []
          )
            .map(
              (item) =>
                item.coach_id,
            )
            .filter(Boolean),
        ),
      ];

      const coachMap:
        Record<string, string> = {};

      if (coachIds.length > 0) {
        const {
          data: coaches,
        } = await supabase
          .from("kanoon_users")
          .select(`
            id,
            display_name
          `)
          .in(
            "id",
            coachIds,
          );

        for (
          const coach of
            coaches ?? []
        ) {
          coachMap[coach.id] =
            coach.display_name;
        }
      }

      let output =
        "🔗 ارتباط مربی و متربی\n\n";

      (
        trainees ?? []
      ).forEach(
        (trainee, index) => {
          const coachName =
            trainee.coach_id
              ? (
                  coachMap[
                    trainee.coach_id
                  ] ??
                  "نامشخص"
                )
              : "بدون مربی";

          output +=
            `${index + 1}. ${trainee.display_name}\n` +
            `👨‍🏫 ${coachName}\n\n`;
        },
      );

      if (
        !trainees ||
        trainees.length === 0
      ) {
        output =
          "هنوز متربی‌ای ثبت نشده است.";
      }

      await sendMessage(
        chatId,
        output,
        usersMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → USER OPERATIONS
       ===================================================== */

    if (user.role === "admin" && text === "⚙️ عملیات کاربر") {
      await supabase.from("kanoon_users").update({ bot_state: "admin_user_manage_mobile", bot_temp_data: null }).eq("id", user.id);
      await sendMessage(chatId, "⚙️ عملیات کاربر\n\nشماره موبایل کاربر را ارسال کنید:", usersMenu());
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && user.bot_state === "admin_user_manage_mobile") {
      const mobile = normalizeMobile(text);
      if (!mobile) {
        await sendMessage(chatId, "❌ شماره موبایل معتبر نیست.\nمثال: 09121234567");
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      const { data: target } = await supabase.from("kanoon_users").select("id,display_name,role,mobile,is_active,activation_status,coach_id").eq("mobile", mobile).maybeSingle();
      if (!target) {
        await sendMessage(chatId, "❌ کاربری با این شماره پیدا نشد.", usersMenu());
        await clearState(user.id);
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      if (target.id === user.id) {
        await sendMessage(chatId, "⛔ نمی‌توانید حساب خودتان را مدیریت یا غیرفعال کنید.", usersMenu());
        await clearState(user.id);
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      await supabase.from("kanoon_users").update({ bot_state: "admin_user_manage_action", bot_temp_data: tempJson({ targetId: target.id, mobile }) }).eq("id", user.id);
      await sendMessage(chatId, `👤 ${target.display_name}\n${roleText(target.role)}\n📱 ${target.mobile ?? "-"}\n${target.is_active ? "🟢 فعال" : "🔴 غیرفعال"}\n\nعملیات را انتخاب کنید:`, userOperationKeyboard(target));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && user.bot_state === "admin_user_manage_action") {
      const data = parseTemp(user.bot_temp_data);
      const targetId = data.targetId;
      if (text === "❌ لغو") { await clearState(user.id); await sendMessage(chatId, "لغو شد.", usersMenu()); return new Response(JSON.stringify({ ok: true }), { headers }); }
      const { data: target } = await supabase.from("kanoon_users").select("id,display_name,role,mobile,is_active,activation_status").eq("id", targetId).maybeSingle();
      if (!target) { await clearState(user.id); await sendMessage(chatId, "❌ کاربر پیدا نشد.", usersMenu()); return new Response(JSON.stringify({ ok: true }), { headers }); }

      if (text === "⛔ غیرفعال کردن" || text === "✅ فعال کردن") {
        const nextActive = !target.is_active;
        const { error } = await supabase.from("kanoon_users").update({ is_active: nextActive, updated_at: new Date().toISOString() }).eq("id", target.id);
        await clearState(user.id);
        await sendMessage(chatId, error ? `❌ تغییر وضعیت انجام نشد.\n\n🔎 ${error.message}` : `${nextActive ? "✅ کاربر فعال شد." : "⛔ کاربر غیرفعال شد."}\n\n👤 ${target.display_name}`, usersMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (text === "🔄 بازنشانی اتصال Bale") {
        const inviteCode = await generateUniqueInviteCode();
        if (!inviteCode) { await sendMessage(chatId, "❌ تولید کد دعوت انجام نشد.", usersMenu()); return new Response(JSON.stringify({ ok: true }), { headers }); }
        const { error } = await supabase.from("kanoon_users").update({ bale_chat_id: null, activation_status: "pending", invite_code: inviteCode, bot_state: null, bot_temp_data: null, updated_at: new Date().toISOString() }).eq("id", target.id);
        await clearState(user.id);
        const link = `https://ble.ir/${BOT_USERNAME}?start=${inviteCode}`;
        await sendMessage(chatId, error ? `❌ بازنشانی انجام نشد.\n\n🔎 ${error.message}` : `✅ اتصال Bale بازنشانی شد.\n\n👤 ${target.display_name}\n🔑 کد دعوت: ${inviteCode}\n\n🔗 ${link}`, error ? usersMenu() : inviteKeyboard(inviteCode));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (text === "🔗 تغییر مربی") {
        if (target.role !== "trainee") { await sendMessage(chatId, "❌ تغییر مربی فقط برای متربی امکان‌پذیر است.", usersMenu()); await clearState(user.id); return new Response(JSON.stringify({ ok: true }), { headers }); }
        const { data: coaches } = await supabase.from("kanoon_users").select("id,display_name,mobile,is_active,activation_status").eq("role","coach").eq("is_active",true).eq("activation_status","active").order("display_name", { ascending: true });
        if (!coaches?.length) { await sendMessage(chatId, "❌ مربی فعال وجود ندارد.", usersMenu()); await clearState(user.id); return new Response(JSON.stringify({ ok: true }), { headers }); }
        const coachKeyboard = {
          keyboard: [
            ...coaches.map((c) => [{ text: `👨‍🏫 ${c.display_name} | ${c.id}` }]),
            [{ text: "🔙 بازگشت" }],
          ],
          resize_keyboard: true,
        };
        await supabase.from("kanoon_users").update({ bot_state:"admin_change_coach", bot_temp_data:tempJson({targetId:target.id}) }).eq("id", user.id);
        await sendMessage(chatId, "👨‍🏫 مربی جدید را انتخاب کنید:", coachKeyboard);
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      await sendMessage(chatId, "❌ لطفاً یکی از دکمه‌های عملیات را انتخاب کنید.", userOperationKeyboard(target));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && user.bot_state === "admin_change_coach") {
      const data = parseTemp(user.bot_temp_data);
      const coachMatch = text.match(/^👨‍🏫 (.+) \| ([0-9a-f-]{36})$/i);
      const coachId = coachMatch?.[2] ?? null;
      const { data: coach } = coachId
        ? await supabase.from("kanoon_users").select("id,display_name").eq("id", coachId).eq("role","coach").eq("is_active",true).eq("activation_status","active").maybeSingle()
        : { data: null };
      if (!coach) { await sendMessage(chatId, "❌ شماره مربی معتبر نیست."); return new Response(JSON.stringify({ ok:true }), {headers}); }
      const { error } = await supabase.from("kanoon_users").update({ coach_id:coach.id, updated_at:new Date().toISOString() }).eq("id", data.targetId).eq("role","trainee");
      await clearState(user.id);
      await sendMessage(chatId, error ? `❌ تغییر مربی انجام نشد.\n\n🔎 ${error.message}` : `✅ مربی متربی تغییر کرد.\n\n👨‍🏫 ${coach.display_name}`, usersMenu());
      return new Response(JSON.stringify({ok:true}), {headers});
    }

    /* =====================================================
       ADMIN → ADD COACH
       ===================================================== */

    if (
      user.role === "admin" &&
      text === "👨‍🏫 افزودن مربی"
    ) {
      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "add_coach_name",
          bot_temp_data: null,
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        "👨‍🏫 افزودن مربی\n\nنام و نام خانوادگی مربی را ارسال کنید:",
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → COACH NAME
       ===================================================== */

    if (
      user.role === "admin" &&
      user.bot_state ===
        "add_coach_name"
    ) {
      const name =
        cleanText(text);

      if (
        name.length < 2
      ) {
        await sendMessage(
          chatId,
          "❌ نام معتبر نیست.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "add_coach_mobile",
          bot_temp_data: name,
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        `👨‍🏫 نام مربی: ${name}\n\n📱 شماره موبایل مربی را ارسال کنید.`,
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → COACH MOBILE
       ===================================================== */

    if (
      user.role === "admin" &&
      user.bot_state ===
        "add_coach_mobile"
    ) {
      const mobile =
        normalizeMobile(text);

      if (!mobile) {
        await sendMessage(
          chatId,
          "❌ شماره موبایل معتبر نیست.\n\nمثال:\n09121234567",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const {
        data: existingMobile,
      } = await supabase
        .from("kanoon_users")
        .select(`
          id,
          display_name,
          role
        `)
        .eq(
          "mobile",
          mobile,
        )
        .maybeSingle();

      if (existingMobile) {
        await clearState(
          user.id,
        );

        await sendMessage(
          chatId,
          `⚠️ این شماره قبلاً ثبت شده است.\n\nنام: ${existingMobile.display_name}\nنقش: ${roleText(existingMobile.role)}`,
          usersMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const inviteCode =
        await generateUniqueInviteCode();

      if (!inviteCode) {
        await sendMessage(
          chatId,
          "❌ تولید کد دعوت انجام نشد.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const coachName =
        user.bot_temp_data ||
        "مربی جدید";

      const { error } =
        await supabase
          .from("kanoon_users")
          .insert({
            bale_chat_id: null,
            display_name:
              coachName,
            mobile,
            role: "coach",
            xp: 0,
            level: 1,
            is_active: true,
            registration_state:
              "active",
            activation_status:
              "pending",
            invite_code:
              inviteCode,
            bot_state: null,
            bot_temp_data: null,
          });

      if (error) {
        console.error(
          "Coach insert error:",
          error,
        );

        await sendMessage(
          chatId,
          "❌ ایجاد مربی انجام نشد.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await clearState(
        user.id,
      );

      const inviteLink =
        `https://ble.ir/${BOT_USERNAME}?start=${inviteCode}`;

      await sendMessage(
        chatId,
        `✅ مربی ثبت شد.\n\n👨‍🏫 ${coachName}\n📱 ${mobile}\n\n🔑 کد دعوت: ${inviteCode}\n\n🔗 لینک فعال‌سازی:\n${inviteLink}\n\nاین لینک را برای مربی ارسال کنید.`,
        inviteKeyboard(
          inviteCode,
        ),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → TRAINEES MENU
       ===================================================== */

    if (
      user.role === "coach" &&
      text === "🎓 متربی‌های من"
    ) {
      await sendMessage(
        chatId,
        "🎓 مدیریت متربی‌های من\n\nیک گزینه را انتخاب کنید:",
        coachMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → ADD TRAINEE
       ===================================================== */

    if (
      user.role === "coach" &&
      text === "➕ افزودن متربی"
    ) {
      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "add_trainee_name",
          bot_temp_data: null,
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        "👤 افزودن متربی\n\nنام و نام خانوادگی متربی را ارسال کنید:",
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → TRAINEE NAME
       ===================================================== */

    if (
      user.role === "coach" &&
      user.bot_state ===
        "add_trainee_name"
    ) {
      const name =
        cleanText(text);

      if (
        name.length < 2
      ) {
        await sendMessage(
          chatId,
          "❌ نام معتبر نیست.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "add_trainee_mobile",
          bot_temp_data:
            name,
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        `👤 نام متربی: ${name}\n\n📱 شماره موبایل متربی را ارسال کنید.\n\nمثال:\n09121234567`,
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → TRAINEE MOBILE
       ===================================================== */

    if (
      user.role === "coach" &&
      user.bot_state ===
        "add_trainee_mobile"
    ) {
      const mobile =
        normalizeMobile(text);

      if (!mobile) {
        await sendMessage(
          chatId,
          "❌ شماره موبایل معتبر نیست.\n\nمثال:\n09121234567",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const {
        data: existingUser,
      } = await supabase
        .from("kanoon_users")
        .select(`
          id,
          display_name,
          role,
          coach_id
        `)
        .eq(
          "mobile",
          mobile,
        )
        .maybeSingle();

      if (existingUser) {
        await clearState(
          user.id,
        );

        if (
          existingUser.role ===
            "trainee" &&
          existingUser.coach_id ===
            user.id
        ) {
          await sendMessage(
            chatId,
            `⚠️ این متربی قبلاً برای شما ثبت شده است.\n\n👤 ${existingUser.display_name}`,
            coachMenu(),
          );
        } else {
          await sendMessage(
            chatId,
            "⚠️ این شماره موبایل قبلاً در سیستم ثبت شده است و امکان ثبت مجدد آن وجود ندارد.",
            coachMenu(),
          );
        }

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const inviteCode =
        await generateUniqueInviteCode();

      if (!inviteCode) {
        await sendMessage(
          chatId,
          "❌ تولید کد دعوت انجام نشد.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const traineeName =
        user.bot_temp_data ||
        "متربی جدید";

      const { error } =
        await supabase
          .from("kanoon_users")
          .insert({
            bale_chat_id: null,
            display_name:
              traineeName,
            mobile,
            role: "trainee",
            coach_id: user.id,
            xp: 0,
            level: 1,
            is_active: true,
            registration_state:
              "active",
            activation_status:
              "pending",
            invite_code:
              inviteCode,
            bot_state: null,
            bot_temp_data: null,
          });

      if (error) {
        console.error(
          "Trainee insert error:",
          error,
        );

        await sendMessage(
          chatId,
          "❌ ایجاد متربی انجام نشد.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await clearState(
        user.id,
      );

      const inviteLink =
        `https://ble.ir/${BOT_USERNAME}?start=${inviteCode}`;

      await sendMessage(
        chatId,
        `✅ متربی با موفقیت ثبت شد.\n\n👤 ${traineeName}\n📱 ${mobile}\n\n🔑 کد دعوت: ${inviteCode}\n\n🔗 لینک عضویت متربی:\n${inviteLink}\n\nاین لینک را برای متربی ارسال کنید.`,
        inviteKeyboard(
          inviteCode,
        ),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → TRAINEE LIST
       ===================================================== */

    if (
      user.role === "coach" &&
      text ===
        "📋 فهرست متربی‌های من"
    ) {
      const {
        data: trainees,
        error,
      } = await supabase
        .from("kanoon_users")
        .select(`
          display_name,
          mobile,
          xp,
          level,
          activation_status,
          is_active
        `)
        .eq(
          "coach_id",
          user.id,
        )
        .eq(
          "role",
          "trainee",
        )
        .order(
          "display_name",
          { ascending: true },
        );

      if (error) {
        await sendMessage(
          chatId,
          "❌ دریافت فهرست متربی‌ها انجام نشد.",
          coachMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      if (
        !trainees ||
        trainees.length === 0
      ) {
        await sendMessage(
          chatId,
          "📋 هنوز متربی‌ای برای شما ثبت نشده است.",
          coachMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      let output =
        "📋 فهرست متربی‌های من\n\n";

      trainees.forEach(
        (trainee, index) => {
          const status =
            trainee.activation_status ===
              "active" &&
            trainee.is_active
              ? "🟢 فعال"
              : "🟡 منتظر عضویت";

          output +=
            `${index + 1}. 👤 ${trainee.display_name}\n` +
            `📱 ${trainee.mobile ?? "-"}\n` +
            `⭐ ${trainee.xp} امتیاز\n` +
            `⚡ سطح ${trainee.level}\n` +
            `${status}\n\n`;
        },
      );

      await sendMessage(
        chatId,
        output,
        coachMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → MISSION MENU
       ===================================================== */

    if (
      user.role === "coach" &&
      text === "🎯 مأموریت‌ها"
    ) {
      await clearState(
        user.id,
      );

      await sendMessage(
        chatId,
        "🎯 مدیریت مأموریت‌ها\n\nیک گزینه را انتخاب کنید:",
        coachMissionMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → CREATE MISSION
       ===================================================== */

    if (
      user.role === "coach" &&
      text === "➕ ایجاد مأموریت"
    ) {
      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "mission_title",
          bot_temp_data: null,
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        "🎯 ایجاد مأموریت\n\nعنوان مأموریت را ارسال کنید:",
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → MISSION TITLE
       ===================================================== */

    if (
      user.role === "coach" &&
      user.bot_state ===
        "mission_title"
    ) {
      const title =
        cleanText(text);

      if (
        title.length < 2
      ) {
        await sendMessage(
          chatId,
          "❌ عنوان مأموریت معتبر نیست.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "mission_description",
          bot_temp_data:
            tempJson({
              title,
            }),
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        "📝 توضیح مأموریت را ارسال کنید.\n\nاگر توضیحی ندارد، «-» ارسال کنید.",
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → MISSION DESCRIPTION
       ===================================================== */

    if (
      user.role === "coach" &&
      user.bot_state ===
        "mission_description"
    ) {
      const data =
        parseTemp(
          user.bot_temp_data,
        );

      data.description =
        text === "-"
          ? ""
          : text;

      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "mission_xp",
          bot_temp_data:
            tempJson(data),
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        "⭐ امتیاز مأموریت را به عدد ارسال کنید.\n\nمثال: 20",
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → MISSION امتیاز
       ===================================================== */

    if (
      user.role === "coach" &&
      user.bot_state ===
        "mission_xp"
    ) {
      const xp = Number(text);

      if (
        !Number.isInteger(xp) ||
        xp <= 0 ||
        xp > 100000
      ) {
        await sendMessage(
          chatId,
          "❌ مقدار امتیاز معتبر نیست.\nیک عدد مثبت ارسال کنید.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const data = parseTemp(user.bot_temp_data);
      const title = cleanText(String(data.title ?? ""));
      const description = data.description
        ? cleanText(String(data.description))
        : null;

      if (!title) {
        await clearState(user.id);
        await sendMessage(
          chatId,
          "❌ عنوان مأموریت پیدا نشد.\nلطفاً مأموریت را دوباره ایجاد کنید.",
          coachMissionMenu(),
        );
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const { data: mission, error } = await supabase
        .from("missions")
        .insert({
          title,
          description: description || null,
          xp_reward: xp,
          created_by: user.id,
          requires_approval: true,
          is_active: true,
        })
        .select("id, title, description, xp_reward, created_by, is_active")
        .single();

      if (error) {
        console.error("Mission create error:", JSON.stringify(error, null, 2));
        await sendMessage(
          chatId,
          `❌ ایجاد مأموریت انجام نشد.\n\n🔎 خطا: ${error.message ?? "خطای نامشخص"}`,
        );
        return new Response(
          JSON.stringify({ ok: true, error: error.message }),
          { headers },
        );
      }

      if (!mission) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ مأموریت ایجاد نشد و رکوردی از آن دریافت نشد.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      await supabase
        .from("kanoon_users")
        .update({
          bot_state: "mission_assign_mode",
          bot_temp_data: tempJson({
            missionId: String(mission.id),
          }),
        })
        .eq("id", user.id);

      await sendMessage(
        chatId,
        `🎯 مأموریت آماده شد!\n\n━━━━━━━━━━━━━━\n🎯 ${mission.title}\n⭐ پاداش: ${mission.xp_reward} امتیاز\n🆔 ${missionCode(mission.id)}\n━━━━━━━━━━━━━━\n\nحالا مشخص کنید این مأموریت برای چه کسانی ارسال شود. 👇`,
      );

      return new Response(
        JSON.stringify({ ok: true, mission_id: mission.id, mission_code: missionCode(mission.id) }),
        { headers },
      );
    }

    /* =====================================================
       COACH → ACTIVE MISSION LIST
       ===================================================== */

    if (
      user.role === "coach" &&
      text === "📋 مأموریت‌های من"
    ) {
      const { data: missions, error } = await supabase
        .from("missions")
        .select("id, title, description, xp_reward, is_active, created_at")
        .eq("created_by", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        await sendMessage(chatId, "❌ دریافت مأموریت‌ها انجام نشد.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (!missions || missions.length === 0) {
        await sendMessage(chatId, "📋 مأموریت فعال ندارید.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const page = 0;
      await supabase.from("kanoon_users").update({
        bot_state: "mission_pick",
        bot_temp_data: tempJson({ missionPage: String(page) }),
      }).eq("id", user.id);

      let output = "📋 مأموریت‌های فعال\n\nبرای مدیریت، روی مأموریت موردنظر بزنید:";
      output += `\n\nصفحه ${page + 1} از ${Math.max(1, Math.ceil(missions.length / ASSIGN_PAGE_SIZE))}`;

      await sendMessage(
        chatId,
        output,
        missionListKeyboard(missions.map((m) => ({ id: m.id, title: m.title })), page),
      );

      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    /* =====================================================
       COACH → ARCHIVED MISSIONS
       ===================================================== */

    if (user.role === "coach" && text === "📦 آرشیو مأموریت‌ها") {
      const { data: missions, error } = await supabase
        .from("missions")
        .select("id,title,xp_reward,created_at")
        .eq("created_by", user.id)
        .eq("is_active", false)
        .order("created_at", { ascending: false });

      if (error) {
        await sendMessage(chatId, "❌ دریافت آرشیو مأموریت‌ها انجام نشد.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (!missions || missions.length === 0) {
        await sendMessage(chatId, "📦 هنوز مأموریتی به آرشیو منتقل نشده است.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      let output = "📦 آرشیو مأموریت‌ها\n\n";
      missions.forEach((m, i) => {
        output += `${i + 1}. 🎯 ${m.title}\n🆔 کد : ${missionCode(m.id)}\n🚀 ${m.xp_reward} امتیاز\n\n`;
      });
      await sendMessage(chatId, output, coachMissionMenu());
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    /* =====================================================
       COACH → SELECT / MANAGE MISSION BY BUTTON
       ===================================================== */

    if (user.role === "coach" && user.bot_state === "mission_pick") {
      const data = parseTemp(user.bot_temp_data);
      let page = Number(data.missionPage ?? "0");

      if (text === "⬅️ صفحه قبل" || text === "➡️ صفحه بعد") {
        page += text === "➡️ صفحه بعد" ? 1 : -1;
        page = Math.max(0, page);
        const { data: missions } = await supabase
          .from("missions").select("id,title")
          .eq("created_by", user.id).eq("is_active", true)
          .order("created_at", { ascending: false });
        if (!missions?.length) {
          await clearState(user.id);
          await sendMessage(chatId, "📋 مأموریت فعال ندارید.", coachMissionMenu());
          return new Response(JSON.stringify({ ok: true }), { headers });
        }
        const maxPage = Math.max(0, Math.ceil(missions.length / ASSIGN_PAGE_SIZE) - 1);
        page = Math.min(page, maxPage);
        await supabase.from("kanoon_users").update({ bot_temp_data: tempJson({ missionPage: String(page) }) }).eq("id", user.id);
        await sendMessage(chatId, `📋 انتخاب مأموریت\n\nصفحه ${page + 1} از ${maxPage + 1}`, missionListKeyboard(missions, page));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const match = text.match(/^🎯\s*(M\d{3})\s*\|/i);
      const missionId = match ? missionIdFromCode(match[1]) : null;
      if (missionId === null) {
        await sendMessage(chatId, "❌ برای ادامه، یکی از مأموریت‌ها را از دکمه‌ها انتخاب کنید.", missionListKeyboard([], page));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const { data: mission } = await supabase
        .from("missions").select("id,title,description,xp_reward,is_active")
        .eq("id", missionId).eq("created_by", user.id).maybeSingle();

      if (!mission) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ این مأموریت متعلق به شما نیست یا وجود ندارد.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      await supabase.from("kanoon_users").update({
        bot_state: "mission_manage",
        bot_temp_data: tempJson({ missionId: String(mission.id) }),
      }).eq("id", user.id);

      await sendMessage(
        chatId,
        `🎯 ${mission.title}\n🆔 کد : ${missionCode(mission.id)}\n🚀 ${mission.xp_reward} امتیاز\n${mission.description ? `\n📝 ${mission.description}\n` : ""}\nوضعیت: ${mission.is_active ? "🟢 فعال" : "📦 آرشیو"}`,
        mission.is_active ? missionManageKeyboard() : coachMissionMenu(),
      );
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    /* =====================================================
       COACH → MISSION MANAGEMENT
       ===================================================== */

    if (user.role === "coach" && user.bot_state === "mission_manage") {
      const data = parseTemp(user.bot_temp_data);
      const missionId = Number(data.missionId);
      const { data: mission } = await supabase
        .from("missions").select("id,title,description,xp_reward,is_active")
        .eq("id", missionId).eq("created_by", user.id).maybeSingle();

      if (!mission) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ مأموریت پیدا نشد.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (text === "👤 واگذاری مأموریت") {
        await supabase.from("kanoon_users").update({
          bot_state: "mission_assign_mode",
          bot_temp_data: tempJson({ missionId: String(mission.id) }),
        }).eq("id", user.id);
        await sendMessage(chatId, `🎯 ${mission.title}\n⭐ پاداش: ${mission.xp_reward} امتیاز\n\n👥 حالا مشخص کنید مأموریت برای چه کسانی ارسال شود:`, missionAssignModeKeyboard());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (text === "⏹️ پایان مأموریت") {
        const { error } = await supabase.from("missions")
          .update({ is_active: false })
          .eq("id", mission.id).eq("created_by", user.id).eq("is_active", true);
        await clearState(user.id);
        await sendMessage(
          chatId,
          error ? `❌ پایان مأموریت انجام نشد.\n\n🔎 ${error.message ?? "خطای نامشخص"}` : `📦 مأموریت به پایان رسید و به آرشیو منتقل شد.\n\n🎯 ${mission.title}\n🆔 کد : ${missionCode(mission.id)}`,
          coachMissionMenu(),
        );
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      await sendMessage(chatId, "لطفاً یکی از دکمه‌های مدیریت مأموریت را انتخاب کنید.", missionManageKeyboard());
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    /* =====================================================
       COACH → MISSION ASSIGN MODE
       ===================================================== */

    if (user.role === "coach" && user.bot_state === "mission_assign_mode") {
      const normalizedMode =
        text === "1" || text === "👤 یک متربی" ? "single" :
        text === "2" || text === "👥 چند متربی" ? "multi" :
        text === "3" || text === "👥 همه متربی‌های فعال" ? "all" : null;

      if (!normalizedMode) {
        await sendMessage(chatId, "❌ لطفاً یکی از دکمه‌های انتخاب روش اختصاص را بزنید.", missionAssignModeKeyboard());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const data = parseTemp(user.bot_temp_data);
      const missionId = Number(data.missionId);
      const { data: mission } = await supabase
        .from("missions")
        .select("id,title,xp_reward")
        .eq("id", missionId)
        .eq("created_by", user.id)
        .maybeSingle();

      if (!mission) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ مأموریت پیدا نشد.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const { data: trainees } = await supabase
        .from("kanoon_users")
        .select("id,display_name,activation_status,is_active")
        .eq("coach_id", user.id)
        .eq("role", "trainee")
        .order("display_name", { ascending: true });

      const activeTrainees = (trainees ?? []).filter(
        (t) => t.is_active && t.activation_status === "active",
      );
      const { data: existingAssignments } = await supabase
        .from("mission_assignments")
        .select("trainee_id")
        .eq("mission_id", missionId);
      const assignedIds = new Set((existingAssignments ?? []).map((x) => x.trainee_id));
      const availableTrainees = activeTrainees.filter((t) => !assignedIds.has(t.id));

      if (availableTrainees.length === 0) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ متربی فعال برای اختصاص مأموریت وجود ندارد.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (normalizedMode === "all") {
        const rows = availableTrainees.map((t) => ({
          mission_id: mission.id,
          trainee_id: t.id,
          assigned_by: user.id,
        }));
        const { error } = await supabase
          .from("mission_assignments")
          .upsert(rows, { onConflict: "mission_id,trainee_id" });

        if (!error) await notifyMissionAssigned(availableTrainees.map((t) => t.id), mission);
        await clearState(user.id);
        await sendMessage(
          chatId,
          error
            ? `❌ اختصاص به همه انجام نشد.\n\n🔎 ${error.message ?? "خطای نامشخص"}`
            : `✅ مأموریت به ${availableTrainees.length} متربی فعال اختصاص داده شد.\n\n🆔 کد : ${missionCode(mission.id)}\n🎯 ${mission.title}\n🚀 ${mission.xp_reward} امتیاز`,
          coachMissionMenu(),
        );
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      await supabase.from("kanoon_users").update({
        bot_state: normalizedMode === "single" ? "mission_assign_single" : "mission_assign_multi",
        bot_temp_data: tempJson({
          missionId: String(mission.id),
          page: "0",
          selected: "",
        }),
      }).eq("id", user.id);

      await sendMessage(
        chatId,
        normalizedMode === "single"
          ? `🎯 ${mission.title}\n\nروی نام متربی بزنید:`
          : `🎯 ${mission.title}\n\nمتربی‌ها را با زدن دکمه‌ها انتخاب کنید.\nبعد از انتخاب، «✅ تأیید انتخاب» را بزنید.`,
        missionAssignmentKeyboard(
          availableTrainees,
          0,
          [],
          normalizedMode === "multi",
        ),
      );
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    /* =====================================================
       COACH → TRAINEE ASSIGNMENT BY BUTTONS
       ===================================================== */

    if (
      user.role === "coach" &&
      (user.bot_state === "mission_assign_single" ||
       user.bot_state === "mission_assign_multi") &&
      !(user.bot_state === "mission_assign_multi" && text === "✅ تأیید انتخاب")
    ) {
      const data = parseTemp(user.bot_temp_data);
      const missionId = Number(data.missionId);
      let page = Number(data.page ?? "0");
      const multi = user.bot_state === "mission_assign_multi";
      let selectedIndexes = (data.selected ?? "")
        .split(",")
        .filter(Boolean)
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0);

      const { data: mission } = await supabase
        .from("missions")
        .select("id,title,xp_reward")
        .eq("id", missionId)
        .eq("created_by", user.id)
        .maybeSingle();

      const { data: trainees } = await supabase
        .from("kanoon_users")
        .select("id,display_name,is_active,activation_status")
        .eq("coach_id", user.id)
        .eq("role", "trainee")
        .order("display_name", { ascending: true });

      const activeTrainees = (trainees ?? []).filter(
        (t) => t.is_active && t.activation_status === "active",
      );

      const { data: existingAssignments } = await supabase
        .from("mission_assignments")
        .select("trainee_id")
        .eq("mission_id", missionId);
      const assignedIds = new Set((existingAssignments ?? []).map((x) => x.trainee_id));
      const availableTrainees = activeTrainees.filter((t) => !assignedIds.has(t.id));

      if (!mission || availableTrainees.length === 0) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ مأموریت یا فهرست متربی‌ها پیدا نشد.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const maxPage = Math.max(0, Math.ceil(availableTrainees.length / ASSIGN_PAGE_SIZE) - 1);

      if (text === "⬅️ صفحه قبل" || text === "➡️ صفحه بعد") {
        page += text === "➡️ صفحه بعد" ? 1 : -1;
        page = Math.min(Math.max(page, 0), maxPage);
        await supabase.from("kanoon_users").update({
          bot_temp_data: tempJson({
            missionId: String(mission.id),
            page: String(page),
            selected: selectedIndexes.join(","),
          }),
        }).eq("id", user.id);

        await sendMessage(
          chatId,
          `${multi ? "👥 انتخاب متربی‌ها" : "👤 انتخاب متربی"}\n\nصفحه ${page + 1} از ${maxPage + 1}`,
          missionAssignmentKeyboard(availableTrainees, page, selectedIndexes, multi),
        );
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (multi && text === "👥 همه متربی‌های فعال") {
        selectedIndexes = availableTrainees.map((_, index) => index + 1);
        await supabase.from("kanoon_users").update({
          bot_temp_data: tempJson({
            missionId: String(mission.id),
            page: String(page),
            selected: selectedIndexes.join(","),
          }),
        }).eq("id", user.id);

        await sendMessage(
          chatId,
          `👥 همه ${availableTrainees.length} متربی فعال انتخاب شدند.\n\nاگر درست است «✅ تأیید انتخاب» را بزنید.`,
          missionAssignmentKeyboard(availableTrainees, page, selectedIndexes, true),
        );
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const buttonMatch = text.match(/^(?:⬜|✅)\s*(\d+)\./);
      const index = buttonMatch ? Number(buttonMatch[1]) : null;

      if (!index || index < 1 || index > availableTrainees.length) {
        await sendMessage(
          chatId,
          multi
            ? "❌ لطفاً یکی از متربی‌ها را با دکمه انتخاب کنید."
            : "❌ لطفاً یکی از متربی‌ها را با دکمه انتخاب کنید.",
          missionAssignmentKeyboard(availableTrainees, page, selectedIndexes, multi),
        );
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (!multi) {
        const trainee = availableTrainees[index - 1];
        const { error } = await supabase.from("mission_assignments").upsert({
          mission_id: mission.id,
          trainee_id: trainee.id,
          assigned_by: user.id,
        }, { onConflict: "mission_id,trainee_id" });

        if (!error) await notifyMissionAssigned([trainee.id], mission);
        await clearState(user.id);
        await sendMessage(
          chatId,
          error
            ? `❌ اختصاص مأموریت انجام نشد.\n\n🔎 ${error.message ?? "خطای نامشخص"}`
            : `✅ مأموریت اختصاص داده شد.\n\n🆔 کد : ${missionCode(mission.id)}\n🎯 ${mission.title}\n👤 ${trainee.display_name}\n🚀 ${mission.xp_reward} امتیاز`,
          coachMissionMenu(),
        );
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      if (selectedIndexes.includes(index)) {
        selectedIndexes = selectedIndexes.filter((n) => n !== index);
      } else {
        selectedIndexes.push(index);
        selectedIndexes = [...new Set(selectedIndexes)].sort((a, b) => a - b);
      }

      await supabase.from("kanoon_users").update({
        bot_temp_data: tempJson({
          missionId: String(mission.id),
          page: String(page),
          selected: selectedIndexes.join(","),
        }),
      }).eq("id", user.id);

      await sendMessage(
        chatId,
        `👥 ${selectedIndexes.length} متربی انتخاب شده است.\n\nصفحه ${page + 1} از ${maxPage + 1}`,
        missionAssignmentKeyboard(availableTrainees, page, selectedIndexes, true),
      );
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    /* =====================================================
       COACH → CONFIRM MULTI TRAINEE ASSIGNMENT
       ===================================================== */

    if (user.role === "coach" && user.bot_state === "mission_assign_multi" && text === "✅ تأیید انتخاب") {
      const data = parseTemp(user.bot_temp_data);
      const missionId = Number(data.missionId);
      const selectedIndexes = (data.selected ?? "")
        .split(",")
        .filter(Boolean)
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0);

      if (selectedIndexes.length === 0) {
        await sendMessage(chatId, "❌ حداقل یک متربی را انتخاب کنید.", missionAssignmentKeyboard([], 0, [], true));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const { data: mission } = await supabase
        .from("missions")
        .select("id,title,xp_reward")
        .eq("id", missionId)
        .eq("created_by", user.id)
        .maybeSingle();
      const { data: trainees } = await supabase
        .from("kanoon_users")
        .select("id,display_name,is_active,activation_status")
        .eq("coach_id", user.id)
        .eq("role", "trainee")
        .order("display_name", { ascending: true });
      const activeTrainees = (trainees ?? []).filter((t) => t.is_active && t.activation_status === "active");
      const { data: existingAssignments } = await supabase
        .from("mission_assignments").select("trainee_id").eq("mission_id", missionId);
      const assignedIds = new Set((existingAssignments ?? []).map((x) => x.trainee_id));
      const availableTrainees = activeTrainees.filter((t) => !assignedIds.has(t.id));
      const selected = selectedIndexes.map((n) => availableTrainees[n - 1]).filter(Boolean);

      if (!mission || selected.length !== selectedIndexes.length) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ انتخاب متربی‌ها دیگر معتبر نیست. دوباره تلاش کنید.", coachMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const rows = selected.map((t) => ({ mission_id: mission.id, trainee_id: t.id, assigned_by: user.id }));
      const { error } = await supabase.from("mission_assignments").upsert(rows, { onConflict: "mission_id,trainee_id" });
      if (!error) await notifyMissionAssigned(selected.map((t) => t.id), mission);
      await clearState(user.id);

      await sendMessage(
        chatId,
        error
          ? `❌ اختصاص مأموریت انجام نشد.\n\n🔎 ${error.message ?? "خطای نامشخص"}`
          : `✅ مأموریت به ${selected.length} متربی اختصاص داده شد.\n\n🆔 کد : ${missionCode(mission.id)}\n🎯 ${mission.title}\n🚀 ${mission.xp_reward} امتیاز`,
        coachMissionMenu(),
      );
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    /* =====================================================
       COACH → PENDING ACTIVITIES
       ===================================================== */

    if (
      user.role === "coach" &&
      (text === "⏳ فعالیت‌های در انتظار بررسی" ||
       text === "⏳ بررسی فعالیت‌ها")
    ) {
      const {
        data: trainees,
      } = await supabase
        .from("kanoon_users")
        .select(`
          id,
          display_name
        `)
        .eq(
          "coach_id",
          user.id,
        )
        .eq(
          "role",
          "trainee",
        );

      const traineeIds =
        (
          trainees ?? []
        ).map(
          (item) => item.id,
        );

      if (
        traineeIds.length === 0
      ) {
        await sendMessage(
          chatId,
          "⏳ فعالیتی برای بررسی ندارید.",
          coachMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const {
        data: submissions,
        error,
      } = await supabase
        .from(
          "mission_submissions",
        )
        .select(`
          id,
          mission_id,
          trainee_id,
          proof_text,
          created_at
        `)
        .eq(
          "status",
          "pending",
        )
        .in(
          "trainee_id",
          traineeIds,
        )
        .order(
          "created_at",
          { ascending: true },
        );

      if (error) {
        console.error(
          "Submission list error:",
          error,
        );

        await sendMessage(
          chatId,
          "❌ دریافت فعالیت‌ها انجام نشد.",
          coachMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      if (
        !submissions ||
        submissions.length === 0
      ) {
        await sendMessage(
          chatId,
          "⏳ فعالیتی برای بررسی ندارید.",
          coachMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const missionIds = [
        ...new Set(
          submissions.map(
            (item) =>
              item.mission_id,
          ),
        ),
      ];

      const {
        data: missions,
      } = await supabase
        .from("missions")
        .select(`
          id,
          title,
          xp_reward
        `)
        .in(
          "id",
          missionIds,
        );

      const missionMap:
        Record<
          string,
          {
            title: string;
            xp_reward: number;
          }
        > = {};

      for (
        const mission of
          missions ?? []
      ) {
        missionMap[
          String(mission.id)
        ] = {
          title:
            mission.title,
          xp_reward:
            mission.xp_reward,
        };
      }

      const traineeMap:
        Record<string, string> = {};

      for (
        const trainee of
          trainees ?? []
      ) {
        traineeMap[
          trainee.id
        ] =
          trainee.display_name;
      }

      let output =
        "⏳ فعالیت‌های در انتظار بررسی\n\n";

      submissions.forEach(
        (submission, index) => {
          const mission =
            missionMap[
              String(
                submission.mission_id,
              )
            ];

          output +=
            `${index + 1}. 👤 ${
              traineeMap[
                submission.trainee_id
              ] ?? "-"
            }\n` +
            `🎯 ${
              mission?.title ??
              "-"
            }\n` +
            `⭐ ${
              mission?.xp_reward ??
              0
            } امتیاز\n` +
            `🆔 ${submission.id}\n` +
            `📝 ${
              submission.proof_text ||
              "بدون توضیح"
            }\n\n`;
        },
      );

      const reviewButtons = (submissions ?? []).map((submission: any) => ({
        id: Number(submission.id),
        traineeName: traineeMap[submission.trainee_id] ?? "متربی",
      }));

      output +=
        "👇 برای بررسی، روی فعالیت موردنظر بزنید.";

      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "review_submission_id",
          bot_temp_data: null,
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        output,
        reviewSubmissionKeyboard(reviewButtons),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → SELECT SUBMISSION
       ===================================================== */

    if (
      user.role === "coach" &&
      user.bot_state ===
        "review_submission_id"
    ) {
      const buttonMatch = text.match(/^🔎\s*#(\d+)\s*\|/);
      if (!buttonMatch) {
        await sendMessage(
          chatId,
          "❌ لطفاً یکی از دکمه‌های فعالیت را انتخاب کنید.",
          reviewSubmissionKeyboard([]),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const submissionId =
        Number(buttonMatch[1]);

      const {
        data: submission,
      } = await supabase
        .from(
          "mission_submissions",
        )
        .select(`
          id,
          mission_id,
          trainee_id,
          proof_text,
          status
        `)
        .eq(
          "id",
          submissionId,
        )
        .eq(
          "status",
          "pending",
        )
        .maybeSingle();

      if (!submission) {
        await sendMessage(
          chatId,
          "❌ فعالیت پیدا نشد یا قبلاً بررسی شده است.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const {
        data: trainee,
      } = await supabase
        .from("kanoon_users")
        .select(`
          id,
          display_name,
          coach_id,
          bale_chat_id,
          xp,
          level
        `)
        .eq(
          "id",
          submission.trainee_id,
        )
        .eq(
          "role",
          "trainee",
        )
        .maybeSingle();

      if (
        !trainee ||
        trainee.coach_id !==
          user.id
      ) {
        await clearState(
          user.id,
        );

        await sendMessage(
          chatId,
          "⛔ این فعالیت مربوط به متربی شما نیست.",
          coachMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const {
        data: mission,
      } = await supabase
        .from("missions")
        .select(`
          id,
          title,
          xp_reward
        `)
        .eq(
          "id",
          submission.mission_id,
        )
        .maybeSingle();

      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "review_submission_action",
          bot_temp_data:
            tempJson({
              submissionId:
                String(
                  submission.id,
                ),
              traineeId:
                trainee.id,
              missionId:
                String(submission.mission_id),
              xp: String(
                mission?.xp_reward ??
                  0,
              ),
            }),
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        `🔎 بررسی فعالیت\n\n👤 ${trainee.display_name}\n🎯 ${mission?.title ?? "-"}\n⭐ ${mission?.xp_reward ?? 0} امتیاز\n📝 ${submission.proof_text || "بدون توضیح"}\n\nنتیجه بررسی را انتخاب کنید:`,
        { keyboard: [[{ text: "✅ تأیید" }, { text: "❌ رد" }], [{ text: "🔙 بازگشت" }]], resize_keyboard: true },
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       COACH → APPROVE / REJECT
       ===================================================== */

    if (
      user.role === "coach" &&
      user.bot_state ===
        "review_submission_action"
    ) {
      let action:
        | "approved"
        | "rejected"
        | null = null;

      if (
        text === "تأیید" ||
        text === "✅ تأیید"
      ) {
        action = "approved";
      }

      if (
        text === "رد" ||
        text === "❌ رد"
      ) {
        action = "rejected";
      }

      if (!action) {
        await sendMessage(
          chatId,
          "لطفاً فقط «تأیید» یا «رد» را ارسال کنید.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const data =
        parseTemp(
          user.bot_temp_data,
        );

      const submissionId =
        Number(
          data.submissionId,
        );

      const traineeId =
        data.traineeId;

      const xp =
        Number(data.xp);

      const {
        data: trainee,
      } = await supabase
        .from("kanoon_users")
        .select(`
          id,
          display_name,
          coach_id,
          bale_chat_id,
          xp,
          level
        `)
        .eq(
          "id",
          traineeId,
        )
        .eq(
          "role",
          "trainee",
        )
        .maybeSingle();

      if (
        !trainee ||
        trainee.coach_id !==
          user.id
      ) {
        await clearState(
          user.id,
        );

        await sendMessage(
          chatId,
          "⛔ دسترسی به این فعالیت وجود ندارد.",
          coachMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const { data: reviewMission } = await supabase
        .from("missions")
        .select("id, title, xp_reward")
        .eq("id", Number(data.missionId))
        .maybeSingle();

      const {
        data: updated,
        error: updateError,
      } = await supabase
        .from(
          "mission_submissions",
        )
        .update({
          status: action,
          reviewed_by:
            user.id,
          reviewed_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          submissionId,
        )
        .eq(
          "status",
          "pending",
        )
        .select("id")
        .maybeSingle();

      if (
        updateError ||
        !updated
      ) {
        await clearState(
          user.id,
        );

        await sendMessage(
          chatId,
          "❌ ثبت نتیجه بررسی انجام نشد.",
          coachMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      /* ===================================================
         امتیاز
         =================================================== */

      if (
        action === "approved" &&
        xp > 0
      ) {
        const newXp =
          trainee.xp + xp;

        const newLevel = levelProgress(newXp).level;

        const {
          error: xpError,
        } = await supabase
          .from("kanoon_users")
          .update({
            xp: newXp,
            level: newLevel,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            trainee.id,
          );

        if (xpError) {
          console.error(
            "امتیاز update error:",
            xpError,
          );
        } else {
          await supabase
            .from(
              "xp_transactions",
            )
            .insert({
              user_id:
                trainee.id,
              amount: xp,
              reason:
                "تکمیل مأموریت و تأیید مربی",
              source_type:
                "mission_submission",
              source_id:
                submissionId,
            });
          await awardBadges(trainee.id, newXp);
        }
      }

      if (reviewMission) {
        await notifyTraineeReview(
          trainee,
          reviewMission,
          action,
        );
      }

      await clearState(
        user.id,
      );

      if (
        action === "approved"
      ) {
        await sendMessage(
          chatId,
          `🎉 فعالیت با موفقیت تأیید شد.\n\n👤 ${trainee.display_name}\n⭐ +${xp} امتیاز به حساب متربی اضافه شد.\n\n💡 امتیازها در پروفایل و رتبه‌بندی او به‌روزرسانی شدند.`,
          coachMissionMenu(),
        );
      } else {
        await sendMessage(
          chatId,
          `📌 نتیجه ثبت شد.\n\n👤 ${trainee.display_name}\n❌ این فعالیت تأیید نشد.\n\n🔔 نتیجه به متربی اطلاع داده شد.`,
          coachMissionMenu(),
        );
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       TRAINEE → MISSION MENU
       ===================================================== */

    if (
      user.role === "trainee" &&
      text ===
        "🎯 مأموریت‌های من"
    ) {
      await clearState(
        user.id,
      );

      await sendMessage(
        chatId,
        "🎯 مأموریت‌های من\n\nیک گزینه را انتخاب کنید:",
        traineeMissionMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       TRAINEE → ACTIVE MISSIONS
       ===================================================== */

    if (
      user.role === "trainee" &&
      text ===
        "📋 مأموریت‌های فعال"
    ) {
      const {
        data: assignments,
        error,
      } = await supabase
        .from(
          "mission_assignments",
        )
        .select(`
          id,
          mission_id,
          missions (
            id,
            title,
            description,
            xp_reward,
            is_active
          )
        `)
        .eq(
          "trainee_id",
          user.id,
        )
        .order(
          "created_at",
          { ascending: false },
        );

      if (error) {
        console.error(
          "Trainee mission list error:",
          error,
        );

        await sendMessage(
          chatId,
          "❌ دریافت مأموریت‌ها انجام نشد.",
          traineeMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const missionIds =
        (assignments ?? []).map(
          (item: any) =>
            item.mission_id,
        );

      const {
        data: submissions,
      } = missionIds.length
        ? await supabase
            .from(
              "mission_submissions",
            )
            .select(`
              mission_id,
              status
            `)
            .eq(
              "trainee_id",
              user.id,
            )
            .in(
              "mission_id",
              missionIds,
            )
        : { data: [] };

      const statusMap:
        Record<string, string> = {};

      for (
        const submission of
          submissions ?? []
      ) {
        statusMap[
          String(
            submission.mission_id,
          )
        ] =
          submission.status;
      }

      const selectableMissions: Array<{
        id: number;
        title: string;
      }> = [];

      let output =
        "📋 مأموریت‌های فعال\n\n";

      for (
        const assignment of
          assignments as any[]
      ) {
        const mission =
          Array.isArray(
            assignment.missions,
          )
            ? assignment.missions[0]
            : assignment.missions;

        if (
          !mission ||
          !mission.is_active
        ) {
          continue;
        }

        const status =
          statusMap[
            String(
              assignment.mission_id,
            )
          ];

        const state =
          status === "approved"
            ? "✅ تأیید شده"
            : status === "pending"
              ? "⏳ در انتظار بررسی"
              : status === "rejected"
                ? "❌ رد شده"
                : "🟢 آماده انجام";

        output +=
          `🎯 ${missionCode(assignment.mission_id)} | ${mission.title}\n` +
          `🚀 ${mission.xp_reward} امتیاز\n` +
          `${
            mission.description
              ? `📝 ${mission.description}\n`
              : ""
          }` +
          `${state}\n\n`;

        // فقط مأموریت‌هایی که هنوز قابل ارسال هستند دکمه می‌گیرند.
        if (
          status !== "approved" &&
          status !== "pending"
        ) {
          selectableMissions.push({
            id: Number(mission.id),
            title: mission.title,
          });
        }
      }

      if (selectableMissions.length === 0) {
        await supabase
          .from("kanoon_users")
          .update({
            bot_state: null,
            bot_temp_data: null,
          })
          .eq(
            "id",
            user.id,
          );

        await sendMessage(
          chatId,
          output + "\n📋 مأموریت فعالِ قابل انجامی ندارید.",
          traineeMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await supabase
        .from("kanoon_users")
        .update({
          bot_state: "trainee_select_mission",
          bot_temp_data: tempJson({ page: "0" }),
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        output + "\n👇 برای ارسال فعالیت، روی مأموریت موردنظر بزنید:",
        traineeMissionSelectionKeyboard(
          selectableMissions,
          0,
        ),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       TRAINEE → SELECT MISSION BY BUTTON
       ===================================================== */

    if (
      user.role === "trainee" &&
      user.bot_state ===
        "trainee_select_mission"
    ) {
      const data = parseTemp(user.bot_temp_data);
      let page = Number(data.page ?? "0");

      if (
        text === "⬅️ صفحه قبل" ||
        text === "➡️ صفحه بعد"
      ) {
        page += text === "➡️ صفحه بعد" ? 1 : -1;
        page = Math.max(0, page);

        const { data: assignments } = await supabase
          .from("mission_assignments")
          .select(`
            mission_id,
            missions (
              id,
              title,
              is_active
            )
          `)
          .eq("trainee_id", user.id)
          .order("created_at", { ascending: false });

        const missionIds = (assignments ?? []).map((item: any) => item.mission_id);
        const { data: submissions } = missionIds.length
          ? await supabase
              .from("mission_submissions")
              .select("mission_id,status")
              .eq("trainee_id", user.id)
              .in("mission_id", missionIds)
          : { data: [] };

        const statusMap: Record<string, string> = {};
        for (const submission of submissions ?? []) {
          statusMap[String(submission.mission_id)] = submission.status;
        }

        const selectableMissions: Array<{ id: number; title: string }> = [];
        for (const assignment of assignments as any[] ?? []) {
          const mission = Array.isArray(assignment.missions)
            ? assignment.missions[0]
            : assignment.missions;
          const status = statusMap[String(assignment.mission_id)];
          if (mission?.is_active && status !== "approved" && status !== "pending") {
            selectableMissions.push({
              id: Number(mission.id),
              title: mission.title,
            });
          }
        }

        const maxPage = Math.max(0, Math.ceil(selectableMissions.length / ASSIGN_PAGE_SIZE) - 1);
        page = Math.min(page, maxPage);

        await supabase
          .from("kanoon_users")
          .update({ bot_temp_data: tempJson({ page: String(page) }) })
          .eq("id", user.id);

        await sendMessage(
          chatId,
          "👇 مأموریت موردنظر را انتخاب کنید:",
          traineeMissionSelectionKeyboard(selectableMissions, page),
        );

        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const match = text.match(/^🎯\s*(M\d{3})\s*\|/i);
      const missionId = match ? missionIdFromCode(match[1]) : null;

      if (missionId === null) {
        await sendMessage(
          chatId,
          "❌ لطفاً یکی از دکمه‌های مأموریت را انتخاب کنید.",
          traineeMissionSelectionKeyboard([], 0),
        );
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      await supabase
        .from("kanoon_users")
        .update({
          bot_state: "trainee_submit_mission_id",
          bot_temp_data: tempJson({ missionId: String(missionId) }),
        })
        .eq("id", user.id);

      // ادامه پردازش انتخاب مأموریت در state بعدی انجام می‌شود.
      user.bot_state = "trainee_submit_mission_id";
      user.bot_temp_data = tempJson({ missionId: String(missionId) });
    }

    /* =====================================================
       TRAINEE → SELECT MISSION
       ===================================================== */

    if (
      user.role === "trainee" &&
      user.bot_state ===
        "trainee_submit_mission_id"
    ) {
      const missionId = user.bot_temp_data
        ? Number(parseTemp(user.bot_temp_data).missionId)
        : missionIdFromCode(text);

      if (missionId === null || !Number.isInteger(missionId)) {
        await sendMessage(
          chatId,
          "❌ مأموریت انتخاب‌شده معتبر نیست.",
          traineeMissionMenu(),
        );
        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const {
        data: assignment,
      } = await supabase
        .from(
          "mission_assignments",
        )
        .select(`
          mission_id,
          missions (
            id,
            title,
            description,
            xp_reward,
            is_active
          )
        `)
        .eq(
          "mission_id",
          missionId,
        )
        .eq(
          "trainee_id",
          user.id,
        )
        .maybeSingle();

      if (!assignment) {
        await clearState(user.id);
        await sendMessage(
          chatId,
          "❌ این مأموریت برای شما اختصاص داده نشده است.",
          traineeMissionMenu(),
        );
        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const mission =
        Array.isArray(
          (assignment as any)
            .missions,
        )
          ? (assignment as any)
              .missions[0]
          : (assignment as any)
              .missions;

      if (
        !mission ||
        !mission.is_active
      ) {
        await clearState(user.id);
        await sendMessage(
          chatId,
          "❌ این مأموریت دیگر فعال نیست.",
          traineeMissionMenu(),
        );
        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const {
        data: existing,
      } = await supabase
        .from(
          "mission_submissions",
        )
        .select(`
          id,
          status
        `)
        .eq(
          "mission_id",
          missionId,
        )
        .eq(
          "trainee_id",
          user.id,
        )
        .maybeSingle();

      if (
        existing?.status ===
        "approved"
      ) {
        await clearState(
          user.id,
        );

        await sendMessage(
          chatId,
          "✅ این مأموریت قبلاً تأیید شده است.",
          traineeMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      if (
        existing?.status ===
        "pending"
      ) {
        await clearState(
          user.id,
        );

        await sendMessage(
          chatId,
          "⏳ فعالیت این مأموریت قبلاً ارسال شده و در انتظار بررسی مربی است.",
          traineeMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await supabase
        .from("kanoon_users")
        .update({
          bot_state:
            "trainee_submit_proof",
          bot_temp_data:
            tempJson({
              missionId:
                String(
                  missionId,
                ),
            }),
        })
        .eq(
          "id",
          user.id,
        );

      await sendMessage(
        chatId,
        `🎯 ${mission.title}\n⭐ ${mission.xp_reward} امتیاز\n\n📝 توضیح یا گزارش انجام مأموریت را ارسال کنید:`,
        traineeMissionMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       TRAINEE → SUBMIT PROOF
       ===================================================== */

    if (
      user.role === "trainee" &&
      user.bot_state ===
        "trainee_submit_proof"
    ) {
      const data =
        parseTemp(
          user.bot_temp_data,
        );

      const missionId =
        Number(
          data.missionId,
        );

      if (
        !missionId ||
        !text
      ) {
        await sendMessage(
          chatId,
          "❌ گزارش فعالیت نمی‌تواند خالی باشد.",
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const {
        data: assignment,
      } = await supabase
        .from(
          "mission_assignments",
        )
        .select("mission_id")
        .eq(
          "mission_id",
          missionId,
        )
        .eq(
          "trainee_id",
          user.id,
        )
        .maybeSingle();

      if (!assignment) {
        await clearState(
          user.id,
        );

        await sendMessage(
          chatId,
          "❌ این مأموریت برای شما نیست.",
          traineeMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const { data: mission } = await supabase
        .from("missions")
        .select("id, title, xp_reward")
        .eq("id", missionId)
        .maybeSingle();

      if (!mission) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ مأموریت پیدا نشد.", traineeMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const { data: traineeForNotify } = await supabase
        .from("kanoon_users")
        .select("id, display_name, coach_id, bale_chat_id")
        .eq("id", user.id)
        .eq("role", "trainee")
        .maybeSingle();

      if (!traineeForNotify) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ اطلاعات متربی پیدا نشد.", traineeMissionMenu());
        return new Response(JSON.stringify({ ok: true }), { headers });
      }

      const {
        data: existing,
      } = await supabase
        .from(
          "mission_submissions",
        )
        .select(`
          id,
          status
        `)
        .eq(
          "mission_id",
          missionId,
        )
        .eq(
          "trainee_id",
          user.id,
        )
        .maybeSingle();

      if (
        existing?.status ===
        "approved"
      ) {
        await clearState(
          user.id,
        );

        await sendMessage(
          chatId,
          "✅ این مأموریت قبلاً تأیید شده است.",
          traineeMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const {
        error,
      } = await supabase
        .from(
          "mission_submissions",
        )
        .upsert(
          {
            mission_id:
              missionId,
            trainee_id:
              user.id,
            proof_text:
              text,
            status:
              "pending",
            reviewed_by:
              null,
            reviewed_at:
              null,
          },
          {
            onConflict:
              "mission_id,trainee_id",
          },
        );

      await clearState(
        user.id,
      );

      if (error) {
        console.error(
          "Mission submission error:",
          error,
        );

        await sendMessage(
          chatId,
          "❌ ارسال فعالیت انجام نشد.",
          traineeMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      await notifyCoachOfSubmission(
        traineeForNotify,
        mission,
        text,
      );

      await sendMessage(
        chatId,
        "✅ فعالیت شما ثبت شد.\n\n🔔 مربی شما برای بررسی فعالیت مطلع شد.\n\n⏳ پس از تأیید مربی، امتیاز مأموریت به حساب شما اضافه می‌شود.",
        traineeMissionMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       TRAINEE → MY ACTIVITIES
       ===================================================== */

    if (
      user.role === "trainee" &&
      text ===
        "⏳ فعالیت‌های من"
    ) {
      const {
        data: submissions,
        error,
      } = await supabase
        .from(
          "mission_submissions",
        )
        .select(`
          mission_id,
          proof_text,
          status,
          created_at
        `)
        .eq(
          "trainee_id",
          user.id,
        )
        .order(
          "created_at",
          { ascending: false },
        );

      if (error) {
        await sendMessage(
          chatId,
          "❌ دریافت فعالیت‌ها انجام نشد.",
          traineeMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      if (
        !submissions ||
        submissions.length === 0
      ) {
        await sendMessage(
          chatId,
          "⏳ هنوز فعالیتی ارسال نکرده‌اید.",
          traineeMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const missionIds = [
        ...new Set(
          submissions.map(
            (item) =>
              item.mission_id,
          ),
        ),
      ];

      const {
        data: missions,
      } = await supabase
        .from("missions")
        .select(`
          id,
          title,
          xp_reward
        `)
        .in(
          "id",
          missionIds,
        );

      const missionMap:
        Record<
          string,
          {
            title: string;
            xp_reward: number;
          }
        > = {};

      for (
        const mission of
          missions ?? []
      ) {
        missionMap[
          String(mission.id)
        ] = {
          title:
            mission.title,
          xp_reward:
            mission.xp_reward,
        };
      }

      let output =
        "⏳ فعالیت‌های من\n\n";

      submissions.forEach(
        (submission, index) => {
          const mission =
            missionMap[
              String(
                submission.mission_id,
              )
            ];

          const status =
            submission.status ===
            "approved"
              ? "✅ تأیید شده"
              : submission.status ===
                  "rejected"
                ? "❌ رد شده"
                : "⏳ در انتظار بررسی";

          output +=
            `${index + 1}. 🎯 ${
              mission?.title ??
              "-"
            }\n` +
            `⭐ ${
              mission?.xp_reward ??
              0
            } امتیاز\n` +
            `${status}\n` +
            `📝 ${
              submission.proof_text ||
              "-"
            }\n\n`;
        },
      );

      await sendMessage(
        chatId,
        output,
        traineeMissionMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → MISSION OVERSIGHT
       ===================================================== */

    if (
      user.role === "admin" &&
      text === "🎯 مأموریت‌ها"
    ) {
      await clearState(
        user.id,
      );

      await sendMessage(
        chatId,
        "🎯 نظارت بر مأموریت‌ها\n\nمدیر فقط مشاهده و گزارش‌گیری انجام می‌دهد.",
        adminMissionMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → VIEW MISSIONS
       ===================================================== */

    if (
      user.role === "admin" &&
      text ===
        "📋 مشاهده مأموریت‌ها"
    ) {
      const {
        data: missions,
        error,
      } = await supabase
        .from("missions")
        .select(`
          id,
          title,
          xp_reward,
          is_active,
          created_by,
          created_at
        `)
        .order(
          "created_at",
          { ascending: false },
        );

      if (error) {
        await sendMessage(
          chatId,
          "❌ دریافت مأموریت‌ها انجام نشد.",
          adminMissionMenu(),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      const coachIds = [
        ...new Set(
          (
            missions ?? []
          )
            .map(
              (item) =>
                item.created_by,
            )
            .filter(Boolean),
        ),
      ];

      const coachMap:
        Record<string, string> = {};

      if (coachIds.length > 0) {
        const {
          data: coaches,
        } = await supabase
          .from("kanoon_users")
          .select(`
            id,
            display_name
          `)
          .in(
            "id",
            coachIds,
          );

        for (
          const coach of
            coaches ?? []
        ) {
          coachMap[coach.id] =
            coach.display_name;
        }
      }

      let output =
        "📋 مأموریت‌ها\n\n";

      (
        missions ?? []
      ).forEach(
        (mission, index) => {
          output +=
            `${index + 1}. 🎯 ${mission.title}\n` +
            `🆔 کد : ${missionCode(mission.id)}\n` +
            `🚀 ${mission.xp_reward} امتیاز\n` +
            `👨‍🏫 ${
              coachMap[
                mission.created_by
              ] ??
              "نامشخص"
            }\n` +
            `${
              mission.is_active
                ? "🟢 فعال"
                : "🔴 غیرفعال"
            }\n\n`;
        },
      );

      if (
        !missions ||
        missions.length === 0
      ) {
        output =
          "مأموریتی ثبت نشده است.";
      }

      await sendMessage(
        chatId,
        output,
        adminMissionMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       ADMIN → MISSION REPORT
       ===================================================== */

    if (
      user.role === "admin" &&
      text ===
        "📊 گزارش مأموریت‌ها"
    ) {
      const [
        missionsResult,
        assignmentsResult,
        pendingResult,
        approvedResult,
      ] = await Promise.all([
        supabase
          .from("missions")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            },
          ),

        supabase
          .from(
            "mission_assignments",
          )
          .select(
            "id",
            {
              count: "exact",
              head: true,
            },
          ),

        supabase
          .from(
            "mission_submissions",
          )
          .select(
            "id",
            {
              count: "exact",
              head: true,
            },
          )
          .eq(
            "status",
            "pending",
          ),

        supabase
          .from(
            "mission_submissions",
          )
          .select(
            "id",
            {
              count: "exact",
              head: true,
            },
          )
          .eq(
            "status",
            "approved",
          ),
      ]);

      await sendMessage(
        chatId,
        `📊 گزارش مأموریت‌ها\n\n🎯 تعداد مأموریت‌ها: ${
          missionsResult.count ?? 0
        }\n📌 تعداد اختصاص‌ها: ${
          assignmentsResult.count ?? 0
        }\n⏳ فعالیت‌های در انتظار: ${
          pendingResult.count ?? 0
        }\n✅ فعالیت‌های تأییدشده: ${
          approvedResult.count ?? 0
        }`,
        adminMissionMenu(),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       REWARDS
       ===================================================== */

    if (text === "🎁 جوایز") {
      await clearState(user.id);
      await sendMessage(
        chatId,
        user.role === "admin"
          ? "🎁 مدیریت جوایز\n\nاز این بخش می‌توانید جوایز را تعریف کنید و درخواست‌های دریافت جایزه را بررسی کنید."
          : "🎁 جوایز\n\nامتیازهایتان را می‌توانید برای دریافت جوایز تعریف‌شده هزینه کنید. 👇",
        rewardsMenu(user.role),
      );
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "trainee" && text === "🎁 فهرست جوایز") {
      const { data: rewards, error } = await supabase
        .from("rewards")
        .select("id,title,description,xp_cost,stock,is_active")
        .eq("is_active", true)
        .order("xp_cost", { ascending: true });
      if (error) {
        await sendMessage(chatId, "❌ فهرست جوایز در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.", rewardsMenu("trainee"));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      if (!rewards?.length) {
        await sendMessage(chatId, "🎁 هنوز جایزه‌ای برای دریافت تعریف نشده است.\n\nبه‌زودی جوایز جدید اضافه می‌شود. 🌱", rewardsMenu("trainee"));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      let out = "🎁 فروشگاه امتیازی\n\n";
      for (const r of rewards) {
        out += `🎁 ${r.title}\n⭐ هزینه: ${r.xp_cost} امتیاز\n${r.stock == null ? "📦 موجود" : r.stock > 0 ? `📦 موجودی: ${r.stock}` : "⛔ ناموجود"}\n${r.description ? `📝 ${r.description}\n` : ""}\n`;
      }
      out += "👇 برای مشاهده و درخواست، روی جایزه موردنظر بزنید.";
      await supabase.from("kanoon_users").update({ bot_state: "reward_select", bot_temp_data: null }).eq("id", user.id);
      await sendMessage(chatId, out, rewardListKeyboard(rewards));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "trainee" && user.bot_state === "reward_select") {
      const m = text.match(/^🎁 #(?:(\d+)) \\| /);
      if (!m) {
        await sendMessage(chatId, "❌ لطفاً یکی از جوایز را از دکمه‌ها انتخاب کنید.", rewardsMenu("trainee"));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      const rewardId = Number(m[1]);
      const { data: reward } = await supabase.from("rewards").select("id,title,description,xp_cost,stock,is_active").eq("id", rewardId).eq("is_active", true).maybeSingle();
      if (!reward || (reward.stock != null && reward.stock <= 0)) {
        await clearState(user.id);
        await sendMessage(chatId, "⛔ این جایزه در حال حاضر قابل دریافت نیست.", rewardsMenu("trainee"));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      await supabase.from("kanoon_users").update({ bot_state: "reward_confirm", bot_temp_data: tempJson({ rewardId: String(reward.id) }) }).eq("id", user.id);
      await sendMessage(chatId, `🎁 ${reward.title}\n\n⭐ هزینه: ${reward.xp_cost} امتیاز\n💎 امتیاز شما: ${user.xp}\n\n${reward.description ? `📝 ${reward.description}\n\n` : ""}${user.xp < reward.xp_cost ? "⛔ امتیاز کافی ندارید." : "آیا می‌خواهید این جایزه را درخواست کنید؟"}`, {
        keyboard: [
          ...(user.xp >= reward.xp_cost ? [[{ text: "✅ ثبت درخواست" }]] : []),
          [{ text: "🔙 بازگشت" }],
        ], resize_keyboard: true,
      });
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "trainee" && user.bot_state === "reward_confirm") {
      if (text !== "✅ ثبت درخواست") {
        await clearState(user.id);
        await sendMessage(chatId, "درخواست لغو شد.", rewardsMenu("trainee"));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      const data = parseTemp(user.bot_temp_data);
      const { data: reward } = await supabase.from("rewards").select("id,title,xp_cost,stock,is_active").eq("id", Number(data.rewardId)).eq("is_active", true).maybeSingle();
      const { data: fresh } = await supabase.from("kanoon_users").select("xp").eq("id", user.id).maybeSingle();
      if (!reward || (reward.stock != null && reward.stock <= 0) || !fresh || fresh.xp < reward.xp_cost) {
        await clearState(user.id);
        await sendMessage(chatId, "⛔ در لحظه ثبت درخواست، شرایط دریافت جایزه برقرار نبود. امتیاز شما تغییری نکرد.", rewardsMenu("trainee"));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      const newXp = fresh.xp - reward.xp_cost;
      const newLevel = levelProgress(newXp).level;
      const { error: xpError } = await supabase.from("kanoon_users").update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (xpError) {
        await clearState(user.id);
        await sendMessage(chatId, "❌ ثبت درخواست انجام نشد و امتیاز شما تغییر نکرد.", rewardsMenu("trainee"));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      const { error: redemptionError } = await supabase.from("reward_redemptions").insert({ user_id: user.id, reward_id: reward.id, status: "pending" });
      if (redemptionError) {
        await supabase.from("kanoon_users").update({ xp: fresh.xp, level: levelProgress(fresh.xp).level, updated_at: new Date().toISOString() }).eq("id", user.id);
        await clearState(user.id);
        await sendMessage(chatId, "❌ ثبت درخواست انجام نشد و امتیاز شما به حالت قبل برگشت.", rewardsMenu("trainee"));
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      if (reward.stock != null) await supabase.from("rewards").update({ stock: reward.stock - 1 }).eq("id", reward.id);
      await supabase.from("xp_transactions").insert({ user_id: user.id, amount: -reward.xp_cost, reason: `درخواست جایزه: ${reward.title}`, source_type: "reward_redemption", source_id: reward.id });
      await clearState(user.id);
      await sendMessage(chatId, `🎉 درخواست شما ثبت شد!\n\n🎁 ${reward.title}\n⭐ ${reward.xp_cost} امتیاز از موجودی شما کسر شد.\n💎 موجودی جدید: ${newXp} امتیاز\n\n⏳ درخواست شما در انتظار بررسی است.`, mainMenu("trainee"));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "trainee" && text === "🎟️ جوایز دریافتی و درخواست‌ها") {
      const { data: rows } = await supabase.from("reward_redemptions").select("id,reward_id,status,created_at,rewards(title,xp_cost)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15);
      if (!rows?.length) {
        await sendMessage(chatId, "🎟️ هنوز درخواست جایزه‌ای ثبت نکرده‌اید.", rewardsMenu("trainee"));
      } else {
        let out = "🎟️ تاریخچه درخواست‌های جایزه\n\n";
        for (const r of rows as any[]) {
          const rw = Array.isArray(r.rewards) ? r.rewards[0] : r.rewards;
          const st = r.status === "approved" ? "✅ تأیید شده" : r.status === "rejected" ? "❌ رد شده" : "⏳ در انتظار بررسی";
          out += `🎁 ${rw?.title ?? "جایزه"}\n⭐ ${rw?.xp_cost ?? 0} امتیاز\n${st}\n\n`;
        }
        await sendMessage(chatId, out, rewardsMenu("trainee"));
      }
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && text === "🎁 جوایز") {
      await clearState(user.id);
      await sendMessage(chatId, "🎁 مدیریت جوایز\n\nاز این بخش می‌توانید فهرست جوایز، افزودن جایزه و درخواست‌های دریافتی را مدیریت کنید.", rewardsMenu("admin"));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && text === "📋 فهرست جوایز") {
      const { data: rewards } = await supabase.from("rewards").select("id,title,description,xp_cost,stock,is_active").order("created_at", { ascending: false });
      let out = "📋 فهرست جوایز\n\n";
      if (!rewards?.length) out += "هنوز جایزه‌ای تعریف نشده است.";
      else for (const r of rewards) out += `#${r.id} 🎁 ${r.title}\n⭐ ${r.xp_cost} امتیاز | ${r.is_active ? "🟢 فعال" : "🔴 غیرفعال"}\n📦 ${r.stock == null ? "نامحدود" : r.stock}\n\n`;
      await sendMessage(chatId, out, rewardsMenu("admin"));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && text === "➕ افزودن جایزه") {
      await supabase.from("kanoon_users").update({ bot_state: "reward_admin_title", bot_temp_data: null }).eq("id", user.id);
      await sendMessage(chatId, "➕ افزودن جایزه\n\nنام جایزه را وارد کنید:", rewardsMenu("admin"));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && user.bot_state === "reward_admin_title") {
      if (text.length < 2) { await sendMessage(chatId, "❌ نام جایزه کوتاه است. دوباره وارد کنید."); return new Response(JSON.stringify({ ok: true }), { headers }); }
      await supabase.from("kanoon_users").update({ bot_state: "reward_admin_desc", bot_temp_data: tempJson({ title: text }) }).eq("id", user.id);
      await sendMessage(chatId, "📝 توضیح جایزه را وارد کنید.\nاگر توضیح ندارد، «-» بفرستید.");
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && user.bot_state === "reward_admin_desc") {
      const d = parseTemp(user.bot_temp_data); d.description = text === "-" ? "" : text;
      await supabase.from("kanoon_users").update({ bot_state: "reward_admin_cost", bot_temp_data: tempJson(d) }).eq("id", user.id);
      await sendMessage(chatId, "⭐ هزینه جایزه را برحسب امتیاز وارد کنید.\nمثال: 100");
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && user.bot_state === "reward_admin_cost") {
      const cost = Number(text); if (!Number.isInteger(cost) || cost <= 0) { await sendMessage(chatId, "❌ هزینه باید یک عدد مثبت باشد."); return new Response(JSON.stringify({ ok: true }), { headers }); }
      const d = parseTemp(user.bot_temp_data); d.xp_cost = String(cost);
      await supabase.from("kanoon_users").update({ bot_state: "reward_admin_stock", bot_temp_data: tempJson(d) }).eq("id", user.id);
      await sendMessage(chatId, "📦 موجودی را وارد کنید.\nبرای موجودی نامحدود، «-» بفرستید.");
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && user.bot_state === "reward_admin_stock") {
      const stock = text === "-" ? null : Number(text); if (stock !== null && (!Number.isInteger(stock) || stock < 0)) { await sendMessage(chatId, "❌ موجودی نامعتبر است."); return new Response(JSON.stringify({ ok: true }), { headers }); }
      const d = parseTemp(user.bot_temp_data);
      const { data: reward, error } = await supabase.from("rewards").insert({ title: d.title, description: d.description || null, xp_cost: Number(d.xp_cost), stock, is_active: true }).select("id,title,xp_cost,stock").single();
      await clearState(user.id);
      await sendMessage(chatId, error ? `❌ ایجاد جایزه انجام نشد.\n\n${error.message}` : `🎁 جایزه با موفقیت ایجاد شد.\n\n🎁 ${reward.title}\n⭐ ${reward.xp_cost} امتیاز\n📦 ${reward.stock == null ? "نامحدود" : reward.stock}`, rewardsMenu("admin"));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && text === "🎟️ درخواست‌های جایزه") {
      const { data: rows } = await supabase.from("reward_redemptions").select("id,user_id,reward_id,status,created_at,rewards(title,xp_cost)").eq("status", "pending").order("created_at", { ascending: true });
      if (!rows?.length) { await sendMessage(chatId, "🎟️ درخواست در انتظار بررسی وجود ندارد.\n\nهمه‌چیز مرتب است. ✅", rewardsMenu("admin")); return new Response(JSON.stringify({ ok: true }), { headers }); }
      const ids = [...new Set(rows.map((r:any)=>r.user_id))]; const { data: users } = await supabase.from("kanoon_users").select("id,display_name").in("id", ids);
      const map: Record<string,string> = {}; for (const u of users ?? []) map[u.id]=u.display_name;
      let out="🎟️ درخواست‌های جایزه\n\n"; for (const r of rows as any[]) { const rw=Array.isArray(r.rewards)?r.rewards[0]:r.rewards; out += `#${r.id} 👤 ${map[r.user_id] ?? "-"}\n🎁 ${rw?.title ?? "-"}\n⭐ ${rw?.xp_cost ?? 0} امتیاز\n\n`; }
      await supabase.from("kanoon_users").update({ bot_state:"reward_admin_review", bot_temp_data:null }).eq("id", user.id);
      await sendMessage(chatId, out+"👇 درخواست موردنظر را انتخاب کنید:", rewardReviewKeyboard((rows as any[]).map(r=>({id:r.id,name:map[r.user_id] ?? "کاربر"}))));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    if (user.role === "admin" && user.bot_state === "reward_admin_review") {
      const m=text.match(/^🎟️ #(\d+) \\| /); if(!m){await sendMessage(chatId,"❌ لطفاً یکی از درخواست‌ها را از دکمه‌ها انتخاب کنید.",rewardsMenu("admin"));return new Response(JSON.stringify({ok:true}),{headers});}
      const id=Number(m[1]); const {data:r}=await supabase.from("reward_redemptions").select("id,status,user_id,reward_id,rewards(title,xp_cost)").eq("id",id).eq("status","pending").maybeSingle();
      if(!r){await clearState(user.id);await sendMessage(chatId,"❌ درخواست پیدا نشد یا قبلاً بررسی شده است.",rewardsMenu("admin"));return new Response(JSON.stringify({ok:true}),{headers});}
      const rw=Array.isArray((r as any).rewards)?(r as any).rewards[0]:(r as any).rewards; await supabase.from("kanoon_users").update({bot_state:"reward_admin_action",bot_temp_data:tempJson({redemptionId:String(r.id),userId:r.user_id,rewardId:String(r.reward_id)})}).eq("id",user.id);
      await sendMessage(chatId,`🎟️ بررسی درخواست\n\n🎁 ${rw?.title ?? "-"}\n⭐ ${rw?.xp_cost ?? 0} امتیاز\n\nنتیجه را انتخاب کنید:`,{keyboard:[[{text:"✅ تأیید تحویل"},{text:"❌ رد درخواست"}],[{text:"🔙 بازگشت"}]],resize_keyboard:true});
      return new Response(JSON.stringify({ok:true}),{headers});
    }

    if (user.role === "admin" && user.bot_state === "reward_admin_action") {
      const data=parseTemp(user.bot_temp_data); if(text!=="✅ تأیید تحویل" && text!=="❌ رد درخواست"){await sendMessage(chatId,"❌ یکی از دو گزینه را انتخاب کنید.");return new Response(JSON.stringify({ok:true}),{headers});}
      const status=text==="✅ تأیید تحویل"?"approved":"rejected";
      const { data: rewardRow } = await supabase.from("rewards").select("id,title,xp_cost,stock").eq("id",Number(data.rewardId)).maybeSingle();
      const { error }=await supabase.from("reward_redemptions").update({status,reviewed_by:user.id,reviewed_at:new Date().toISOString()}).eq("id",Number(data.redemptionId)).eq("status","pending");
      if (!error && status === "rejected" && rewardRow) {
        const { data: target } = await supabase.from("kanoon_users").select("xp,level").eq("id",data.userId).maybeSingle();
        if (target) {
          const restoredXp = target.xp + rewardRow.xp_cost;
          await supabase.from("kanoon_users").update({xp:restoredXp,level:Math.floor(restoredXp/100)+1,updated_at:new Date().toISOString()}).eq("id",data.userId);
          await supabase.from("xp_transactions").insert({user_id:data.userId,amount:rewardRow.xp_cost,reason:`بازگشت امتیاز بابت رد جایزه: ${rewardRow.title}`,source_type:"reward_redemption",source_id:Number(data.redemptionId)});
          if (rewardRow.stock != null) await supabase.from("rewards").update({stock:rewardRow.stock+1}).eq("id",rewardRow.id);
        }
      }
      if (!error && rewardRow) await notifyRewardReview(data.userId, rewardRow.title, status);
      await clearState(user.id); await sendMessage(chatId,error?`❌ ثبت نتیجه انجام نشد.\n\n${error.message}`:`${status==="approved"?"🎉 تحویل جایزه تأیید شد.":"📌 درخواست جایزه رد شد و امتیاز رزروشده به حساب کاربر برگشت."}\n\n🔔 نتیجه برای کاربر ارسال شد.`,rewardsMenu("admin"));
      return new Response(JSON.stringify({ok:true}),{headers});
    }

    /* =====================================================
       BADGES
       ===================================================== */

    if (user.role === "trainee" && text === "🎖️ نشان‌های من") {
      const defaults = [
        { name:"شروع قدرتمند", description:"رسیدن به 100 امتیاز", icon:"🌱", xp_required:100 },
        { name:"رهرو پرتلاش", description:"رسیدن به 250 امتیاز", icon:"🔥", xp_required:250 },
        { name:"قدم‌های استوار", description:"رسیدن به 500 امتیاز", icon:"🏅", xp_required:500 },
        { name:"الگوی جمع", description:"رسیدن به 1000 امتیاز", icon:"🏆", xp_required:1000 },
      ];
      for (const b of defaults) await supabase.from("badges").upsert(b,{onConflict:"name"});
      const { data: earned } = await supabase.from("user_badges").select("earned_at,badges(name,description,icon,xp_required)").eq("user_id",user.id).order("earned_at",{ascending:false});
      const { data: all } = await supabase.from("badges").select("name,description,icon,xp_required").order("xp_required",{ascending:true});
      let out=`🎖️ نشان‌های من\n\n⭐ امتیاز فعلی: ${user.xp}\n\n`;
      if(!earned?.length) out += "هنوز نشانی به‌دست نیاورده‌ای.\n\nبا انجام مأموریت‌ها، اولین نشان منتظر توست. 🌱\n\n";
      else { out += "نشان‌های به‌دست‌آمده:\n"; for(const e of earned as any[]){const b=Array.isArray(e.badges)?e.badges[0]:e.badges; out+=`${b?.icon??"🎖️"} ${b?.name??"نشان"} — ${b?.description??""}\n`; } out+="\n"; }
      out += "نشان‌های پیش‌رو:\n"; for(const b of all??[]) if(!(earned??[]).some((e:any)=>{const x=Array.isArray(e.badges)?e.badges[0]:e.badges;return x?.name===b.name;})) out += `${b.icon} ${b.name} — ${b.xp_required} امتیاز\n`;
      await sendMessage(chatId,out,mainMenu("trainee")); return new Response(JSON.stringify({ok:true}),{headers});
    }

    /* =====================================================
       REPORTS
       ===================================================== */

    if (user.role === "admin" && text === "📊 گزارش‌ها") {
      const [users, coaches, trainees, missions, pending, approved, xp] = await Promise.all([
        supabase.from("kanoon_users").select("id",{count:"exact",head:true}).eq("is_active",true),
        supabase.from("kanoon_users").select("id",{count:"exact",head:true}).eq("role","coach").eq("is_active",true),
        supabase.from("kanoon_users").select("id",{count:"exact",head:true}).eq("role","trainee").eq("is_active",true),
        supabase.from("missions").select("id",{count:"exact",head:true}).eq("is_active",true),
        supabase.from("mission_submissions").select("id",{count:"exact",head:true}).eq("status","pending"),
        supabase.from("mission_submissions").select("id",{count:"exact",head:true}).eq("status","approved"),
        supabase.from("xp_transactions").select("amount"),
      ]);
      const totalXp=(xp.data??[]).reduce((sum:any,x:any)=>sum+Math.max(0,Number(x.amount)||0),0);
      await sendMessage(chatId,`📊 داشبورد کانون\n\n👥 کاربران فعال: ${users.count??0}\n👨‍🏫 مربی‌های فعال: ${coaches.count??0}\n🎓 متربی‌های فعال: ${trainees.count??0}\n🎯 مأموریت‌های فعال: ${missions.count??0}\n⏳ فعالیت در انتظار بررسی: ${pending.count??0}\n✅ فعالیت‌های تأییدشده: ${approved.count??0}\n⭐ مجموع امتیازهای اعطاشده: ${totalXp}\n\nاین گزارش برای نظارت کلی مدیر تهیه شده است.`,mainMenu("admin"));
      return new Response(JSON.stringify({ok:true}),{headers});
    }

    if (user.role === "coach" && text === "📊 گزارش من") {
      const [{count:traineeCount},{count:missionCount},{count:pendingCount},{data:tx}] = await Promise.all([
        supabase.from("kanoon_users").select("id",{count:"exact",head:true}).eq("coach_id",user.id).eq("role","trainee").eq("is_active",true),
        supabase.from("missions").select("id",{count:"exact",head:true}).eq("created_by",user.id),
        supabase.from("mission_submissions").select("id",{count:"exact",head:true}).eq("status","pending"),
        supabase.from("xp_transactions").select("amount,user_id").eq("source_type","mission_submission"),
      ]);
      const ownTraineeIds=(await supabase.from("kanoon_users").select("id").eq("coach_id",user.id).eq("role","trainee")).data?.map((x:any)=>x.id)??[];
      const ownXp=(tx??[]).filter((x:any)=>ownTraineeIds.includes(x.user_id)).reduce((s:any,x:any)=>s+Math.max(0,Number(x.amount)||0),0);
      await sendMessage(chatId,`📊 گزارش مربی\n\n👨‍🏫 ${user.display_name}\n🎓 متربی‌های فعال: ${traineeCount??0}\n🎯 مأموریت‌های ایجادشده: ${missionCount??0}\n⏳ فعالیت‌های در انتظار: ${pendingCount??0}\n⭐ امتیاز اعطاشده به متربی‌های شما: ${ownXp}\n\n🌱 هدف این گزارش، کمک به پیگیری روند فعالیت متربی‌های شماست.`,mainMenu("coach"));
      return new Response(JSON.stringify({ok:true}),{headers});
    }

    if (text === "⚙️ تنظیمات") {
      await clearState(user.id);
      await sendMessage(chatId,`⚙️ تنظیمات و راهنما\n\n🏛️ کانون: حلقه‌های رهروان شهدا\n🤖 بات: @${BOT_USERNAME}\n\n📌 راهنما:\n• مأموریت‌ها از طریق دکمه‌ها انتخاب می‌شوند.\n• ارسال فعالیت از داخل همان مأموریت انجام می‌شود.\n• پس از تأیید مربی، امتیاز به حساب متربی اضافه می‌شود.\n• رتبه و سطح بر اساس امتیاز به‌روزرسانی می‌شود.\n\nنسخه: 1.0`,mainMenu(user.role));
      return new Response(JSON.stringify({ok:true}),{headers});
    }

    /* =====================================================
       RANKING
       ===================================================== */

    if (
      text === "🏆 رتبه‌بندی"
    ) {
      const {
        data: ranking,
        error,
      } = await supabase
        .from("kanoon_users")
        .select(`
          display_name,
          xp,
          level,
          role
        `)
        .eq(
          "role",
          "trainee",
        )
        .eq(
          "is_active",
          true,
        )
        .order(
          "xp",
          { ascending: false },
        )
        .limit(10);

      if (error) {
        await sendMessage(
          chatId,
          "❌ دریافت رتبه‌بندی انجام نشد.",
          mainMenu(user.role),
        );

        return new Response(
          JSON.stringify({ ok: true }),
          { headers },
        );
      }

      let output =
        "🏆 رتبه‌بندی متربی‌ها\n\n";

      if (
        !ranking ||
        ranking.length === 0
      ) {
        output +=
          "هنوز امتیازی ثبت نشده است.";
      } else {
        ranking.forEach(
          (item, index) => {
            output +=
              `${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`} ${item.display_name} — ⭐ ${item.xp} امتیاز — ⚡ سطح ${item.level}\n`;
          },
        );
      }

      await sendMessage(
        chatId,
        output,
        mainMenu(user.role),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       PROFILE
       ===================================================== */

    if (
      text === "👤 پروفایل"
    ) {
      await sendMessage(
        chatId,
        `👤 پروفایل من\n\n━━━━━━━━━━━━━━\n👤 نام: ${user.display_name}\n🎭 نقش: ${roleText(user.role)}\n━━━━━━━━━━━━━━\n\n${xpCard(user)}\n\n🌱 با انجام مأموریت‌ها، امتیاز جمع کن و سطح خودت را بالا ببر.\n🧭 برای دیدن تمام مراحل، «مسیر رشد من» را انتخاب کن.`,
        mainMenu(user.role),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       مسیر رشد
       ===================================================== */

    if (
      user.role === "trainee" &&
      text === "🧭 مسیر رشد من"
    ) {
      const { count: aheadCount } = await supabase
        .from("kanoon_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "trainee")
        .eq("is_active", true)
        .gt("xp", user.xp);

      const { count: activeCount } = await supabase
        .from("kanoon_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "trainee")
        .eq("is_active", true);

      const rank = Math.max(1, (aheadCount ?? 0) + 1);
      const total = activeCount ?? rank;
      await sendMessage(
        chatId,
        levelPathCard(user.xp) + `\n\n${xpCard(user)}\n\n🏆 جایگاه فعلی: ${rank} از ${total} متربی\n\n🌱 هر مأموریت تأییدشده، تو را یک قدم جلوتر می‌برد.`,
        mainMenu(user.role),
      );
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    /* =====================================================
       امتیاز
       ===================================================== */

    if (
      text === "⭐ امتیاز من"
    ) {
      await sendMessage(
        chatId,
        `⭐ وضعیت امتیاز شما\n\n${xpCard(user)}\n\n💡 هر مأموریت تأییدشده می‌تواند امتیاز شما را بیشتر کند. ادامه بده! 💪`,
        mainMenu(user.role),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       BACK
       ===================================================== */

    if (
      text === "🔙 بازگشت"
    ) {
      await clearState(
        user.id,
      );

      await sendMessage(
        chatId,
        "منوی اصلی:",
        mainMenu(user.role),
      );

      return new Response(
        JSON.stringify({ ok: true }),
        { headers },
      );
    }

    /* =====================================================
       DEFAULT
       ===================================================== */

    await sendMessage(
      chatId,
      "❌ این گزینه در حال حاضر در دسترس نیست.\n\nاز دکمه‌های منو استفاده کنید.",
      mainMenu(user.role),
    );

    return new Response(
      JSON.stringify({ ok: true }),
      { headers },
    );

  } catch (error) {
    console.error(
      "Unhandled error:",
      error,
    );

    return new Response(
      JSON.stringify({
        ok: false,
        error:
          "Internal server error",
      }),
      {
        status: 500,
        headers,
      },
    );
  }
});