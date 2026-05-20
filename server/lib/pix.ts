/**
 * Gerador de payload Pix EMV BR Code (estático).
 * Especificação Bacen — copia-e-cola Pix.
 */

function id(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xffff;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitize(text: string, max: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, max)
    .trim();
}

export interface PixPayloadInput {
  pixKey: string;       // chave Pix (CPF, email, telefone, EVP)
  merchantName: string; // nome do recebedor (max 25)
  merchantCity: string; // cidade (max 15)
  amount: number;       // valor em reais
  txid?: string;        // identificador único (max 25, alfanumérico)
}

export function gerarPayloadPix(input: PixPayloadInput): string {
  const merchantName = sanitize(input.merchantName, 25) || "RECEBEDOR";
  const merchantCity = sanitize(input.merchantCity, 15) || "BRASIL";
  const txid = sanitize(input.txid || "***", 25) || "***";
  const valor = input.amount.toFixed(2);

  // Merchant Account Information (ID 26)
  const gui = id("00", "br.gov.bcb.pix");
  const chave = id("01", input.pixKey);
  const merchantAccountInfo = id("26", gui + chave);

  // Additional Data Field (ID 62) com txid
  const additional = id("62", id("05", txid));

  // Monta payload sem CRC
  const payload =
    id("00", "01") +              // Payload Format Indicator
    id("01", "11") +              // Point of Initiation Method (11 = estático com txid único)
    merchantAccountInfo +
    id("52", "0000") +            // Merchant Category Code
    id("53", "986") +              // Currency BRL
    id("54", valor) +             // Amount
    id("58", "BR") +              // Country
    id("59", merchantName) +      // Merchant Name
    id("60", merchantCity) +      // Merchant City
    additional;

  const semCrc = payload + "6304";
  const crc = crc16(semCrc);
  return semCrc + crc;
}
