const ENCRYPTION_KEY = 'control-gastos-secret-salt-2026';

export function encodeData(data: unknown): string {
  const jsonStr = JSON.stringify(data);
  const bytes = new TextEncoder().encode(jsonStr);
  const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
  const encryptedBytes = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    encryptedBytes[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
  }
  let hex = '';
  for (let i = 0; i < encryptedBytes.length; i++) {
    hex += encryptedBytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function decodeData(hex: string): unknown {
  const cleanHex = hex.trim();
  if (cleanHex.length % 2 !== 0) {
    throw new Error('El archivo no tiene una longitud válida.');
  }
  const len = cleanHex.length / 2;
  const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const byteVal = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    if (isNaN(byteVal)) {
      throw new Error('El archivo contiene caracteres inválidos.');
    }
    bytes[i] = byteVal ^ keyBytes[i % keyBytes.length];
  }
  const jsonStr = new TextDecoder().decode(bytes);
  return JSON.parse(jsonStr);
}
