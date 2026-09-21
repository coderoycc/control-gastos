// src/app/import/services/pdfExtractor.ts
import * as pdfjsLib from 'pdfjs-dist';

// Configurar el worker de PDF.js para Vite
try {
  // @ts-expect-error - Vite inline URL import
  import('pdfjs-dist/build/pdf.worker.min.mjs?url').then((workerModule) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
  }).catch(() => {
    // Fallback estándar si falla la importación dinámica
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  });
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

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
export async function extractTextFromPDF(source: File | ArrayBuffer): Promise<ExtractedPDFContent> {
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

  const pages: ExtractedPage[] = [];
  const allLines: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as TextItem[];

    // Agrupar items por línea usando la coordenada Y (transform[5])
    // Agrupamos items con una tolerancia pequeña en Y (ej. +-2px)
    const lineMap = new Map<number, TextItem[]>();
    const Y_TOLERANCE = 2.5;

    for (const item of items) {
      if (!item.str || item.str.trim() === '') continue;

      const y = item.transform ? item.transform[5] : 0;
      
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
      lineItems.sort((a, b) => (a.transform ? a.transform[4] : 0) - (b.transform ? b.transform[4] : 0));
      
      const lineText = lineItems
        .map((item) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (lineText.length > 0) {
        pageLines.push(lineText);
        allLines.push(lineText);
      }
    }

    pages.push({
      pageNumber: pageNum,
      text: pageLines.join('\n'),
      lines: pageLines,
    });
  }

  return {
    totalPages,
    rawText: allLines.join('\n'),
    lines: allLines,
    pages,
  };
}
