<template>
  <div dir="rtl" lang="ar" class="min-h-screen flex flex-col relative overflow-hidden selection:bg-[#FF4D00] selection:text-white bg-[#F7F7F5] dark:bg-[#080808] text-zinc-900 dark:text-white">
    <!-- Background system -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#FF4D00]/[0.09] rounded-full blur-[160px]" />
      <div class="absolute top-[42%] -right-32 w-[560px] h-[560px] bg-[#FF4D00]/[0.06] rounded-full blur-[140px]" />
    </div>

    <!-- NAV -->
    <nav class="relative z-30 max-w-[1280px] mx-auto w-full px-6 sm:px-8 h-[72px] flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-[14px] bg-[#FF4D00] flex items-center justify-center shadow-[0_8px_20px_rgba(255,77,0,0.35)]">
          <svg class="h-[20px] w-[20px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7v2a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7Z"/><path d="M12 16v4"/><path d="M8 20h8"/></svg>
        </div>
        <span class="text-[19px] font-extrabold tracking-[-0.03em]">TalkBridge</span>
        <span class="hidden sm:inline-flex mr-2 px-2.5 py-1 rounded-full bg-[#FF4D00]/10 border border-[#FF4D00]/15 text-[11px] font-bold tracking-widest text-[#FF4D00]">BETA</span>
      </div>
      <div class="flex items-center gap-2">
        <a href="#how" class="hidden md:inline-flex px-4 py-2 text-[13px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-[#FF4D00] transition">كيف يعمل</a>
        <a href="#features" class="hidden md:inline-flex px-4 py-2 text-[13px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-[#FF4D00] transition">المميزات</a>
        <button @click="joinModalOpen = true" class="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-extrabold bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 hover:border-[#FF4D00] transition">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          انضمام برمز
        </button>
        <button @click="theme.toggle()" class="w-9 h-9 rounded-full grid place-items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-[#FF4D00] transition">
          <svg v-if="theme.isDark.value" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
          <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>
    </nav>

    <!-- HERO: asymmetric editorial -->
    <header class="relative z-10 max-w-[1280px] mx-auto w-full px-6 sm:px-8 pt-8 sm:pt-12 pb-10">
      <div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-8 items-center">
        <!-- Right copy (RTL first) -->
        <div class="order-2 lg:order-1">
          <div class="inline-flex items-center gap-2 ps-3 pe-4 py-1.5 rounded-full bg-[#FF4D00] text-white text-xs font-extrabold shadow-[0_6px_16px_rgba(255,77,0,0.35)]">
            <span class="w-5 h-5 rounded-full bg-white/20 grid place-items-center"><span class="w-2 h-2 rounded-full bg-white animate-pulse"/></span>
            ترجمة حيّة بالصوت والصورة
          </div>
          <h1 class="mt-5 text-[42px] sm:text-[56px] lg:text-[64px] font-black leading-[0.95] tracking-[-0.05em]">
            احكِ بلغتك،<br/>
            <span class="relative inline-block">
              <span class="relative z-10 text-[#FF4D00]">يسمعك العالم</span>
              <span class="absolute bottom-1 inset-x-0 h-[0.45em] bg-[#FF4D00]/15 -rotate-[1deg]"/>
            </span>
            <br/>بلا حواجز.
          </h1>
          <p class="mt-5 text-[16px] sm:text-[18px] leading-8 text-zinc-500 dark:text-zinc-400 max-w-[520px]">
            غرفة واحدة، لغتان. تتكلم عربي ويسمعك زميلك إنجليزي والعكس — صوتاً ونصاً في نفس اللحظة، داخل المتصفح فقط بدون خوادم وسيطة.
          </p>
          <div class="mt-7 flex flex-col sm:flex-row gap-3">
            <button @click="createMeeting" class="inline-flex items-center justify-center gap-2.5 h-[52px] px-7 rounded-[16px] bg-[#FF4D00] hover:bg-[#E64500] text-white font-extrabold text-[15px] shadow-[0_12px_32px_rgba(255,77,0,0.35)] hover:shadow-[0_16px_40px_rgba(255,77,0,0.45)] hover:-translate-y-[1px] transition-all">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Zm7 10a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-1.06A9 9 0 0 0 21 12h-2Z"/></svg>
              ابدأ اجتماعًا الآن
            </button>
            <a href="#how" class="inline-flex items-center justify-center gap-2 h-[52px] px-7 rounded-[16px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 font-extrabold text-[15px] hover:border-[#FF4D00] transition">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              شاهد كيف يعمل
            </a>
          </div>
          <div class="mt-6 flex flex-wrap items-center gap-4 text-[13px] font-bold text-zinc-500 dark:text-zinc-400">
            <span class="inline-flex items-center gap-1.5"><span class="w-5 h-5 rounded-full bg-emerald-500/15 grid place-items-center"><svg class="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg></span> مجاني 100%</span>
            <span class="inline-flex items-center gap-1.5"><span class="w-5 h-5 rounded-full bg-emerald-500/15 grid place-items-center"><svg class="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg></span> 14+ لغة</span>
            <span class="inline-flex items-center gap-1.5"><span class="w-5 h-5 rounded-full bg-emerald-500/15 grid place-items-center"><svg class="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg></span> بدون تثبيت</span>
          </div>
          <p class="mt-2 text-xs font-medium text-zinc-400">يعمل في Chrome/Edge — الميكروفون والكاميرا بإذنك فقط</p>
        </div>

        <!-- Left visual: layered translation deck (SIGNATURE) -->
        <div class="order-1 lg:order-2 relative mx-auto w-full max-w-[520px] lg:max-w-none">
          <!-- glow -->
          <div class="absolute -top-10 -left-10 w-[420px] h-[420px] bg-[#FF4D00]/10 rounded-full blur-[80px]" />
          <div class="relative rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.12)] overflow-hidden">
            <!-- top bar -->
            <div class="h-14 px-5 flex items-center justify-between border-b border-zinc-100 dark:border-white/5 bg-zinc-50/70 dark:bg-white/[0.02] backdrop-blur">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500"/><span class="w-3 h-3 rounded-full bg-yellow-400"/><span class="w-3 h-3 rounded-full bg-green-500"/>
              </div>
              <div class="flex items-center gap-2 text-xs font-extrabold">
                <span class="px-2.5 py-1 rounded-full bg-[#FF4D00] text-white">LIVE</span>
                <span class="hidden sm:inline text-zinc-500">غرفة H7K2 • عربي ⇄ English</span>
                <span class="sm:hidden text-zinc-500">عربي ⇄ EN</span>
              </div>
              <div class="w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 grid place-items-center text-[10px] font-black">●</div>
            </div>
            <!-- deck -->
            <div class="p-5 sm:p-6 space-y-3 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-[#0a0a0a]">
              <!-- card 1 -->
              <div class="flex gap-3">
                <div class="w-9 h-9 rounded-full bg-[#FF4D00] text-white grid place-items-center text-xs font-black shrink-0">أ</div>
                <div class="flex-1">
                  <div class="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400"><span>أحمد</span><span>•</span><span class="text-[#FF4D00]">عربي</span></div>
                  <div class="mt-1 rounded-[18px] rounded-tr-[6px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 text-[14px] font-medium leading-6 shadow">مرحباً سارة، هل نبدأ عرض المشروع اليوم؟</div>
                  <div class="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500"><svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 0-7 7v2a7 7 0 0 0 7 7 7 7 0 0 0 7-7V9a7 7 0 0 0-7-7Z"/><path d="M8 14a4 4 0 0 0 8 0"/></svg> يُسمع بالإنجليزية لسارة</div>
                </div>
              </div>
              <!-- card 2 -->
              <div class="flex gap-3 flex-row-reverse text-left" dir="ltr">
                <div class="w-9 h-9 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 grid place-items-center text-xs font-black shrink-0">S</div>
                <div class="flex-1">
                  <div class="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 justify-end"><span class="text-[#FF4D00]">EN</span><span>•</span><span>Sarah</span></div>
                  <div class="mt-1 rounded-[18px] rounded-tl-[6px] bg-[#FF4D00]/10 border border-[#FF4D00]/20 text-zinc-900 dark:text-white px-4 py-3 text-[14px] font-medium leading-6 text-left">Yes Ahmed! Let's start — I'm ready.</div>
                  <div class="mt-1.5 flex items-center justify-end gap-1.5 text-[11px] font-medium text-zinc-500">Heard in Arabic for Ahmed <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></div>
                </div>
              </div>
              <!-- wave -->
              <div class="rounded-[16px] bg-[#FF4D00] text-white p-3 flex items-center gap-3">
                <div class="flex items-center gap-[3px]">
                  <span v-for="i in 5" :key="i" class="w-[3px] bg-white rounded-full animate-pulse" :style="{height: (10+i*3)+'px', animationDelay: i*120+'ms'}" />
                </div>
                <span class="text-xs font-bold">الترجمة الصوتية تعمل الآن — كل طرف يسمع بلغته</span>
                <span class="ms-auto w-7 h-7 rounded-full bg-white/20 grid place-items-center"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a1 1 0 0 0-1 1v7H5a1 1 0 1 0 0 2h6v7a1 1 0 1 0 2 0v-7h6a1 1 0 1 0 0-2h-6V4a1 1 0 0 0-1-1z"/></svg></span>
              </div>
            </div>
            <!-- participants strip -->
            <div class="px-4 py-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-zinc-900">
              <div class="flex -space-x-2 rtl:space-x-reverse">
                <img v-for="n in 3" :key="n" :src="`https://i.pravatar.cc/100?img=${10+n}`" class="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 object-cover" alt="" />
                <span class="w-7 h-7 rounded-full bg-[#FF4D00] text-white grid place-items-center text-[11px] font-black border-2 border-white dark:border-zinc-900">+2</span>
              </div>
              <span class="text-xs font-bold text-zinc-500">5 مشاركين • مشفّر</span>
            </div>
          </div>
          <!-- floating pills -->
          <div class="hidden sm:flex absolute -left-4 top-6 items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-lg text-xs font-extrabold">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> ترجمة فورية
          </div>
          <div class="hidden sm:flex absolute -right-4 bottom-10 items-center gap-2 px-3 py-2 rounded-full bg-zinc-900 text-white shadow-lg text-xs font-extrabold">
            <svg class="h-4 w-4 text-[#FF4D00]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"/><path d="M19 11a7 7 0 0 1-14 0"/></svg>
            بدون تخزين صوتي
          </div>
        </div>
      </div>
    </header>

    <!-- TRUST: single line, quiet -->
    <section class="relative z-10 max-w-[1280px] mx-auto w-full px-6 sm:px-8">
      <div class="rounded-[20px] border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur px-4 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-zinc-500">
        <span>يعمل كلياً داخل المتصفح</span><span class="hidden sm:block w-1 h-1 rounded-full bg-zinc-300 dark:bg-white/20"/>
        <span>لا تُرسل إلا النص</span><span class="hidden sm:block w-1 h-1 rounded-full bg-zinc-300 dark:bg-white/20"/>
        <span>Web Speech + MyMemory + speechSynthesis — مجاني 100%</span>
      </div>
    </section>

    <!-- HOW IT WORKS: timeline -->
    <section id="how" class="relative z-10 max-w-[1280px] mx-auto w-full px-6 sm:px-8 pt-16 pb-6">
      <div class="flex flex-col items-start gap-3 mb-8">
        <span class="px-3 py-1 rounded-full bg-[#FF4D00]/10 border border-[#FF4D00]/15 text-[#FF4D00] text-xs font-black tracking-widest">كيف يعمل</span>
        <h2 class="text-[28px] sm:text-[36px] font-black tracking-[-0.04em] leading-none">ثلاث خطوات، وينتهي حاجز اللغة</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">لا WebRTC معقّد، لا TURN — فقط نص يُرسل وصوت يُولّد محلياً.</p>
      </div>
      <div class="relative grid md:grid-cols-3 gap-4">
        <div class="hidden md:block absolute top-[34px] inset-x-6 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/10 to-transparent" />
        <div v-for="s in steps" :key="s.n" class="relative rounded-[24px] border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 p-6 hover:border-[#FF4D00]/30 hover:-translate-y-[2px] transition-all">
          <div class="w-12 h-12 rounded-[14px] bg-[#FF4D00] text-white grid place-items-center shadow-[0_10px_20px_rgba(255,77,0,0.25)]" v-html="s.icon" />
          <div class="mt-4 text-[12px] font-black tracking-widest text-[#FF4D00]">{{ s.n }}</div>
          <h3 class="mt-1 text-[18px] font-extrabold tracking-[-0.02em]">{{ s.title }}</h3>
          <p class="mt-2 text-[13px] leading-6 text-zinc-500 dark:text-zinc-400">{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <!-- FEATURES: bento 1 large + 5 -->
    <section id="features" class="relative z-10 max-w-[1280px] mx-auto w-full px-6 sm:px-8 py-10">
      <div class="flex items-end justify-between gap-4 mb-6">
        <h2 class="text-[24px] sm:text-[30px] font-black tracking-[-0.03em]">مصمم لاجتماع حقيقي — وليس ديمو</h2>
        <span class="hidden sm:inline text-xs font-bold text-zinc-400">01 — 06</span>
      </div>
      <div class="grid lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 rounded-[28px] bg-[#FF4D00] text-white p-7 sm:p-8 relative overflow-hidden">
          <div class="absolute -left-10 -bottom-10 w-[220px] h-[220px] bg-white/10 rounded-full blur-[30px]" />
          <div class="relative">
            <div class="w-11 h-11 rounded-[12px] bg-white text-[#FF4D00] grid place-items-center" v-html="features[0].icon" />
            <h3 class="mt-4 text-[22px] font-black">ترجمة مسموعة — كلٌ بلغته</h3>
            <p class="mt-2 text-white/85 text-[14px] leading-6 max-w-[520px]">الطرف الآخر لا يقرأ فقط، بل يسمع الترجمة بصوت بلغته عبر speechSynthesis المحلي. نص حي + صوت في آنٍ واحد.</p>
            <div class="mt-5 inline-flex items-center gap-2 text-xs font-black bg-white text-[#FF4D00] px-3 py-2 rounded-full">جرّب: تكلم عربي → يُسمع إنجليزي</div>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div v-for="f in features.slice(1,3)" :key="f.num" class="rounded-[24px] border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 p-6">
            <div class="w-10 h-10 rounded-[12px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 grid place-items-center" v-html="f.icon" />
            <h3 class="mt-3 font-extrabold">{{ f.title }}</h3>
            <p class="mt-1 text-[13px] leading-6 text-zinc-500 dark:text-zinc-400">{{ f.desc }}</p>
          </div>
        </div>
      </div>
      <div class="grid sm:grid-cols-3 gap-4 mt-4">
        <div v-for="f in features.slice(3)" :key="f.num" class="rounded-[24px] border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 p-6">
          <div class="w-10 h-10 rounded-[12px] bg-[#FF4D00]/10 border border-[#FF4D00]/20 text-[#FF4D00] grid place-items-center" v-html="f.icon" />
          <h3 class="mt-3 font-extrabold flex items-center gap-2"><span class="text-[#FF4D00] font-black">{{ f.num }}</span> {{ f.title }}</h3>
          <p class="mt-1 text-[13px] leading-6 text-zinc-500 dark:text-zinc-400">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- LANGUAGES: search + pills -->
    <section class="relative z-10 max-w-[1280px] mx-auto w-full px-6 sm:px-8 py-10">
      <div class="rounded-[28px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 sm:p-8">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 class="text-[22px] font-black tracking-[-0.03em]">14+ لغة — اختر ما تسمع به</h2>
            <p class="mt-1 text-sm text-zinc-500">العربية، الإنجليزية، الفرنسية، الألمانية، التركية، اليابانية، الصينية والمزيد — تُحفظ لغتك المفضلة تلقائياً.</p>
          </div>
          <div class="flex items-center gap-2 text-xs font-bold">
            <span class="px-3 py-2 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">RTL مدعوم</span>
            <span class="px-3 py-2 rounded-full border border-zinc-200 dark:border-white/10">NLLB-200</span>
          </div>
        </div>
        <div class="mt-6 flex flex-wrap gap-2">
          <span v-for="l in langList" :key="l.code" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-bold border bg-zinc-50 dark:bg-white/[0.03] border-zinc-200 dark:border-white/10 hover:border-[#FF4D00]/30 hover:bg-[#FF4D00]/5 transition">
            <span>{{ l.flag }}</span> {{ l.nativeName }}
          </span>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative z-10 max-w-[1280px] mx-auto w-full px-6 sm:px-8 pb-16">
      <div class="rounded-[32px] bg-zinc-900 dark:bg-[#0c0c0c] text-white p-8 sm:p-10 relative overflow-hidden border border-white/10">
        <div class="absolute inset-0 bg-[radial-gradient(600px_300px_at_70%_-10%,rgba(255,77,0,0.35),transparent_60%)]" />
        <div class="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div>
            <h2 class="text-[28px] sm:text-[36px] font-black tracking-[-0.04em] leading-none">ابدأ غرفتك الآن. <br/><span class="text-[#FF7A40]">ادعُ برابط واحد.</span></h2>
            <p class="mt-3 text-white/70 text-sm max-w-[520px]">لن نطلب بريداً ولا تسجيلاً. أنشئ كوداً، اختر لغتك، وابدأ الحديث — الطرف الآخر يفتح الرابط وينضم.</p>
            <div class="mt-6 flex flex-wrap gap-3">
              <button @click="createMeeting" class="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#FF4D00] hover:bg-[#E64500] text-white font-black shadow-[0_12px_28px_rgba(255,77,0,0.4)] transition">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"/><path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-1.06A9 9 0 0 0 21 12h-2Z"/></svg>
                ابدأ اجتماعًا الآن
              </button>
              <button @click="joinModalOpen = true" class="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 font-bold transition">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                انضمام برمز
              </button>
            </div>
          </div>
          <div class="rounded-[20px] bg-white text-zinc-900 p-5 border border-white/10">
            <div class="text-xs font-black tracking-widest text-zinc-400">كيف تبدو الدعوة</div>
            <div class="mt-3 rounded-[14px] bg-zinc-50 border border-zinc-200 p-3 font-mono text-sm select-all" dir="ltr">https://talkbridge.app/join/<span class="font-black text-[#FF4D00]">H7K2Q9</span></div>
            <div class="mt-3 text-xs text-zinc-500">شارك الرابط على Upwork / واتساب / تيليجرام — يفتح الغرفة مباشرة.</div>
          </div>
        </div>
      </div>
    </section>

    <footer class="relative z-10 border-t border-zinc-200 dark:border-white/10 py-8">
      <div class="max-w-[1280px] mx-auto w-full px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-[10px] bg-[#FF4D00] grid place-items-center"><svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 0-7 7v2a7 7 0 0 0 14 0V9a7 7 0 0 0-7-7Z"/><path d="M12 16v4"/><path d="M8 20h8"/></svg></div>
          <span class="font-black tracking-[-0.02em]">TalkBridge</span><span class="text-xs text-zinc-400">© 2026</span>
        </div>
        <p class="text-xs font-medium text-zinc-500">صوتك يبقى في جهازك — يُرسل النص فقط. ترجمة ومحادثة مجاناً.</p>
      </div>
    </footer>

    <!-- JOIN MODAL -->
    <div v-if="joinModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="joinModalOpen = false">
      <div class="w-full max-w-sm rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <h3 class="text-[18px] font-black">الانضمام برمز</h3>
          <button @click="joinModalOpen = false" class="w-8 h-8 rounded-full grid place-items-center bg-zinc-100 dark:bg-white/10"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
        <p class="mt-1 text-sm text-zinc-500">أدخل كود الغرفة المكوّن من 6 حروف/أرقام</p>
        <input v-model="joinCode" dir="ltr" placeholder="H7K2Q9" class="mt-4 w-full h-12 rounded-[14px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-center tracking-[0.35em] font-black text-[16px] focus:border-[#FF4D00] focus:ring-2 focus:ring-[#FF4D00]/20 outline-none" @keyup.enter="submitJoin" />
        <button @click="submitJoin" :disabled="!joinCode.trim()" class="mt-3 w-full h-12 rounded-[14px] bg-[#FF4D00] disabled:opacity-50 text-white font-black">انضمام</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '~/composables/useTheme';
import { LANGUAGES } from '~/composables/languages';
const router = useRouter();
const theme = useTheme();
const joinCode = ref('');
const joinModalOpen = ref(false);

// Solid Heroicons (filled) — distinctive, not thin outlines
const ICONS: Record<string,string> = {
  mic: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM7 10.5A5 5 0 0 0 12 15a5 5 0 0 0 5-4.5V6a1 1 0 1 1 2 0v4.5A7 7 0 0 1 12 18a7 7 0 0 1-7-7.5V6a1 1 0 1 1 2 0v4.5Z"/></svg>',
  text: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-4 4V5Z"/><path d="M7 9h10M7 12h7" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>',
  speaker: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  shield: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z"/><path d="M9 12 11.5 14.5 15.5 10.5" fill="none" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  globe: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 3.5 7A8 8 0 0 1 12 18a8 8 0 0 1-3.5-7A8 8 0 0 1 12 4Z"/><path d="M2 12h20M12 2a10 10 0 0 1 4 10 10 10 0 0 1-4 10A10 10 0 0 1 8 12 10 10 0 0 1 12 2Z" fill="none" stroke="white" stroke-width="1.2"/></svg>',
  bolt: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>',
};
const steps = [
  { n: '01', icon: ICONS.mic, title: 'تتكلم بلغتك', desc: 'المتصفح يلتقط صوتك ويحوّله لنص محلياً — الكاميرا تعمل بالتوازي.' },
  { n: '02', icon: ICONS.text, title: 'يُترجم فوراً', desc: 'النص يُرسل فقط (بلا صوت) ويُترجم في جهاز المستقبِل عبر MyMemory/NLLB.' },
  { n: '03', icon: ICONS.speaker, title: 'يسمعك بلغته', desc: 'المستقبِل يسمع صوتاً مركّباً بلغته ويرى النص الحي في اللوحة.' },
];
const features = [
  { num: '01', icon: ICONS.speaker, title: 'ترجمة مسموعة', desc: 'صوت حقيقي لكل طرف بلغته، لا مجرد سطور.' },
  { num: '02', icon: ICONS.text, title: 'لوحة حيّة', desc: 'نص + دردشة + مشاركون في تبويبات نظيفة.' },
  { num: '03', icon: ICONS.shield, title: 'خصوصية', desc: 'صوتك لا يغادر جهازك — النص فقط يُرسل.' },
  { num: '04', icon: ICONS.globe, title: '14+ لغة', desc: 'عربي، إنجليزي، فرنسي، تركي، ياباني، صيني…' },
  { num: '05', icon: ICONS.bolt, title: 'رابط واحد', desc: 'ادعُ عبر /join/CODE بلا تسجيل.' },
  { num: '06', icon: ICONS.mic, title: 'مجاني', desc: 'Web Speech + speechSynthesis — صفر تكلفة.' },
];
const langList = Object.values(LANGUAGES);
onMounted(()=> theme.init());
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
function createMeeting(){ router.push({ path: `/room/${generateCode()}` }); }
function submitJoin(){ const c=joinCode.value.trim().toUpperCase(); if(c) router.push(`/join/${c}`); }
</script>
