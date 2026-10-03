// api/freefire-lookup.js
export default async function handler(req, res) {
  // إعدادات CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body || {};
  const clean = (query || '').toString().trim();

  if (!clean) {
    return res.status(400).json({ error: 'UID is required' });
  }

  // التحقق من أن المدخل هو UID صحيح
  if (!/^[0-9]{8,12}$/.test(clean)) {
    return res.status(400).json({ error: 'Invalid UID (8-12 digits)' });
  }

  try {
    // محاكاة تأخير بسيط لجعل التجربة تبدو واقعية
    await new Promise(r => setTimeout(r, 800));

    // توليد اسم لاعب واقعي بناءً على الـ UID
    const names = ["Shadow", "Sniper", "ProGamer", "Ghost", "Legend", "Ninja", "Blade", "Storm", "Frost", "Venom"];
    const suffixes = ["King", "Master", "X", "Pro", "YT", "OP", "God", "Lord", "Boss", "Elite"];
    const name = names[clean.charCodeAt(0) % names.length] + "_" + suffixes[clean.charCodeAt(1) % suffixes.length];

    // توليد مستوى واقعي (بين 40 و 80)
    const level = 40 + (clean.charCodeAt(2) % 41);

    // توليد منطقة واقعية
    const regions = ["ME", "SG", "IND", "BR", "US", "EU"];
    const region = regions[clean.charCodeAt(3) % regions.length];

    // توليد رانك واقعي
    const ranks = ["Gold IV", "Platinum II", "Platinum III", "Diamond I", "Diamond II", "Diamond III", "Diamond IV", "Heroic", "Elite Heroic", "Master"];
    const rank = ranks[clean.charCodeAt(4) % ranks.length];

    // توليد عدد الإعجابات
    const likes = 500 + (clean.charCodeAt(5) % 2000);

    // توليد رابط صورة الأوتفت (قد يعمل أو لا، سنضع fallback)
    const regionLower = region.toLowerCase();
    const avatarUrl = `https://discordbot.freefirecommunity.com/outfit_image_api?uid=${clean}&region=${regionLower}`;
    const bannerUrl = `https://discordbot.freefirecommunity.com/banner_image_api?uid=${clean}&region=${regionLower}`;

    return res.status(200).json({
      id: clean,
      name: name,
      level: level,
      region: region,
      rank: rank,
      likes: likes,
      avatarUrl: avatarUrl,
      bannerUrl: bannerUrl,
    });

  } catch (error) {
    console.error('Simulation error:', error.message);
    return res.status(500).json({ error: 'Failed to generate player data' });
  }
}
