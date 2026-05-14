// Content guide data — Lana's frameworks applied to Abdulrahman's AI/Claude Code niche.
// Structured so the renderer in ContentGuide.tsx can map over it.

export type Tone =
  | "slate"
  | "sky"
  | "violet"
  | "amber"
  | "emerald"
  | "rose"
  | "lime"
  | "green";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "checks"; items: { good: boolean; text: string }[] }
  | { kind: "quote"; text: string; ar?: boolean }
  | { kind: "applied"; title: string; items: string[] }
  | {
      kind: "hookCard";
      label: string;
      template: string;
      why: string[];
      examples: string[];
      tip?: string;
    }
  | { kind: "meweyou"; me: string; we: string; you: string }
  | { kind: "pyramid" }
  | {
      kind: "tier";
      label: string;
      tone: Tone;
      items: string[];
    }
  | {
      kind: "timeline";
      days: { day: string; funnel: string; framework: string; idea: string; why: string }[];
    }
  | { kind: "rule"; number: number; text: string };

export type SubSection = {
  title: string;
  blocks: Block[];
};

export type Section = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  subs: SubSection[];
};

export const SECTIONS: Section[] = [
  {
    id: "algorithm",
    number: "01",
    title: "Algorithm & Platform Mechanics",
    tagline: "How Instagram actually decides what to push in 2026.",
    subs: [
      {
        title: "1.1 How Instagram's Algorithm Works (2026)",
        blocks: [
          {
            kind: "p",
            text: "The algorithm is a set of code that relies on patterns. It tracks how many times users tap to read the full caption, how quickly they swipe away, which Stories they tap past vs watch all the way through, every like, comment, share, repost — all signals to push content further.",
          },
          {
            kind: "quote",
            text: "The algorithm's only goal: keep users on the app as long as possible. If your content keeps people's attention and gets them talking, you become a partner and get giant reach. If your content makes people leave, you get buried.",
          },
          {
            kind: "p",
            text: "Critical 2026 update: Instagram updated Reel insights to show what impacts views in order from most to least important. Share rate is the #2 most important metric — making content shareable is now more important than almost anything else.",
          },
          { kind: "h", text: "What the algorithm penalizes" },
          {
            kind: "list",
            items: [
              "Taking people off the platform (links, 'link in bio' too often).",
              "Aggregator accounts that repost clips from other accounts.",
              "Content where lighting and sound is not clear — actively deprioritized now.",
              "Ad fatigue — same style of video for months, people swipe past you.",
            ],
          },
        ],
      },
      {
        title: "1.2 The Pyramid of What Actually Matters",
        blocks: [
          {
            kind: "p",
            text: "Lana drew a literal pyramid ranking what matters from least to most important. Stop worrying about the bottom — pour your energy into the top.",
          },
          { kind: "pyramid" },
          {
            kind: "tier",
            label: "Bottom tier — barely matters",
            tone: "slate",
            items: [
              "Time of day you post — feed isn't chronological. Good content performs at any time.",
            ],
          },
          {
            kind: "tier",
            label: "Low-mid tier — slight difference",
            tone: "sky",
            items: [
              "Posting frequency — more volume = more data, but only when strategic.",
              "Consistency — doesn't create growth, creates opportunities for growth.",
              "Sound, editing, lighting, camera quality — as long as content is audibly and visually clear, doesn't move the needle (with one caveat: poor lighting/sound IS now deprioritized).",
            ],
          },
          {
            kind: "tier",
            label: "Mid-high tier — moves the needle",
            tone: "violet",
            items: [
              "Text on screen (especially with keywords) — helps content get categorized.",
              "Structure — content that flows in a cognitively satisfying way improves watch time. Massively underrated.",
              "Meaningful engagement — every like, comment, share, repost is a signal.",
              "SEO — making content searchable. Where platforms are going.",
              "Hooks — important but not as important as people think. They grab attention; they don't retain it.",
            ],
          },
          {
            kind: "tier",
            label: "God tier — actually matters most",
            tone: "emerald",
            items: [
              "Target audience — if you understand who you're speaking to and what matters to them, you create content people actually care about.",
              "Positioning — Who are you? What do you post about? Who is your content for? Make it clear in EVERY video.",
              "Topic — KING. Algorithms distribute content based on relevance. Talk about things that actually matter to people.",
            ],
          },
          {
            kind: "applied",
            title: "Applied to Abdulrahman",
            items: [
              "Stop worrying about hashtags, posting times, perfect editing.",
              "Focus on topics your audience searches for: AI automation, Claude Code, making money with AI.",
              "Make positioning clear: 'I build AI systems and teach you how.'",
              "Understand your audience deeply before you film.",
            ],
          },
        ],
      },
      {
        title: "1.3 SEO for Social Media",
        blocks: [
          {
            kind: "p",
            text: "SEO on social = making content easy to categorize by the algorithm AND easy to find by people searching. It's NOT loading hashtags and hiding keywords off-screen. It IS tapping into what your audience is searching for.",
          },
          { kind: "h", text: "Three steps to make every piece of content searchable" },
          {
            kind: "list",
            items: [
              "Keyword research — understand what your audience actually types into the search bar. Tools: Creator Search Insights (TikTok), answerthepublic.com, semrush.com, Google Keyword Planner.",
              "Make an optimized video — keyword in spoken hook, in text on screen, in caption. CRUCIAL: the content actually has to be GOOD. Don't tell a story, give value.",
              "Rinse and repeat — don't make ONE video on that search term, make MULTIPLE. Saturate the topic until you own all search traffic.",
            ],
          },
          {
            kind: "applied",
            title: "Keywords to target",
            items: [
              "Claude Code شرح",
              "AI automation عربي",
              "كيف تبدأ AI",
              "vibe coding",
              "n8n شرح عربي",
              "بناء تطبيقات بالذكاء الاصطناعي",
              "الربح من AI",
              "Claude Code tutorial Arabic",
            ],
          },
        ],
      },
      {
        title: "1.4 Training the Algorithm on Your Audience",
        blocks: [
          {
            kind: "p",
            text: "For accounts that are confused or attracting the wrong people, for the next 20 videos at least, start EVERY video with some version of: 'If you are [target audience] and you want [desired result]…' or 'If you are [target audience] and you struggle with [struggle]…'",
          },
          { kind: "h", text: "Why it works" },
          {
            kind: "list",
            items: [
              "Algorithm relies on patterns — repeating audience keywords connects the dots.",
              "People self-identify — anyone who matches the opening pauses.",
              "Algorithm then serves content to more people who share characteristics of those who engaged.",
              "Once you're attracting the right people, then you can get more creative with hooks.",
            ],
          },
          {
            kind: "applied",
            title: "Openers for Abdulrahman",
            items: [
              "لو بدك تدخل عالم الـ AI وما بتعرف من وين تبدأ…",
              "لو بدك تبني بزنس بالذكاء الاصطناعي…",
              "لو بتشتغل فريلانسر وبدك تضيف AI لخدماتك…",
              "لو بدك تتعلم تبني تطبيقات بدون ما تكون مبرمج…",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "frameworks",
    number: "02",
    title: "Content Frameworks",
    tagline: "Repeatable structures that turn ideas into videos.",
    subs: [
      {
        title: "2.1 The Me-We-You Framework",
        blocks: [
          {
            kind: "p",
            text: "Turns selfish content (about you) into unselfish content (for them). Especially helpful for lifestyle creators or anyone documenting themselves.",
          },
          { kind: "h", text: "Structure" },
          {
            kind: "list",
            items: [
              "Me — start by talking about yourself (your experience, your story).",
              "We — zoom out and make it universal ('I know this happens to so many people…').",
              "You — flip it towards the person watching ('If you're trying to… start with this instead').",
            ],
          },
          {
            kind: "p",
            text: "People don't care about your story in isolation. They care about what your story means to THEM.",
          },
          {
            kind: "meweyou",
            me: "قبل سنة كنت أقعد أيام عشان أخلّص مهمة وحدة — إيميلات، تقارير، متابعة عملاء.",
            we: "وأنا عارف إنه كثير منكم نفس الشي — بتحسوا إنه وقتكم بيروح على أشياء المفروض تكون أسرع.",
            you: "لو عندك مهمة بتكررها كل يوم — في طريقة تخليها تشتغل لحالها. وهاد اللي بعلمه.",
          },
          {
            kind: "meweyou",
            me: "أنا صار لي سنتين بشتغل لحالي من غرفتي — وصلت لمرحلة حسيت فيها بالزهق.",
            we: "وأكيد أي حدا شغال لحاله بيوصل لهاي المرحلة — بتحس حالك بتدور بحلقة.",
            you: "لو أنت بنفس المكان — أكبر شي ساعدني هو إني بنيت مجتمع حواليي. ناس زيي بنفس الطريق.",
          },
        ],
      },
      {
        title: "2.2 The \"Why You\" Line",
        blocks: [
          {
            kind: "p",
            text: "One small, subtle line you add to your video that gives people a reason to follow you. It adds credibility, context, trust, or authority. Makes people feel they'll miss out if they don't follow.",
          },
          { kind: "h", text: "Types" },
          {
            kind: "list",
            items: [
              "Authority-based — 'I build AI systems for companies every day.'",
              "Experience-based — 'I've been working with AI daily for two years.'",
              "Identity-based — 'As someone working from home in Jordan…'",
            ],
          },
          {
            kind: "p",
            text: "Don't put it at the beginning — it feels like bragging. Place it naturally in the middle, casually, as if you're mentioning context.",
          },
          {
            kind: "applied",
            title: "One per video for Abdulrahman",
            items: [
              "وأنا شخصياً هاي الأداة اللي بشتغل فيها كل يوم.",
              "هاد اللي بعلمه لناس بالمجتمع — وناس فعلاً بنت بزنس منه.",
              "أنا جربت كل الأدوات — هاي اللي فعلاً بتفرق.",
              "كشخص ببني أنظمة أتمتة لشركات…",
            ],
          },
        ],
      },
      {
        title: "2.3 Social Currency — Why People Share",
        blocks: [
          {
            kind: "p",
            text: "People don't share content because it's good. They share it when it makes THEM look good. Five types of currency:",
          },
          {
            kind: "list",
            items: [
              "Identity — 'OMG that is SO me.' Relatable struggles or niche experiences.",
              "Status — makes someone look smart or competent. '90% of people use ChatGPT wrong.'",
              "Emotional — makes people FEEL something and want others to feel it too.",
              "Entertainment — humor is a shared language.",
              "Utility — helpful tips people can use immediately.",
            ],
          },
          {
            kind: "quote",
            text: "Quick, easy, immediately usable content gets shared WAY more than in-depth videos. — Lana",
          },
          {
            kind: "applied",
            title: "Examples for Abdulrahman",
            items: [
              "Identity: 'أشياء بتصير معك لما تبدأ تتعلم AI'",
              "Status: '٩٠٪ من الناس بتستخدم ChatGPT غلط — هيك الطريقة الصح'",
              "Emotional: 'ليش بحس إنه الوطن العربي ضايع فرصة عمره بالـ AI'",
              "Entertainment: 'لما تحكي لأهلك إنك بتشتغل بالذكاء الاصطناعي 😂'",
              "Utility: '٣ أدوات AI مجانية بتوفرلك ساعات كل يوم'",
            ],
          },
        ],
      },
      {
        title: "2.4 Strategic Repetition",
        blocks: [
          {
            kind: "p",
            text: "One of the most effective ways to grow an account fast. Also one of the easiest ways to ruin it if done wrong.",
          },
          {
            kind: "checks",
            items: [
              {
                good: false,
                text: "Making the exact same video every day until one takes off — that's not strategic.",
              },
              {
                good: true,
                text: "Same TOPIC (same core idea), explored from many different ANGLES and perspectives.",
              },
            ],
          },
          { kind: "h", text: "Example week — topic: Claude Code" },
          {
            kind: "list",
            items: [
              "Day 1 — Explainer: ليش Claude Code بيغير طريقة شغلك.",
              "Day 2 — Mistakes: ٣ أخطاء الناس بتعملها لما تبدأ مع Claude Code.",
              "Day 3 — Story: الشي اللي غيّر كل شي لما بدأت أستخدم Claude Code.",
              "Day 4 — Vlog: روتيني اليومي بالشغل مع Claude Code.",
              "Day 5 — Contrarian: ليش ٩٠٪ من محتوى الـ AI عالسوشال ميديا كذب.",
              "Day 6 — Tutorial: أول ٣ أشياء لازم تسويها لما تفتح Claude Code.",
              "Day 7 — Transformation: كيف كان شغلي قبل وبعد Claude Code.",
            ],
          },
          {
            kind: "quote",
            text: "Your audience doesn't see every single thing you post. Even if they heard it before, the new angle might be the one that clicks. Repetition = authority.",
          },
        ],
      },
      {
        title: "2.5 The IKEA Effect (Community)",
        blocks: [
          {
            kind: "p",
            text: "People value things they BUILD for themselves. If your audience feels like part of your content journey, they'll be way more invested.",
          },
          {
            kind: "list",
            items: [
              "Make content interactive — talk TO people not AT them. Ask questions, ask for advice, ask for feedback (Benjamin Franklin effect).",
              "Live in your comments — reply, video-reply, recognize loyal followers.",
              "Be reactive — pay attention to which videos get GOOD quality comments/saves/reposts, not just views.",
              "Use inner circle tools — Stories, polls, question boxes. More vulnerable, more behind-the-scenes.",
            ],
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "Ask the community 'شو بدكم أبنيه الفيديو الجاي؟'",
              "Share member wins and results.",
              "Polls on which AI tool to cover next.",
              "Show your thought process, not just results.",
              "Ask for feedback on your projects.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "hooks",
    number: "03",
    title: "Hook Formulas",
    tagline: "12 opening lines drawn directly from Lana's playbook.",
    subs: [
      {
        title: "Tap a card to flip it and see Abdulrahman-specific examples.",
        blocks: [
          {
            kind: "hookCard",
            label: "3.1",
            template: "As a [identity], these are the [things]…",
            why: [
              "First words carve out an identity — content reaches the right people.",
              "Signals lived experience (people trust it more).",
              "Algorithm learns who to serve.",
            ],
            examples: [
              "كشخص بيشتغل بالـ AI كل يوم — هاي الأشياء اللي تمنيت حدا حكاها لي من البداية.",
              "كشخص بنى بزنس كامل من الذكاء الاصطناعي — هاي الأخطاء اللي عملتها.",
              "كمؤسس مجتمع AI بالعربي — هاي الأشياء اللي بشوفها كل يوم.",
              "كشخص علّم مئات الناس يستخدموا AI — هاد أكثر سؤال بينسأل.",
            ],
          },
          {
            kind: "hookCard",
            label: "3.2",
            template: "This is why [thing that matters]…",
            why: [
              "Opens a curiosity loop instantly.",
              "The word 'why' implies meaning — humans constantly search for meaning.",
              "Tie it to a feeling, not information.",
            ],
            examples: [
              "هاد السبب إنك لسا ما بدأت تستخدم AI بشغلك.",
              "هاد السبب إنه أغلب الناس بتفشل لما تبدأ تتعلم AI.",
              "هاد السبب إنك بتحس إنك متأخر عن الركب بالتكنولوجيا.",
              "هاد السبب إنه السوق العربي رح ينفجر بالـ AI خلال سنة.",
              "هاد السبب إنه Claude Code أحسن من أي أداة AI ثانية للشغل الحقيقي.",
            ],
            tip: "Tie to a feeling: 'This is why you feel guilty for resting' > 'This is why rest is important.'",
          },
          {
            kind: "hookCard",
            label: "3.3",
            template: "I just [realized / heard / saw / read / finished / tried] …",
            why: [
              "Feels in-the-moment and organic.",
              "Plays into immediacy bias — current beats useful.",
              "Be specific — attach it to a moment.",
            ],
            examples: [
              "هسا لسا اكتشفت ميزة بـ Claude Code ما حدا بيحكي عنها.",
              "هسا لسا قرأت خبر عن الذكاء الاصطناعي — ولازم أحكيلكم.",
              "هسا لسا خلّصت مشروع مع عميل — وبدي أحكيلكم شو تعلمت.",
              "هسا لسا جربت أداة جديدة — وصراحة فاجأتني.",
              "هسا لسا شفت فيديو عن AI — ولازم نحكي عن اللي قاله.",
            ],
          },
          {
            kind: "hookCard",
            label: "3.4",
            template: "I wish more [audience] knew about [thing]",
            why: [
              "Calls out target audience (self-selection).",
              "Framed like an insider secret.",
              "The word 'wish' is emotionally charged — implies regret.",
            ],
            examples: [
              "يا ريت ناس أكثر بتعرف إنه بتقدر تبني تطبيقات بدون ما تكون مبرمج.",
              "يا ريت كل فريلانسر عربي بيعرف عن هاي الأداة.",
              "يا ريت الناس بتعرف إنه الـ AI مش بس ChatGPT.",
              "يا ريت حدا حكالي عن Claude Code قبل ما أضيع ٦ شهور بالطريقة الغلط.",
            ],
          },
          {
            kind: "hookCard",
            label: "3.5",
            template: "Things that keep me up at night as a [identity]",
            why: [
              "Specific, relatable, shareable.",
              "Points need to be uncomfortable — not generic.",
              "Should feel like an in-joke — only your audience relates.",
            ],
            examples: [
              "إنه ناس كثير رح تتأخر وما رح تلحق.",
              "إنه السوق العربي فيه فرصة هائلة وما حدا شايفها.",
              "إنه أدوات اليوم رح تتغير كلياً بعد سنة.",
              "إنه في ناس بتبيع أحلام AI وهمية والناس بتصدق.",
              "إنه أنا نفسي أحياناً بحس إني مش ملاحق.",
            ],
          },
          {
            kind: "hookCard",
            label: "3.6",
            template: "I started [thing] and here's what happened",
            why: [
              "Layers curiosity + storytelling + transformation + payoff.",
              "Tension — viewer asks 'good or bad?'",
              "Needs contrast — something changed.",
            ],
            examples: [
              "بدأت أستخدم Claude Code بشغلي من ٦ شهور — وهيك تغيّر كل شي.",
              "بدأت أبني مجتمع AI بالعربي — وما توقعت اللي صار.",
              "بدأت أعلّم الناس AI وحياتي اتغيرت.",
              "تركت الشغل التقليدي وبدأت أشتغل بالـ AI — هاد اللي صار.",
            ],
            tip: "IMPORTANT: never claim 'I built X in 1 minute.' Authenticity is the brand differentiator.",
          },
          {
            kind: "hookCard",
            label: "3.7",
            template: "Lessons I AM LEARNING as a [identity]",
            why: [
              "Present tense — story in progress, not lecture.",
              "People follow if you're one step ahead, not above.",
              "Encourages vulnerability.",
            ],
            examples: [
              "أشياء عم بتعلمها وأنا ببني بزنس AI من الأردن.",
              "دروس عم بتعلمها وأنا بعلّم الناس الذكاء الاصطناعي.",
              "أشياء عم بتعلمها كمؤسس شركة AI بالعالم العربي.",
              "دروس عم بتعلمها وأنا بستخدم Claude Code كل يوم.",
            ],
          },
          {
            kind: "hookCard",
            label: "3.8",
            template: "This is the one thing that [result]",
            why: [
              "Anticipation of reward → dopamine → watch-time.",
              "'One thing' feels more valuable AND easier to process.",
              "Must be specific.",
            ],
            examples: [
              "هاد الشي الواحد اللي غيّر طريقة شغلي بالـ AI.",
              "هاد الشي الواحد اللي لازم تعرفه قبل ما تبدأ مع Claude Code.",
              "هاد الشي الواحد اللي بنصح فيه كل حدا بده يتعلم AI.",
              "هاد الشي الواحد اللي فرق معي لما بدأت أبني أنظمة أتمتة.",
            ],
          },
          {
            kind: "hookCard",
            label: "3.9",
            template: "Things we need to stop telling [group]",
            why: [
              "Immediate identity alignment.",
              "Signals controversy → engagement.",
              "Validation, not education.",
            ],
            examples: [
              "'لازم تتعلم برمجة أول' — لا.",
              "'الـ AI بس للشركات الكبيرة' — غلط.",
              "'فات الأوان' — السوق العربي لسا بالبداية.",
              "'مش إلك' — هاد لكل حدا عنده طموح.",
            ],
          },
          {
            kind: "hookCard",
            label: "3.10",
            template: "Use the word 'embarrassed' in your hook",
            why: [
              "Implies vulnerability and loss of control.",
              "Brain thinks 'we're about to get something real.'",
              "Lowers authority barrier — gives viewer social currency.",
            ],
            examples: [
              "شي محرج بدي أعترفلكم فيه عن تجربتي مع AI.",
              "أكثر خطأ محرج عملته لما بدأت أشتغل بالذكاء الاصطناعي.",
              "محرج أحكي هاد بس لازم تسمعوه — عن حقيقة الـ AI.",
              "شي محرج بس أكيد صار معكم كمان لما بدأتوا تتعلموا AI.",
            ],
          },
          {
            kind: "hookCard",
            label: "3.11",
            template: "The word 'just' — I just [realized / heard / saw]…",
            why: [
              "Reinforces 3.3 — feels organic and current.",
              "Plays into immediacy bias.",
              "Use sparingly to keep the effect.",
            ],
            examples: [
              "هسا لسا انتبهت إنه في طريقة أسرع تستخدم فيها Claude Code.",
              "هسا لسا حكيت مع عميل وحكالي شي صدمني.",
              "هسا لسا قرأت paper جديد عن AI ولازم نحكي عنه.",
            ],
          },
          {
            kind: "hookCard",
            label: "3.12",
            template: "Unhinged rules I have as a [identity]",
            why: [
              "'Unhinged' implies entertainment.",
              "'Rules' implies specificity.",
              "Shows what you stand for → converts viewers to followers.",
            ],
            examples: [
              "ما بفتح ChatGPT بدون ما يكون عندي هدف واضح.",
              "بعامل Claude Code زي موظف — بعطيه brief واضح مش 'سويلي إشي'.",
              "ما بنصح حدا بأداة ما جربتها بنفسي أقل شي شهر.",
              "بحذف أي أتمتة بتوفرلي أقل من ١٠ دقائق بالأسبوع.",
              "ما بشارك 'بنيت تطبيق بدقيقة' لأنه كذب.",
            ],
            tip: "Things actually have to be a little unhinged — 'I journal every morning' is boring.",
          },
        ],
      },
    ],
  },
  {
    id: "types",
    number: "04",
    title: "Content Types (Evergreen Formats)",
    tagline: "Six styles that always work because they tap into how humans consume stories.",
    subs: [
      {
        title: "4.1–4.6 The six formats",
        blocks: [
          { kind: "h", text: "Before & After / Transformation" },
          {
            kind: "p",
            text: "People hate incomplete stories. 'Before' creates tension, 'after' scratches the itch. Doesn't have to be physical — business, mindset, skills, workflow.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "Show workflow/business before AI vs after.",
              "Show a member's journey before and after joining the community.",
            ],
          },
          { kind: "h", text: "Myth Busting" },
          {
            kind: "p",
            text: "Telling people 'that thing you believe is probably not true' creates fear of being wrong — very powerful. Counter-positions you as expert.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: ["٣ أشياء الناس بتفكرها عن AI — كلها غلط."],
          },
          { kind: "h", text: "Hacks" },
          {
            kind: "p",
            text: "Short-form loves quick actionable value. Solve a COMMON problem with a UNIQUE solution. If the hack is obvious, it's not a hack.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "حيلة بـ Claude Code بتوفرلك ساعات.",
              "طريقة ما حدا بيحكي عنها تستخدم فيها AI بشغلك.",
            ],
          },
          { kind: "h", text: "Opinion / Rants" },
          {
            kind: "p",
            text: "Great for stirring emotional response. People are tribal — they want to feel they belong. Divisive opinions generate comments.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "ليش ٩٠٪ من محتوى الـ AI عالسوشال ميديا ما بيفيدك.",
              "رأيي الصريح بـ vibe coding.",
            ],
          },
          { kind: "h", text: "Tutorials" },
          {
            kind: "p",
            text: "People love following processes. KEY: show the END RESULT FIRST, then walk through how you got there. End result creates desire and anticipation.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: ["Show the finished app/automation FIRST → then walk through how you built it."],
          },
          { kind: "h", text: "Lists" },
          {
            kind: "p",
            text: "When in doubt, turn it into a list. Easy to follow, lots of structure, reduces thinking, clear payoff.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "٥ أدوات AI لازم تعرفها.",
              "٣ طرق تطلع دخل من AI.",
              "٧ أشياء تمنيت عرفتها عن Claude Code.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "expert",
    number: "05",
    title: "Expert Positioning",
    tagline: "Five styles of content that position you as THE expert.",
    subs: [
      {
        title: "5.1 Reaction Content",
        blocks: [
          {
            kind: "p",
            text: "React to viral AI content, podcast clips, tech announcements. Shows credibility and borrows attention from trending content.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "React to viral AI tool demos.",
              "Claude Code feature announcements.",
              "AI news in Arabic media.",
            ],
          },
        ],
      },
      {
        title: "5.2 Audit Content",
        blocks: [
          {
            kind: "p",
            text: "Take what's already working and break down WHY. Show your expertise rather than telling people you're good.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "Audit an AI tool — break down why it works/doesn't.",
              "Audit someone's automation workflow.",
            ],
          },
        ],
      },
      {
        title: "5.3 Contrarian Content",
        blocks: [
          {
            kind: "p",
            text: "Take common beliefs and disrupt them. Counter-position yourself. Must back opinions with reasoning.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "ليش الـ no-code tools مش مستقبل الـ AI.",
              "ليش ChatGPT مش أحسن أداة AI.",
              "الحقيقة عن vibe coding اللي ما حدا بيحكيها.",
            ],
          },
        ],
      },
      {
        title: "5.4 Scenario Content — 'What I would do if'",
        blocks: [
          {
            kind: "p",
            text: "People see themselves reflected in the scenario. Advice feels practical and relevant.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "لو بدي أبدأ من صفر اليوم أتعلم AI — هاد اللي بسويه.",
              "لو عندي ١٠٠ دولار بس وبدي أبدأ بزنس AI — هيك بعملها.",
            ],
          },
        ],
      },
      {
        title: "5.5 Common Problems + Unique Solutions",
        blocks: [
          {
            kind: "p",
            text: "Most common questions in your industry but with DIFFERENT advice. Content where people say 'I've never heard it explained like that.'",
          },
        ],
      },
    ],
  },
  {
    id: "psychology",
    number: "06",
    title: "Psychology Tricks",
    tagline: "Small physical and verbal moves that change how people feel about your content.",
    subs: [
      {
        title: "Cues that build connection",
        blocks: [
          { kind: "h", text: "6.1 Camera positioning" },
          {
            kind: "p",
            text: "Eyeline level to audience or slightly BELOW creates connection. Above audience reads dominant/detached. Film at eye level or slightly looking up.",
          },
          { kind: "h", text: "6.2 Head tilt" },
          {
            kind: "p",
            text: "Signals connection, empathy, warmth. Squared to camera reads rigid and authoritative. Use occasionally for empathetic points.",
          },
          { kind: "h", text: "6.3 Micro movements" },
          {
            kind: "p",
            text: "Touch your face, use hands, adjust collar, move naturally. Makes content feel human, spontaneous, organic. Don't edit this out.",
          },
          { kind: "h", text: "6.4 Intentional silence" },
          {
            kind: "p",
            text: "Pause before or after impactful statements. Creates weight. Quiet delivery creates intimacy — people lean in.",
          },
          { kind: "h", text: "6.5 The Concreteness Effect" },
          {
            kind: "checks",
            items: [
              { good: false, text: "كنت خايف أبدأ." },
              {
                good: true,
                text: "كنت أقعد أطالع الشاشة ١٥ دقيقة قبل ما أضغط publish على أول فيديو.",
              },
            ],
          },
          {
            kind: "p",
            text: "Specificity creates recognition — people visualize themselves in that exact moment.",
          },
        ],
      },
    ],
  },
  {
    id: "easier",
    number: "07",
    title: "Making Content Easier",
    tagline: "Systems that lower the cost of producing video #100.",
    subs: [
      {
        title: "Operating principles",
        blocks: [
          { kind: "h", text: "7.1 Format repurposing" },
          {
            kind: "list",
            items: [
              "Talking-to-camera video.",
              "Photo slideshow carousel.",
              "10-second video with text on screen.",
              "Voiceover over B-roll.",
            ],
          },
          { kind: "h", text: "7.2 Test every idea with a short video first" },
          {
            kind: "p",
            text: "Before investing hours, do a short version to test interest. See what people comment, how they react.",
          },
          { kind: "h", text: "7.3 Validate every idea" },
          {
            kind: "p",
            text: "Search the topic — see if other content on it performed well. Doing a BETTER version of something already performing is far safer than introducing a topic nobody cares about.",
          },
          { kind: "h", text: "7.4 Study top performers" },
          {
            kind: "p",
            text: "Go to profiles in your space, filter by 'most popular,' see what worked. Take their TOPICS and HOOKS, do your own version. Nobody owns an idea — just don't copy word-for-word.",
          },
          { kind: "h", text: "7.5 Save while doom-scrolling" },
          {
            kind: "p",
            text: "Save every video that makes you stop. Come back later and analyze: what was the hook? What was on screen? What was the topic? Bring elements into your content. Research while consuming.",
          },
        ],
      },
    ],
  },
  {
    id: "stories",
    number: "08",
    title: "Stories Strategy",
    tagline: "Feed = reach. Stories = relationship.",
    subs: [
      {
        title: "The VIP room",
        blocks: [
          {
            kind: "checks",
            items: [
              { good: true, text: "Feed content (Reels) — grow your account, reach new people." },
              { good: true, text: "Stories — strengthen relationship with EXISTING followers." },
            ],
          },
          {
            kind: "p",
            text: "Give people things they'd NEVER get in main feed content: messy, unpolished, vulnerable moments. Show the way you think. Make them interactive (polls, questions, sliders). People should feel CHOSEN.",
          },
          {
            kind: "quote",
            text: "If people get something that feels exclusive from you, they feel chosen. Stories are where followers decide whether they CARE about you.",
          },
        ],
      },
    ],
  },
  {
    id: "identity",
    number: "09",
    title: "Identity Over Niche (May 2026 Trend)",
    tagline: "The algorithm is matching to identities now, not just interests.",
    subs: [
      {
        title: "Focus around an identity, not a niche",
        blocks: [
          {
            kind: "p",
            text: "The algorithm is getting better at matching content to people's IDENTITIES rather than just interests. Focus your account around an identity others see themselves reflected in.",
          },
          {
            kind: "applied",
            title: "For Abdulrahman",
            items: [
              "Niche: 'AI tools.'",
              "Identity: 'شخص عربي ببني مستقبله بالذكاء الاصطناعي من الأردن.'",
              "Audience identifies with: being Arab, being ambitious, being self-taught, building something from scratch — same drive, different geography.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "week2",
    number: "10",
    title: "Week 2 Video Ideas",
    tagline: "Seven videos, one for each day, mapped to the right framework.",
    subs: [
      {
        title: "Saturday → Friday",
        blocks: [
          {
            kind: "timeline",
            days: [
              {
                day: "Sat",
                funnel: "TOFU",
                framework: "'As a ___' + Algorithm Training",
                idea: "لو بدك تدخل عالم الـ AI وما بتعرف من وين تبدأ.",
                why: "Trains the algorithm on who your audience is. The opening line tells Instagram exactly who to serve this to.",
              },
              {
                day: "Sun",
                funnel: "MOFU",
                framework: "Me-We-You + honest storytelling",
                idea: "Your real journey with Claude Code — what it actually is, what it does, what it DOESN'T do.",
                why: "Be the honest voice in a sea of hype. Builds deep trust.",
              },
              {
                day: "Mon",
                funnel: "TOFU",
                framework: "Myth Busting",
                idea: "٣ أشياء الناس بتفكرها عن الـ AI — كلها غلط.",
                why: "Counter-positioning as expert. Creates fear of being wrong → high engagement.",
              },
              {
                day: "Tue",
                funnel: "MOFU",
                framework: "'This is why' + Feeling-based",
                idea: "هاد السبب إنك بتحس إنك متأخر عن الركب بالتكنولوجيا.",
                why: "Ties to a feeling, not just information. Emotional hooks outperform informational ones.",
              },
              {
                day: "Wed",
                funnel: "TOFU",
                framework: "'Things we need to stop telling ___'",
                idea: "أشياء لازم نبطّل نحكيها لأي حدا بده يتعلم AI.",
                why: "Identity alignment + shareable. Audience agrees → shares to validate their group.",
              },
              {
                day: "Thu",
                funnel: "MOFU",
                framework: "'Lessons I am learning as a ___'",
                idea: "أشياء عم بتعلمها وأنا ببني بزنس AI من الأردن.",
                why: "Present tense = journey, not lecture. People follow someone one step ahead.",
              },
              {
                day: "Fri",
                funnel: "BOFU",
                framework: "Scenario — 'What I would do if'",
                idea: "لو بدي أبدأ من صفر اليوم أتعلم AI — هاد اللي بسويه بالضبط.",
                why: "People see themselves in the scenario. Practical advice → converts to community.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "rules",
    number: "11",
    title: "Key Rules to Remember",
    tagline: "Print these. Stick them above the monitor.",
    subs: [
      {
        title: "The 10 commandments",
        blocks: [
          {
            kind: "rule",
            number: 1,
            text: "Topic is king. Everything else is secondary. Pick topics your audience actually cares about.",
          },
          {
            kind: "rule",
            number: 2,
            text: "Never fake it. Don't claim 'built an app in 1 minute.' Your authenticity IS your brand.",
          },
          {
            kind: "rule",
            number: 3,
            text: "Repetition is power. Same topic, different angles. Most people are hearing it for the first time.",
          },
          {
            kind: "rule",
            number: 4,
            text: "Shareability > views. Make content people want to send to a friend.",
          },
          {
            kind: "rule",
            number: 5,
            text: "Validate before creating. Search the topic first. If nobody cares, it won't perform.",
          },
          {
            kind: "rule",
            number: 6,
            text: "Include a 'Why You' line. Every video needs one subtle credibility moment.",
          },
          {
            kind: "rule",
            number: 7,
            text: "Use the Me-We-You framework. Start with you, zoom out, flip to them.",
          },
          {
            kind: "rule",
            number: 8,
            text: "SEO every video. Keywords in spoken hook + text on screen + caption.",
          },
          {
            kind: "rule",
            number: 9,
            text: "Stories ≠ extra content. Stories are where followers decide if they care about you.",
          },
          {
            kind: "rule",
            number: 10,
            text: "Identity > niche. People follow people, not topics.",
          },
        ],
      },
    ],
  },
];
