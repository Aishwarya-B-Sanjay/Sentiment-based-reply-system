/* ============================================================
   SENTIMENT-BASED REPLY SYSTEM — app.js
   Pure vanilla JS: custom sentiment engine + smart reply gen
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────
// SENTIMENT LEXICON
// Score: +5 (very positive) → -5 (very negative)
// ─────────────────────────────────────────────────────────
const LEXICON = {
  // Very Positive
  amazing: 5, fantastic: 5, wonderful: 5, excellent: 5, outstanding: 5,
  brilliant: 5, incredible: 5, extraordinary: 5, magnificent: 5, superb: 5,
  perfect: 5, thrilled: 5, ecstatic: 5, elated: 5, overjoyed: 5,
  blissful: 5, euphoric: 5, triumphant: 5, spectacular: 5, phenomenal: 5,

  // Positive
  good: 3, great: 3, happy: 3, love: 3, awesome: 4, nice: 2, glad: 3,
  pleased: 3, delighted: 4, joyful: 4, cheerful: 3, excited: 4, fun: 2,
  enjoy: 3, enjoyed: 3, enjoying: 3, like: 2, liked: 2, hope: 2, hopeful: 3,
  optimistic: 3, grateful: 3, thankful: 3, blessed: 3, lucky: 2, proud: 3,
  confident: 3, motivated: 3, inspired: 3, energetic: 3, enthusiastic: 4,
  peaceful: 3, calm: 2, relaxed: 2, satisfied: 3, content: 2, fine: 1,
  okay: 1, well: 1, better: 2, improving: 2, progress: 2, achieve: 3,
  success: 4, win: 3, won: 3, victory: 4, celebrate: 4, accomplished: 4,
  productive: 3, efficient: 2, helpful: 2, kind: 2, generous: 2,

  // Slightly Positive
  interesting: 1, okay: 1, alright: 1, decent: 1, acceptable: 1,
  reasonable: 1, fair: 1, normal: 1, okay: 1,

  // Neutral (don't score these)

  // Slightly Negative
  tired: -1, bored: -1, meh: -1, unsure: -1, uncertain: -1, worried: -2,
  concerned: -2, uncomfortable: -2, awkward: -1, odd: -1, strange: -1,

  // Negative
  bad: -3, sad: -3, unhappy: -3, upset: -3, disappointed: -3, sorry: -2,
  regret: -3, regretful: -3, hate: -4, dislike: -2, disliked: -2,
  annoyed: -3, frustrated: -4, irritated: -3, angry: -4, mad: -4,
  furious: -5, outraged: -5, disgusted: -4, depressed: -4, miserable: -4,
  lonely: -3, alone: -2, helpless: -4, hopeless: -4, worthless: -4,
  terrible: -4, awful: -4, horrible: -4, dreadful: -4, pathetic: -3,
  fail: -3, failed: -3, failure: -4, lose: -3, lost: -3, losing: -3,
  problem: -2, trouble: -2, difficult: -2, hard: -2, struggle: -3,
  pain: -4, hurt: -4, suffering: -4, cry: -3, crying: -3, tears: -3,
  grief: -4, sorrow: -4, mourning: -4, anguish: -5, agony: -5,
  scared: -3, afraid: -3, fear: -3, fearful: -4, anxious: -3, anxiety: -3,
  panic: -4, stress: -3, stressed: -3, overwhelmed: -4, exhausted: -3,
  drained: -3, broken: -4, shattered: -4, devastated: -5,

  // Very Negative
  hate: -4, loathe: -5, despise: -5, disgusting: -5, infuriating: -5,
  unbearable: -5, catastrophic: -5, disastrous: -5, nightmare: -4,
  pointless: -4, worthless: -4, useless: -4, stupid: -3, idiot: -4,
};

// Negation words (flip score)
const NEGATIONS = new Set([
  'not', "n't", 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere',
  'nor', 'cannot', 'without', 'hardly', 'barely', 'scarcely',
]);

// Intensifiers (multiply score)
const INTENSIFIERS = {
  very: 1.5, extremely: 2.0, absolutely: 2.0, totally: 1.8, completely: 1.8,
  utterly: 1.9, incredibly: 2.0, really: 1.4, so: 1.3, quite: 1.2,
  pretty: 1.2, rather: 1.1, somewhat: 0.8, slightly: 0.6, little: 0.7,
  bit: 0.7, kind: 0.8, sort: 0.8,
};

// Emotion keyword maps (for labeling detected emotions)
const EMOTION_KEYWORDS = {
  joy:      ['happy', 'joy', 'joyful', 'elated', 'ecstatic', 'blissful', 'cheerful', 'excited', 'delighted', 'thrilled', 'euphoric', 'celebrate'],
  sadness:  ['sad', 'unhappy', 'depressed', 'miserable', 'lonely', 'sorrow', 'grief', 'mourning', 'cry', 'tears', 'hopeless', 'helpless', 'broken', 'shattered', 'lost', 'alone'],
  anger:    ['angry', 'furious', 'mad', 'outraged', 'infuriating', 'hate', 'loathe', 'disgusted', 'annoyed', 'frustrated', 'irritated', 'furious', 'rage'],
  fear:     ['scared', 'afraid', 'fear', 'fearful', 'anxious', 'anxiety', 'panic', 'terror', 'frightened', 'worried'],
  surprise: ['surprised', 'amazed', 'astonished', 'shocked', 'wow', 'incredible', 'unbelievable', 'unexpected'],
  love:     ['love', 'adore', 'cherish', 'affection', 'fond', 'caring', 'warmth'],
  disgust:  ['disgusting', 'revolting', 'repulsive', 'gross', 'awful', 'horrible', 'terrible'],
};

// ─────────────────────────────────────────────────────────
// SMART REPLY TEMPLATES
// ─────────────────────────────────────────────────────────
const REPLIES = {
  very_positive: [
    "That's absolutely wonderful to hear! 🎉 Your positivity is truly infectious. Keep riding that wave of joy — you deserve every bit of it!",
    "Wow, what a fantastic outlook! 🌟 It sounds like things are really clicking for you right now. Keep celebrating those wins — big and small!",
    "Your energy is absolutely radiating through your words! 🚀 It's amazing when life aligns so well. Hold onto this feeling and let it fuel everything you do.",
    "This is pure joy to read! 🌈 You're clearly in a great headspace. Channel this momentum into your goals — the sky's the limit right now!",
  ],
  positive: [
    "That's really great to hear! 😊 It sounds like things are going pretty well for you. Keep nurturing that positive energy!",
    "I love the upbeat tone here! 🌻 You seem to be in a good place. A little gratitude for these moments goes a long way.",
    "Sounds like you're having a solid day! ✨ Positive moments like these are worth appreciating. What's contributing most to this good feeling?",
    "Good vibes detected! 👏 It's wonderful when life feels manageable and enjoyable. Keep doing what's working for you.",
  ],
  slightly_positive: [
    "Things seem to be ticking along nicely! 🙂 Not every day needs to be fireworks — steady and good is a great place to be.",
    "Sounds like a pleasant, grounded kind of day. 🌿 Sometimes calm and okay is exactly what we need.",
    "I'm picking up some gently positive energy here. Stay in that comfortable zone — it's more valuable than people realize.",
    "A bit of quiet contentment can be more sustaining than loud happiness. 🌤️ Enjoy the steady flow of today.",
  ],
  neutral: [
    "I see — sounds like a pretty measured, balanced moment. 📊 That's perfectly okay. Not everything needs to be a highlight reel.",
    "It seems like things are just... normal right now. And that's completely fine! 🙏 Consistency and routine have their own quiet power.",
    "Neutral days are part of the rhythm of life. 🌊 Is there something specific you'd like to explore or shift about how you're feeling?",
    "Sometimes the middle ground is where clarity lives. 🧘 What would make today feel a little more meaningful to you?",
  ],
  slightly_negative: [
    "It sounds like things are a bit off today. 🌂 That's completely valid — not every day runs smoothly. What's the one thing that might make this easier?",
    "I'm sensing a little heaviness in your words. It's okay to not be okay sometimes. 💙 Small steps to reset can help — a walk, water, a break.",
    "Tough moments are temporary, even when they don't feel like it. 🌦️ Is there something specific that's weighing on you right now?",
    "It seems like today isn't quite clicking. Give yourself some grace — you're doing your best with what you have. 🫂",
  ],
  negative: [
    "I'm really sorry you're going through this. 💙 Your feelings are completely valid, and it's okay to feel this way. Remember: hard moments don't last forever.",
    "That sounds genuinely tough, and I hear you. 🫂 Please be gentle with yourself right now. Reaching out — even just writing this — takes courage.",
    "It's clear you're carrying something heavy. You don't have to carry it alone. 💜 Talking to someone you trust can make a real difference.",
    "I can sense the weight in your words, and I want you to know — what you're feeling is real and it matters. 🌧️ One step at a time is enough.",
  ],
  very_negative: [
    "This sounds really painful, and I'm truly sorry. 💙 Please know that your feelings are valid and you deserve support. If things ever feel overwhelming, please reach out to a trusted person or a helpline.",
    "I hear how much you're hurting right now. 🫂 That takes a lot to put into words. You are not alone in this — please reach out to someone who can be there for you in person.",
    "What you're going through sounds incredibly hard. 💜 Please remember: dark moments are not permanent, and you deserve care and support. Talking to a mental health professional can really help.",
    "I'm deeply concerned about how you're feeling. Your pain is real and it matters. 🌧️ Please don't face this alone — connect with a support line, a friend, or a counselor today.",
  ],
  // Emotion-specific overlays
  anger: [
    "I can feel the intensity in your words — and your frustration is completely understandable. 🔥 Give yourself a moment to breathe. Sometimes stepping away briefly helps bring clarity before responding.",
    "Wow, that sounds deeply frustrating. 😤 Your anger is valid. When you're ready, processing what triggered it can help transform that energy into action.",
    "Your anger tells me you care deeply — and that's not a bad thing. 💪 Channel that fire into something constructive once the heat settles.",
  ],
  sadness: [
    "It sounds like you're going through a really sad time. 💙 Sadness is a normal part of being human, and it's okay to sit with it for a while. You're not alone.",
    "I can feel the sadness between the lines. 🌧️ Allow yourself to grieve, to feel, to rest. Tears are often the language of things too deep for words.",
    "Sadness can feel so heavy. 💜 Please be kind to yourself right now. Small comforts — a warm drink, a quiet walk, a good cry — can be gentle steps forward.",
  ],
  fear: [
    "It sounds like you're feeling anxious or afraid. 😟 That's a very human response. Taking slow, deep breaths can help ground you in the present moment.",
    "Fear can feel so overwhelming — but remember, you've navigated hard things before. 🫂 What's the smallest thing you can do right now to feel a little safer?",
    "Anxiety has a way of amplifying everything. 💭 Try to separate what you can and cannot control. You are more capable than fear makes you feel.",
  ],
  joy: [
    "Your joy is absolutely contagious! 🌟 What a beautiful feeling to be in. Savour this moment — you've earned it.",
    "Pure happiness detected — and it's wonderful! 🎉 Joy like this is something to hold onto. What made today so special?",
    "This happiness is radiating right off the screen! ✨ Keep doing exactly what you're doing. You deserve all of this joy.",
  ],
};

// ─────────────────────────────────────────────────────────
// CORE SENTIMENT ENGINE
// ─────────────────────────────────────────────────────────

function analyzeSentiment(text) {
  const words = text.toLowerCase().replace(/[^\w'\s]/g, ' ').split(/\s+/).filter(Boolean);
  let totalScore = 0;
  let scoredWords = 0;

  // Emotion detection counts
  const emotionCounts = {};
  Object.keys(EMOTION_KEYWORDS).forEach(e => emotionCounts[e] = 0);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prev1 = words[i - 1] || '';
    const prev2 = words[i - 2] || '';

    // Check emotion keywords
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      if (keywords.includes(word)) emotionCounts[emotion]++;
    }

    if (word in LEXICON) {
      let score = LEXICON[word];

      // Intensifier check (word before)
      if (prev1 in INTENSIFIERS) {
        score *= INTENSIFIERS[prev1];
      }

      // Negation check (last 2 words)
      if (NEGATIONS.has(prev1) || NEGATIONS.has(prev2)) {
        score *= -0.8;
      }

      // Exclamation amplifier
      const exclamations = (text.match(/!/g) || []).length;
      if (exclamations > 0) {
        score += (score > 0 ? 1 : -1) * Math.min(exclamations * 0.3, 1.5);
      }

      totalScore += score;
      scoredWords++;
    }
  }

  // Normalize score to -1 → 1 range
  const rawScore = scoredWords === 0 ? 0 : totalScore / scoredWords;
  const clampedScore = Math.max(-5, Math.min(5, rawScore));
  const normalizedScore = clampedScore / 5; // -1 to 1

  // Determine primary sentiment label
  let sentimentLabel;
  if (normalizedScore >= 0.5) sentimentLabel = 'very_positive';
  else if (normalizedScore >= 0.15) sentimentLabel = 'positive';
  else if (normalizedScore >= 0.04) sentimentLabel = 'slightly_positive';
  else if (normalizedScore > -0.04) sentimentLabel = 'neutral';
  else if (normalizedScore > -0.15) sentimentLabel = 'slightly_negative';
  else if (normalizedScore > -0.5) sentimentLabel = 'negative';
  else sentimentLabel = 'very_negative';

  // Top emotions
  const topEmotions = Object.entries(emotionCounts)
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([e]) => e);

  // Confidence breakdown (simulated probabilities based on score)
  const absScore = Math.abs(normalizedScore);
  const posConf = Math.max(0, Math.min(1, 0.5 + normalizedScore * 0.5));
  const negConf = Math.max(0, Math.min(1, 0.5 - normalizedScore * 0.5));
  const neuConf = Math.max(0, 1 - absScore * 1.2);

  return {
    text,
    score: normalizedScore,
    rawScore: clampedScore,
    label: sentimentLabel,
    emotions: topEmotions,
    confidence: {
      positive: posConf,
      negative: negConf,
      neutral: neuConf,
    },
    wordCount: words.length,
    scoredWords,
  };
}

// ─────────────────────────────────────────────────────────
// REPLY GENERATOR
// ─────────────────────────────────────────────────────────

function generateReply(analysis) {
  let replyPool = [];

  // Primary sentiment replies
  if (REPLIES[analysis.label]) {
    replyPool = [...REPLIES[analysis.label]];
  }

  // Emotion-specific override (if strong emotion detected)
  if (analysis.emotions.length > 0) {
    const primaryEmotion = analysis.emotions[0];
    if (REPLIES[primaryEmotion] && Math.random() > 0.35) {
      replyPool = REPLIES[primaryEmotion];
    }
  }

  // Pick random reply from pool
  const idx = Math.floor(Math.random() * replyPool.length);
  return replyPool[idx] || "Thank you for sharing. I'm here to listen.";
}

// ─────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────

const SENTIMENT_META = {
  very_positive:    { label: 'Very Positive', emoji: '🌟', chipClass: 'chip-positive' },
  positive:         { label: 'Positive',      emoji: '😊', chipClass: 'chip-positive' },
  slightly_positive:{ label: 'Slightly Positive', emoji: '🙂', chipClass: 'chip-positive' },
  neutral:          { label: 'Neutral',       emoji: '😐', chipClass: 'chip-neutral' },
  slightly_negative:{ label: 'Slightly Negative', emoji: '😕', chipClass: 'chip-negative' },
  negative:         { label: 'Negative',      emoji: '😟', chipClass: 'chip-negative' },
  very_negative:    { label: 'Very Negative', emoji: '😞', chipClass: 'chip-negative' },
};

const EMOTION_META = {
  joy:      { emoji: '😄', class: 'chip-joy',      label: 'Joy' },
  sadness:  { emoji: '😢', class: 'chip-sadness',  label: 'Sadness' },
  anger:    { emoji: '😠', class: 'chip-anger',    label: 'Anger' },
  fear:     { emoji: '😨', class: 'chip-fear',     label: 'Fear' },
  surprise: { emoji: '😲', class: 'chip-surprise', label: 'Surprise' },
  love:     { emoji: '❤️', class: 'chip-joy',      label: 'Love' },
  disgust:  { emoji: '🤢', class: 'chip-anger',    label: 'Disgust' },
};

const SCORE_COLOR = {
  very_positive:    '#10b981',
  positive:         '#34d399',
  slightly_positive:'#6ee7b7',
  neutral:          '#94a3b8',
  slightly_negative:'#fca5a5',
  negative:         '#f87171',
  very_negative:    '#f43f5e',
};

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}

function getMeterPercent(score) {
  // Map -1..1 to 0..100
  return Math.round((score + 1) / 2 * 100);
}

function getMeterColor(score) {
  if (score > 0.4) return 'linear-gradient(to right, #059669, #10b981)';
  if (score > 0.1) return 'linear-gradient(to right, #10b981, #34d399)';
  if (score > -0.1) return 'linear-gradient(to right, #64748b, #94a3b8)';
  if (score > -0.4) return 'linear-gradient(to right, #f87171, #fca5a5)';
  return 'linear-gradient(to right, #be123c, #f43f5e)';
}

// ─────────────────────────────────────────────────────────
// DOM UPDATES
// ─────────────────────────────────────────────────────────

function updateMeter(analysis) {
  const meterSection  = document.getElementById('meterSection');
  const meterFill     = document.getElementById('meterFill');
  const meterScore    = document.getElementById('meterScore');
  const emotionTags   = document.getElementById('emotionTags');
  const confGrid      = document.getElementById('confidenceGrid');

  meterSection.style.display = 'flex';
  meterSection.style.flexDirection = 'column';

  const pct = getMeterPercent(analysis.score);
  meterFill.style.width = pct + '%';
  meterFill.style.background = getMeterColor(analysis.score);

  const scoreDisplay = (analysis.rawScore >= 0 ? '+' : '') + analysis.rawScore.toFixed(2);
  meterScore.textContent = scoreDisplay;
  meterScore.style.color = SCORE_COLOR[analysis.label];

  // Emotion tags
  emotionTags.innerHTML = '';
  if (analysis.emotions.length === 0) {
    emotionTags.innerHTML = `<span class="emotion-tag chip-neutral" style="animation-delay:0s">😶 No strong emotion detected</span>`;
  } else {
    analysis.emotions.forEach((em, i) => {
      const meta = EMOTION_META[em] || { emoji: '❓', class: 'chip-neutral', label: em };
      const tag = document.createElement('span');
      tag.className = `emotion-tag ${meta.class}`;
      tag.style.animationDelay = `${i * 0.08}s`;
      tag.textContent = `${meta.emoji} ${meta.label}`;
      emotionTags.appendChild(tag);
    });
  }

  // Confidence grid
  confGrid.innerHTML = '';
  const confItems = [
    { label: 'Positive', value: analysis.confidence.positive, color: '#10b981' },
    { label: 'Negative', value: analysis.confidence.negative, color: '#f43f5e' },
    { label: 'Neutral',  value: analysis.confidence.neutral, color: '#94a3b8' },
    { label: 'Words Scored', value: analysis.scoredWords / Math.max(analysis.wordCount, 1), color: '#818cf8' },
  ];
  confItems.forEach((ci, i) => {
    const el = document.createElement('div');
    el.className = 'conf-item';
    el.style.animationDelay = `${i * 0.07}s`;
    const pctVal = Math.round(ci.value * 100);
    el.innerHTML = `
      <div class="conf-label">${ci.label}</div>
      <div class="conf-bar-track">
        <div class="conf-bar-fill" style="width:0%;background:${ci.color}"></div>
      </div>
      <div class="conf-value">${pctVal}%</div>
    `;
    confGrid.appendChild(el);
    // Animate bar after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.querySelector('.conf-bar-fill').style.width = pctVal + '%';
      });
    });
  });
}

function addUserBubble(text) {
  const chatArea = document.getElementById('chatArea');
  // Remove placeholder if present
  const placeholder = document.getElementById('chatPlaceholder');
  if (placeholder) placeholder.remove();

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.innerHTML = `
    <div class="bubble-avatar">🧑</div>
    <div class="bubble-content">
      <div class="bubble-text">${escapeHtml(text)}</div>
      <div class="bubble-time">${formatTime()}</div>
    </div>
  `;
  chatArea.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function addTypingIndicator() {
  const chatArea = document.getElementById('chatArea');
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = `
    <div class="bubble-avatar">🤖</div>
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  chatArea.appendChild(indicator);
  chatArea.scrollTop = chatArea.scrollHeight;
  return indicator;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

function addAiBubble(reply, analysis) {
  const chatArea = document.getElementById('chatArea');
  const meta = SENTIMENT_META[analysis.label];

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble ai';
  bubble.innerHTML = `
    <div class="bubble-avatar">🤖</div>
    <div class="bubble-content">
      <div class="bubble-text" id="lastAiReply">${reply}</div>
      <div class="bubble-time">${formatTime()} · ${meta.emoji} ${meta.label}</div>
    </div>
  `;
  chatArea.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function updateSentimentResult(analysis) {
  const result = document.getElementById('sentimentResult');
  const detected = document.getElementById('detectedSentiment');
  const meta = SENTIMENT_META[analysis.label];

  result.style.display = 'flex';
  detected.innerHTML = `
    <span style="font-size:0.8rem;color:var(--text-muted);font-weight:500;">Detected:</span>
    <span class="sentiment-chip ${meta.chipClass}">${meta.emoji} ${meta.label}</span>
    ${analysis.emotions.length > 0 ? `
      ${analysis.emotions.map(em => {
        const m = EMOTION_META[em] || { emoji: '❓', class: 'chip-neutral', label: em };
        return `<span class="sentiment-chip ${m.class}">${m.emoji} ${m.label}</span>`;
      }).join('')}
    ` : ''}
  `;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─────────────────────────────────────────────────────────
// STATS TRACKER
// ─────────────────────────────────────────────────────────

const stats = { total: 0, positive: 0, negative: 0, neutral: 0 };

function updateStats(label) {
  stats.total++;
  if (label.includes('positive')) stats.positive++;
  else if (label.includes('negative')) stats.negative++;
  else stats.neutral++;

  animateCounter('totalAnalyzed', stats.total);
  animateCounter('posCount', stats.positive);
  animateCounter('negCount', stats.negative);
  animateCounter('neuCount', stats.neutral);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  const current = parseInt(el.textContent) || 0;
  const diff = target - current;
  if (diff === 0) return;
  let step = 0;
  const steps = 12;
  const timer = setInterval(() => {
    step++;
    el.textContent = Math.round(current + (diff * step / steps));
    if (step >= steps) clearInterval(timer);
  }, 20);
}

// ─────────────────────────────────────────────────────────
// RIPPLE EFFECT
// ─────────────────────────────────────────────────────────

function addRipple(btn, event) {
  const ripple = btn.querySelector('.btn-ripple');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
  ripple.style.transition = 'none';
  ripple.style.opacity = '1';
  ripple.style.transform = 'translate(0,0) scale(0)';
  requestAnimationFrame(() => {
    ripple.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    ripple.style.transform = 'translate(0,0) scale(1)';
    ripple.style.opacity = '0';
  });
}

// ─────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────
async function saveConversation(userText, botReply, analysis) {
  try {
    await fetch("/save-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userText: userText,
        botReply: botReply,
        sentiment: analysis.label,
        emotions: analysis.emotions,
        score: analysis.score,
        time: new Date().toLocaleString()
      })
    });
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
}
let isProcessing = false;

async function handleAnalyze(event) {
  if (isProcessing) return;

  const input = document.getElementById('userInput');
  const text = input.value.trim();

  if (!text) {
    input.focus();
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
    return;
  }

  isProcessing = true;
  const btn = document.getElementById('analyzeBtn');
  btn.classList.add('loading');
  btn.querySelector('.btn-text').textContent = 'Analyzing';
  if (event) addRipple(btn, event);

  // Add user bubble
  addUserBubble(text);

  // Run analysis (immediate — it's pure JS)
  const analysis = analyzeSentiment(text);

  // Update meter immediately
  updateMeter(analysis);
  updateSentimentResult(analysis);
  updateStats(analysis.label);

  // Simulate AI "thinking" delay for UX
  const typingIndicator = addTypingIndicator();

  await delay(900 + Math.random() * 600);

  removeTypingIndicator();

  // Generate and show reply
 const reply = generateReply(analysis);
addAiBubble(reply, analysis);

// Save chat in backend
saveConversation(text, reply, analysis);

  // Reset button
  btn.classList.remove('loading');
  btn.querySelector('.btn-text').textContent = 'Analyze Sentiment';
  isProcessing = false;

  // Clear input
  input.value = '';
  document.getElementById('charCount').textContent = '0';

  // Store last reply for copy
  btn._lastReply = reply;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────
// COPY TO CLIPBOARD
// ─────────────────────────────────────────────────────────

function copyLastReply() {
  const lastReplyEl = document.getElementById('lastAiReply');
  if (!lastReplyEl) return;
  const text = lastReplyEl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg> Copied!
    `;
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg> Copy Reply
      `;
    }, 2000);
  });
}

// ─────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────
async function loadChats() {
  try {
    const response = await fetch("/get-chats");
    const chats = await response.json();

    chats.forEach(chat => {
      addUserBubble(chat.userText);

      addAiBubble(chat.botReply, {
        label: chat.sentiment
      });
    });
  } catch (error) {
    console.error("Error loading chats:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const userInput  = document.getElementById('userInput');
  const copyBtn    = document.getElementById('copyBtn');
  const charCount  = document.getElementById('charCount');

  // Analyze button click
  analyzeBtn.addEventListener('click', (e) => handleAnalyze(e));

  // Enter key (Ctrl+Enter or Cmd+Enter)
  userInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze(e);
    }
  });

  // Character counter
  userInput.addEventListener('input', () => {
    charCount.textContent = userInput.value.length;
  });

  // Copy button
  copyBtn.addEventListener('click', copyLastReply);

  // Template buttons
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      userInput.value = btn.dataset.text;
      charCount.textContent = btn.dataset.text.length;
      userInput.focus();
      // Auto-scroll to textarea
      userInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  // Shake animation style injection
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
    .shake { animation: shake 0.4s ease; border-color: var(--accent-rose) !important; }
  `;
  document.head.appendChild(style);
    loadChats();
});
