// utils/emailUtil.ts
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { EnvConfig } from "../config/viriableConstant";
import dotenv from 'dotenv';
dotenv.config();


const emailUser = EnvConfig.email || process.env.EMAIL_USER || '';
const emailPass = EnvConfig.password || process.env.EMAIL_PASS || '';

if (!emailUser || !emailPass) {
  throw new Error('EMAIL_USER and EMAIL_PASS environment variables must be set');
}

const imapConfig = {
  imap: {
    user: emailUser,
    password: emailPass,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }, // 👈 allow self-signed
    authTimeout: 3000,
  
  }
};

export async function fetchLatestMfaCode(fromAddress?: string, timeoutMs = 30000): Promise<string> {
  const conn = imaps.connect(imapConfig);
  await (await conn).openBox('INBOX');

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const criteria: any[] = ['UNSEEN'];
    if (fromAddress) criteria.push(['FROM', fromAddress]);

    const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
    const messages = await (await conn).search(criteria, fetchOptions);

    if (messages.length) {
      const all = messages.map(m => {
        const part = m.parts.find((p: any) => p.which === 'TEXT');
        return part ? part.body : '';
      }).join('\n');

      const match = all.match(/\b\d{4,8}\b/);
      if (match) {
        await (await conn).end();
        return match[0];
      }
    }
    await new Promise(r => setTimeout(r, 1500)); // poll interval
  }

  await (await conn).end();
  throw new Error('Timed out waiting for MFA email');
}
