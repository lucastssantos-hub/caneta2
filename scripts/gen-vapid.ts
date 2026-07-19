// Gera um par de chaves VAPID para Web Push.
//   npm run vapid
// Copie os valores para o seu .env.

import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("Adicione ao seu .env:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${keys.privateKey}"`);
console.log(`VAPID_SUBJECT="mailto:voce@exemplo.com"`);
