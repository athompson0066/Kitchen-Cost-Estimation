import Papa from 'papaparse';

export interface PriceItem {
  Category: string;
  'Item Name': string;
  Unit: string;
  Quantity: string;
  'Base Material Cost (CAD)': string;
  'Labor Multiplier': string;
  'Regional Multiplier': string;
  Subtotal: string;
}

export const parseEstimatorCsv = async (): Promise<PriceItem[]> => {
  const response = await fetch('/Kitchen_Renovation_Estimator_2026.csv');
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as PriceItem[]);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
};
