const wa = require('@open-wa/wa-automate');
const express = require('express');
const app = express();

app.use(express.json()); // Парсим JSON из Typebot

const PORT = 3000;
let client; // Глобальный клиент WA

// Webhook для Typebot (Typebot шлёт POST сюда при завершении флоу)
app.post('/typebot-webhook', async (req, res) => {
  const { phone, message } = req.body; // Typebot отправляет номер и текст
  await client.sendText(phone, message); // Отправляем ответ в WhatsApp
  res.json({ success: true });
});

// Endpoint для входящих сообщений из WhatsApp → Typebot
wa.create({
  sessionId: "mybot",
  multiDevice: true,
  headless: true,
  popup: true,
  hostNotificationLang: 'RU'
}).then(cl => {
  client = cl;
  start(client);

  // Запускаем сервер ПОСЛЕ создания клиента
  app.listen(PORT, () => console.log(`Сервер на http://localhost:${PORT}`));
});

function start(client) {
  client.onMessage(async message => {
    if (message.body && !message.isGroupMsg) {
      // Перенаправляем в Typebot (замените на ваш Typebot URL)
      await fetch('https://app.typebot.io/typebots/egfzw1zdcdofng0foqj9jjw0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: message.from,
          message: message.body,
          name: message.sender.pushname
        })
      });
    }
  });
}
