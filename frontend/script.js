const BACKEND_URL = 'http://bhuvana-y4st.onrender.com';
async function submitData() {
    const inputField = document.getElementById('dataInput');
    const inputVal = inputField.value.trim();
    if (!inputVal) {
        alert("Please enter some data!");
        return;
    }
    try {
        const response = await fetch(`${BACKEND_URL}/api/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input: inputVal })
        });
        const result = await response.json();
        if (response.ok) {
            inputField.value = '';
            fetchData();
        } else {
            console.error('Server error:', result.error);
            alert('Error saving data: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Could not connect to the backend. Is it running?');
    }
}
async function fetchData() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/data`);
        const data = await response.json();
        const list = document.getElementById('dataList');
        list.innerHTML = '';
        if (data.length === 0) {
            list.innerHTML = '<li style="color: var(--text-muted); text-align: center;">No data found in database. Add some!</li>';
            return;
        }
        data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.name;
            list.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        const list = document.getElementById('dataList');
        list.innerHTML = '<li style="color: #EF4444; border-left: 4px solid #EF4444;">Failed to load data. Is backend running?</li>';
    }
}
document.getElementById('dataInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        submitData();
    }
});
document.addEventListener('DOMContentLoaded', fetchData);