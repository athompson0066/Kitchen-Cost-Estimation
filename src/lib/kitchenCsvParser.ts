import Papa from 'papaparse';

export interface KitchenPriceItem {
  Category: string;
  'Item Name': string;
  Unit: string;
  Quantity: string;
  'Base Material Cost (CAD)': string;
  'Labor Multiplier': string;
  'Regional Multiplier': string;
  Subtotal: string;
}

export const parseKitchenCsv = async (): Promise<KitchenPriceItem[]> => {
  const response = await fetch('https://docs.google.com/spreadsheets/d/1Wy_GsWacMXE4BLYVGcFg1pIJfLbzPRwTLLOX5dJyDUA/export?format=csv');
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as KitchenPriceItem[]);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
};
