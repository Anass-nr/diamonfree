// api/freefire-lookup.js
export default async function handler(req, res) {
  // إعدادات CORS للسماح للصفحة بالاتصال
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
    return res.status(400).json({ error: 'UID or Account Name is required' });
  }

  // المنطقة الافتراضية: SG (سنغافورة)
  const SERVER = 'SG';

  try {
    let uid = clean;
    let playerData = null;

    // 1. إذا كان الإدخال أرقاماً (UID)، نستخدم واجهة بيانات اللاعب مباشرة
    if (/^[0-9]{8,12}$/.test(clean)) {
      const url = `https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=${uid}&need_gallery_info=true&need_blacklist=true`;
      const response = await fetch(url);
      playerData = await response.json();
    }
    // 2. إذا كان الإدخال نصاً (اسم حساب)، نبحث أولاً عن الـ UID
    else {
      const searchUrl = `https://freefireinfo-zy9l.onrender.com/api/v1/search-players?keyword=${encodeURIComponent(clean)}&server=${SERVER}`;
      const searchResponse = await fetch(searchUrl);
      const searchResult = await searchResponse.json();

      if (!searchResult || !searchResult.infos || searchResult.infos.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }

      uid = searchResult.infos[0].accountid;
      const playerUrl = `https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=${uid}&need_gallery_info=true&need_blacklist=true`;
      const playerResponse = await fetch(playerUrl);
      playerData = await playerResponse.json();
    }

    // التحقق من وجود البيانات في الاستجابة
    if (!playerData || !playerData.basicinfo || !playerData.basicinfo.nickname) {
      return res.status(404).json({ error: 'Player not found or data incomplete' });
    }

    const basic = playerData.basicinfo;
    const region = basic.region || 'SG';
    const regionLower = region.toLowerCase();

    // إرجاع البيانات بالهيكل المطلوب لصفحتك
    return res.status(200).json({
      id: uid,
      name: basic.nickname,
      level: basic.level || 0,
      region: region,
      rank: basic.rank || 'Unranked',
      likes: basic.liked || 0,
      avatarUrl: `https://discordbot.freefirecommunity.com/outfit_image_api?uid=${uid}&region=${regionLower}`,
      bannerUrl: `https://discordbot.freefirecommunity.com/banner_image_api?uid=${uid}&region=${regionLower}`,
    });

  } catch (error) {
    console.error('Proxy error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch player data' });
  }
}
