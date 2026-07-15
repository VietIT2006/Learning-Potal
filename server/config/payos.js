import { PayOS } from '@payos/node';
import './env.js';

const payos = new PayOS({
  clientId: process.env.VITE_PAYOS_CLIENT_ID,
  apiKey: process.env.VITE_PAYOS_API_KEY,
  checksumKey: process.env.VITE_PAYOS_CHECKSUM_KEY
});

export default payos;
