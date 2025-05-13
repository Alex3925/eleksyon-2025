let lastDataHash = '';

async function fetchResults() {
  try {
    const response = await fetch('/api/results');
    if (!response.ok) throw new Error('Failed to fetch results');
    const data = await response.json();
    
    // HASH GENERATOR - ALEX
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
  // Senatorial table
  const senatorialTable = document.querySelector('#senatorial-table tbody');
  senatorialTable.innerHTML = '';
  if (data.senatorial) {
    const filteredSenatorial = data.senatorial.filter(candidate =>
      candidate.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredSenatorial.length > 0) {
      filteredSenatorial.forEach(candidate => {
        senatorialTable.innerHTML += `
          <tr>
            <td>${candidate.candidate || 'N/A'}</td>
            <td>${candidate.party || 'N/A'}</td>
            <td>${(candidate.votes || 0).toLocaleString()}</td>
            <td>${candidate.percentage ? candidate.percentage.toFixed(2) : '0.00'}%</td>
          </tr>`;
      });
    } else {
      senatorialTable.innerHTML = '<tr><td colspan="4">No matching senatorial results</td></tr>';
    }
  } else {
    senatorialTable.innerHTML = '<tr><td colspan="4">No senatorial data available</td></tr>';
  }

  // Party-list table
  const partyListTable = document.querySelector('#party-list-table tbody');
  partyListTable.innerHTML = '';
  if (data.partyList) {
    const filteredPartyList = data.partyList.filter(party =>
      party.party.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredPartyList.length > 0) {
      filteredPartyList.forEach(party => {
        partyListTable.innerHTML += `
          <tr>
            <td>${party.party || 'N/A'}</td>
            <td>${(party.votes || 0).toLocaleString()}</td>
            <td>${party.percentage ? party.percentage.toFixed(2) : '0.00'}%</td>
          </tr>`;
      });
    } else {
      partyListTable.innerHTML = '<tr><td colspan="3">No matching party-list results</td></tr>';
    }
  } else {
    partyListTable.innerHTML = '<tr><td colspan="3">No party-list data available</td></tr>';
  }
}

// Search bar functionality
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
