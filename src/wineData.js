import * as XLSX from 'xlsx';

export const processExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const processedData = jsonData.reduce((acc, row) => {
                    const { Brand, ParentSKU, Vint, IVT_Start, IVT_End, VTD_Start, VTD_End } = row;

                    if (!acc[Brand]) {
                        acc[Brand] = {};
                    }
                    if (!acc[Brand][ParentSKU]) {
                        acc[Brand][ParentSKU] = [];
                    }

                    // Convert Excel date serial number to JS Date
                    const convertExcelDate = (serialNumber) => {
                        return new Date((serialNumber - 25569) * 86400 * 1000).toISOString().split('T')[0];
                    };

                    acc[Brand][ParentSKU].push({
                        vintage: Vint,
                        ivtStart: convertExcelDate(IVT_Start),
                        ivtEnd: convertExcelDate(IVT_End),
                        vtdStart: convertExcelDate(VTD_Start),
                        vtdEnd: convertExcelDate(VTD_End)
                    });

                    return acc;
                }, {});

                resolve(processedData);
            } catch (error) {
                reject(new Error('Error processing Excel file: ' + error.message));
            }
        };
        reader.onerror = (error) => {
            reject(new Error('Error reading file: ' + error.message));
        };
        reader.readAsBinaryString(file);
    });
};