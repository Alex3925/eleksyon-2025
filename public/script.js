let lastDataHash = '';

async function fetchResults() {
  try {
    const response = await fetch('/api/results');
    if (!response.ok) throw new Error('Failed to fetch results');
    const data = await response.json();
    
    // Hash to detect changes
    const currentHash = JSON.stringify(data);
    const syncStatus = document.getElementById('sync-status');
    
    if (currentHash !== lastDataHash && lastDataHash !== '') {
      syncStatus.textContent = 'Sync Status: Updated';
      syncStatus.style.color = 'green';
    } else {
      syncStatus.textContent = 'Sync Status: No new updates';
      syncStatus.style.color = '#555';
    }
    lastDataHash = currentHash;

    updateResults(data);
    document.getElementById('last-updated').textContent = `Last Updated: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`;
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('last-updated').textContent = 'Error fetching results. Please try again later.';
    document.getElementById('sync-status').textContent = 'Sync Status: Error';
    document.getElementById('sync-status').style.color = 'red';
  }
}

function updateResults(data, searchTerm = '') {
  // Helper to filter by search term
  const filterData = (items, keys) => items.filter(item =>
    keys.some(key => item[key]?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Senatorial
  const senatorialTable = document.querySelector('#senatorial-table tbody');
  senatorialTable.innerHTML = '';
  if (data.senatorial) {
    const filtered = filterData(data.senatorial, ['candidate', 'party']);
    if (filtered.length > 0) {
      filtered.forEach(item => {
        senatorialTable.innerHTML += `
          <tr>
            <td>${item.candidate || 'N/A'}</td>
            <td>${item.party || 'N/A'}</td>
            <td>${(item.votes || 0).toLocaleString()}</td>
            <td>${item.percentage ? item.percentage.toFixed(2) : '0.00'}%</td>
          </tr>`;
      });
    } else {
      senatorialTable.innerHTML = '<tr><td colspan="4">No matching senatorial results</td></tr>';
    }
  } else {
    senatorialTable.innerHTML = '<tr><td colspan="4">No senatorial data available</td></tr>';
  }

  // Party-List
  const partyListTable = document.querySelector('#party-list-table tbody');
  partyListTable.innerHTML = '';
  if (data.partyList) {
    const filtered = filterData(data.partyList, ['party']);
    if (filtered.length > 0) {
      filtered.forEach(item => {
        partyListTable.innerHTML += `
          <tr>
            <td>${item.party || 'N/A'}</td>
            <td>${(item.votes || 0).toLocaleString()}</td>
            <td>${item.percentage ? item.percentage.toFixed(2) : '0.00'}%</td>
          </tr>`;
      });
    } else {
      partyListTable.innerHTML = '<tr><td colspan="3">No matching party-list results</td></tr>';
    }
  } else {
    partyListTable.innerHTML = '<tr><td colspan="3">No party-list data available</td></tr>';
  }

  // Congressional
  const congressionalTable = document.querySelector('#congressional-table tbody');
  congressionalTable.innerHTML = '';
  if (data.congressional) {
    const filtered = filterData(data.congressional, ['district', 'candidate', 'party']);
    if (filtered.length > 0) {
      filtered.forEach(item => {
        congressionalTable.innerHTML += `
          <tr>
            <td>${item.district || 'N/A'}</td>
            <td>${item.candidate || 'N/A'}</td>
            <td>${item.party || 'N/A'}</td>
            <td>${(item.votes || 0).toLocaleString()}</td>
          </tr>`;
      });
    } else {
      congressionalTable.innerHTML = '<tr><td colspan="4">No matching congressional results</td></tr>';
    }
  } else {
    congressionalTable.innerHTML = '<tr><td colspan="4">No congressional data available</td></tr>';
  }

  // Gubernatorial
  const gubernatorialTable = document.querySelector('#gubernatorial-table tbody');
  gubernatorialTable.innerHTML = '';
  if (data.gubernatorial) {
    const filtered = filterData(data.gubernatorial, ['province', 'candidate', 'party']);
    if (filtered.length > 0) {
      filtered.forEach(item => {
        gubernatorialTable.innerHTML += `
          <tr>
            <td>${item.province || 'N/A'}</td>
            <td>${item.candidate || 'N/A'}</td>
            <td>${item.party || 'N/A'}</td>
            <td>${(item.votes || 0).toLocaleString()}</td>
          </tr>`;
      });
    } else {
      gubernatorialTable.innerHTML = '<tr><td colspan="4">No matching gubernatorial results</td></tr>';
    }
  } else {
    gubernatorialTable.innerHTML = '<tr><td colspan="4">No gubernatorial data available</td></tr>';
  }

  // Mayoral
  const mayoralTable = document.querySelector('#mayoral-table tbody');
  mayoralTable.innerHTML = '';
  if (data.mayoral) {
    const filtered = filterData(data.mayoral, ['city', 'candidate', 'party']);
    if (filtered.length > 0) {
      filtered.forEach(item => {
        mayoralTable.innerHTML += `
          <tr>
            <td>${item.city || 'N/A'}</td>
            <td>${item.candidate || 'N/A'}</td>
            <td>${item.party || 'N/A'}</td>
            <td>${(item.votes || 0).toLocaleString()}</td>
          </tr>`;
      });
    } else {
      mayoralTable.innerHTML = '<tr><td colspan="4">No matching mayoral results</td></tr>';
    }
  } else {
    mayoralTable.innerHTML = '<tr><td colspan="4">No mayoral data available</td></tr>';
  }
}

// Search bar
document.getElementById('search-bar').addEventListener('input', async (e) => {
  const searchTerm = e.target.value.trim();
  try {
    const response = await fetch('/api/results');
    if (!response.ok) throw new Error('Failed to fetch results');
    const data = await response.json();
    updateResults(data, searchTerm);
  } catch (error) {
    console.error('Error:', error);
  }
});

// Fetch results immediately and every 30 seconds
fetchResults();
setInterval(fetchResults, 30000);
