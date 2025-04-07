const inCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuMJB0zI-lXYRAX30vSyfz52ApEick9SzGkvgdyyuhC9chXmIyzxJscgmpmX6GMvP0fCmXTGmSJLpP/pub?gid=0&single=true&output=csv';  // URL of your "In" (Production) CSV
const outCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuMJB0zI-lXYRAX30vSyfz52ApEick9SzGkvgdyyuhC9chXmIyzxJscgmpmX6GMvP0fCmXTGmSJLpP/pub?gid=1505011217&single=true&output=csv';  // URL of your "Out" (Dispatch) CSV

// Function to fetch and parse the CSV data
async function fetchStockData() {
    const sku = document.getElementById('sku').value;

    // Clear previous results
    document.getElementById('productionTable').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('dispatchTable').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('remainingStock').innerText = '';
    document.getElementById('result').style.display = 'none';
    document.getElementById('totalProduced').innerText = '0';
    document.getElementById('totalDispatched').innerText = '0';

    if (sku === '') {
        alert('Please enter an SKU.');
        return;
    }

    try {
        // Fetch and parse the "In" (Production) CSV
        const inResponse = await fetch(inCsvUrl);
        const inCsvText = await inResponse.text();
        const inRows = inCsvText.split('\n').map(row => row.split(','));

        // Fetch and parse the "Out" (Dispatch) CSV
        const outResponse = await fetch(outCsvUrl);
        const outCsvText = await outResponse.text();
        const outRows = outCsvText.split('\n').map(row => row.split(','));

        let totalProduced = 0;
        let totalDispatched = 0;
        let productionData = '';
        let dispatchData = '';

        // Process the "In" CSV to get total produced and production date
        inRows.forEach(row => {
            const [skuInSheet, produced, prodDate] = row;
            if (skuInSheet.trim() === sku) {
                totalProduced += parseInt(produced, 10);
                productionData += `<tr><td>${skuInSheet}</td><td>${produced}</td><td>${prodDate}</td></tr>`;
            }
        });

        // Process the "Out" CSV to get total dispatched and dispatch date
        outRows.forEach(row => {
            const [skuOutSheet, dispatched, dispatch] = row;
            if (skuOutSheet.trim() === sku) {
                totalDispatched += parseInt(dispatched, 10);
                dispatchData += `<tr><td>${skuOutSheet}</td><td>${dispatched}</td><td>${dispatch}</td></tr>`;
            }
        });

        // Insert rows into the respective tables
        document.getElementById('productionTable').getElementsByTagName('tbody')[0].innerHTML = productionData;
        document.getElementById('dispatchTable').getElementsByTagName('tbody')[0].innerHTML = dispatchData;

        // Update the total values in the footer
        document.getElementById('totalProduced').innerText = totalProduced;
        document.getElementById('totalDispatched').innerText = totalDispatched;

        // Calculate remaining stock
        const remainingStock = totalProduced - totalDispatched;

        if (remainingStock >= 0) {
            document.getElementById('remainingStock').innerText = `Remaining Stock: ${remainingStock}`;
            document.getElementById('result').style.display = 'block';
        } else {
            alert('Error: Stock details not found.');
        }

    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
        alert('Failed to fetch data from CSV.');
    }
}
