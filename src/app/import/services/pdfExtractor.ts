// src/app/import/services/pdfExtractor.ts
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// @ts-expect-error - Vite inline URL import
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

// Polyfill de seguridad para entornos/navegadores sin soporte nativo de toHex en Uint8Array
if (typeof Uint8Array !== "undefined" && !("toHex" in Uint8Array.prototype)) {
  // @ts-expect-error - Polyfill para propuesta ECMAScript toHex
  Uint8Array.prototype.toHex = function () {
    return Array.from(this)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };
}

// Configurar el worker de PDF.js usando la versión legacy
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  lines: string[];
}

export interface ExtractedPDFContent {
  totalPages: number;
  rawText: string;
  lines: string[];
  pages: ExtractedPage[];
}

interface TextItem {
  str: string;
  transform: number[]; // [scaleX, skewY, skewX, scaleY, posX, posY]
  hasEOL?: boolean;
}

/**
 * Lee un archivo PDF (File o ArrayBuffer) y extrae su texto estructurado por líneas y páginas.
 */
export async function extractTextFromPDF(
  source: File | ArrayBuffer,
): Promise<ExtractedPDFContent> {
  let arrayBuffer: ArrayBuffer;

  if (source instanceof File) {
    arrayBuffer = await source.arrayBuffer();
  } else {
    arrayBuffer = source;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // 1. Detección preliminar de columnas para identificar la columna "Saldo"
  let saldoColMinX: number | null = null;
  let tableHeaderY: number | null = null;

  for (let pageNum = 1; pageNum <= Math.min(2, totalPages); pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    for (const item of textContent.items as TextItem[]) {
      const text = (item.str || "").trim();
      // Detectar encabezado de columna Saldo hacia la derecha de la tabla
      if (/^saldo$/i.test(text) || /^saldo\s+(actual|disponible|contable)$/i.test(text)) {
        const x = item.transform ? item.transform[4] : 0;
        const y = item.transform ? item.transform[5] : 0;
        if (x > 300) {
          saldoColMinX = x - 20; // Margen de tolerancia a la izquierda
          tableHeaderY = y;
          break;
        }
      }
    }
    if (saldoColMinX !== null) break;
  }

  const pages: ExtractedPage[] = [];
  const allLines: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as TextItem[];

    // Agrupar items por línea usando la coordenada Y (transform[5])
    // Agrupamos items con una tolerancia pequeña en Y (ej. +-2.5px)
    const lineMap = new Map<number, TextItem[]>();
    const Y_TOLERANCE = 2.5;

    for (const item of items) {
      if (!item.str || item.str.trim() === "") continue;

      const x = item.transform ? item.transform[4] : 0;
      const y = item.transform ? item.transform[5] : 0;

      // Si se detectó la columna "Saldo", omitir los ítems de esa columna en la tabla
      if (saldoColMinX !== null && x >= saldoColMinX) {
        // Permitir metadatos de cabecera que estén por encima de la tabla en página 1
        if (pageNum === 1 && tableHeaderY !== null && y > tableHeaderY + 10) {
          // Metadato superior del documento
        } else {
          continue;
        }
      }

      // Buscar una clave Y existente dentro de la tolerancia
      let matchedY: number | null = null;
      for (const existingY of lineMap.keys()) {
        if (Math.abs(existingY - y) <= Y_TOLERANCE) {
          matchedY = existingY;
          break;
        }
      }

      if (matchedY !== null) {
        lineMap.get(matchedY)!.push(item);
      } else {
        lineMap.set(y, [item]);
      }
    }

    // Ordenar las líneas por Y descendente (de arriba a abajo en la página)
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const pageLines: string[] = [];

    for (const y of sortedY) {
      const lineItems = lineMap.get(y)!;
      // Ordenar los items dentro de la línea por X ascendente (de izquierda a derecha)
      lineItems.sort(
        (a, b) =>
          (a.transform ? a.transform[4] : 0) -
          (b.transform ? b.transform[4] : 0),
      );

      const lineText = lineItems
        .map((item) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (lineText.length > 0) {
        pageLines.push(lineText);
        allLines.push(lineText);
      }
    }

    pages.push({
      pageNumber: pageNum,
      text: pageLines.join("\n"),
      lines: pageLines,
    });
  }

  return {
    totalPages,
    rawText: allLines.join("\n"),
    lines: allLines,
    pages,
  };
}
