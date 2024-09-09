import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import BrandCard from './components/BrandCard';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const readExcel = async () => {
      try {
        const response = await fetch('/wine_data.xlsx');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        // Explicitly specify the file type
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });

        const processedData = jsonData.reduce((acc, row) => {
          const { Brand, ParentSKU, Vint, IVT_Start, IVT_End, VTD_Start, VTD_End } = row;

          if (!acc[Brand]) {
            acc[Brand] = {};
          }
          if (!acc[Brand][ParentSKU]) {
            acc[Brand][ParentSKU] = [];
          }

          acc[Brand][ParentSKU].push({
            vintage: Vint,
            ivtStart: IVT_Start,
            ivtEnd: IVT_End,
            vtdStart: VTD_Start,
            vtdEnd: VTD_End
          });

          return acc;
        }, {});

        setData(processedData);
      } catch (error) {
        setError('Error reading Excel file. Please check if the file exists in the public folder and try again.');
      }
    };

    readExcel();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <h1>Wine Vintage Transition Visualization</h1>
      {data && Object.entries(data).map(([brand, skus]) => (
        <BrandCard key={brand} brand={brand} skus={skus} />
      ))}
    </div>
  );
}

export default App;