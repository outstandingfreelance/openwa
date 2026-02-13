const wa = require('@open-wa/wa-automate');
const express = require('express');
const app = express();
app.use(express.json());

const PORT = 3000;
let client;

// 1. Typebot → WhatsApp (работает!)
app.post('/typebot-response', async (req, res) => {
  console.log('🔵 Typebot → WA:', req.body);
  if (client && req.body.phone) {
    await client.sendText(req.body.phone, req.body.message);
  }
  res.json({ success: true });
});

// 2. Тест endpoint
app.get('/', (req, res) => res.send('🟢 OpenWA жив!'));

wa.create({
  sessionId: "mybot",
  multiDevice: true,
  headless: true,
  popup: true
}).then(cl => {
  client = cl;
  console.log('✅ WhatsApp подключён!');
  
  // 3. WhatsApp → Typebot (КРИТИЧНО!)
  cl.onMessage(async msg => {
    if (msg.body && !msg.isGroupMsg) {
      console.log('📱 WhatsApp:', msg.body);
      
      // ОТПРАВЛЯЕМ В TYPEBOT публичный URL!
      const TYPEBOT_WEBHOOK = 'https://app.typebot.io/typebots/egfzw1zdcdofng0foqj9jjw0';
      
      await fetch(TYPEBOT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: msg.from,
          message: msg.body,
          name: msg.sender?.pushname || 'User'
        })
      }).then(() => console.log('✅ → Typebot'))
        .catch(err => console.error('❌ Typebot ошибка:', err));
    }
  });
  
  app.listen(PORT, () => {
    console.log(`🌐 Локал: http://localhost:${PORT}`);
    console.log(`🌐 ngrok: ngrok http ${PORT}`);
  });
});
