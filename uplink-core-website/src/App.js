
// Fully converted Uplink Core web app
import React, { useState, useEffect } from 'react';

function App() {
  const [name, setName] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [userList, setUserList] = useState([]);
  const [entries, setEntries] = useState([]);
  const [reward, setReward] = useState('');
  const [promo, setPromo] = useState('');
  const [business, setBusiness] = useState('');
  const [donation, setDonation] = useState('0');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem('entries')) || [];
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setEntries(storedEntries);
    setUserList(storedUsers);
  }, []);

  const saveUserList = (list) => {
    localStorage.setItem('users', JSON.stringify(list));
  };

  const handleSubmit = () => {
    const newEntry = { name: submittedName, reward, promo, business, donation, amount, timestamp: new Date().toISOString() };
    const updated = [...entries, newEntry];
    setEntries(updated);
    localStorage.setItem('entries', JSON.stringify(updated));
    setReward(''); setPromo(''); setBusiness(''); setDonation('0'); setAmount('');
  };

  const handleClearAll = () => {
    localStorage.removeItem('entries');
    localStorage.removeItem('users');
    setEntries([]);
    setUserList([]);
  };

  const handleDeleteEntry = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
    localStorage.setItem('entries', JSON.stringify(updated));
  };

  const HomeScreen = () => (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Welcome to Uplink Core</h2>
        <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
        <button style={styles.button} onClick={() => {
          setSubmittedName(name);
          if (!userList.includes(name)) {
            const updatedList = [...userList, name];
            setUserList(updatedList);
            saveUserList(updatedList);
          }
        }}>Submit</button>
      </div>
      {userList.length > 0 && (
        <div style={styles.card}>
          <h3>Select a saved user</h3>
          {userList.map((user, index) => (
            <p key={index} onClick={() => { setName(user); setSubmittedName(user); }} style={{ cursor: 'pointer', color: '#8B0000' }}>{user}</p>
          ))}
        </div>
      )}
      <button style={{ ...styles.button, backgroundColor: '#FF3B30' }} onClick={handleClearAll}>Clear All Users & Data</button>
    </div>
  );

  const EntryScreen = () => (
    <div style={styles.container}>
      <h2>New Entry</h2>
      {[['Rewards', reward, setReward, ['Yes', 'No', 'Already Had']],
        ['Paper Promo', promo, setPromo, ['Yes', 'No', 'N/A']],
        ['Business Select', business, setBusiness, ['Yes', 'No', 'Already Had', 'N/A']],
        ['Donations ($)', donation, setDonation, ['0', '1', '5', '10', '20']]]
        .map(([label, val, setVal, options], i) => (
          <div key={i} style={styles.card}>
            <label>{label}:</label>
            <select style={styles.input} value={val} onChange={(e) => setVal(e.target.value)}>
              <option value="">-- Select --</option>
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ))}
      <div style={styles.card}>
        <label>Amount ($):</label>
        <input style={styles.input} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" />
      </div>
      <button style={styles.button} onClick={handleSubmit}>Submit</button>
    </div>
  );

  const StatsScreen = () => {
    const userEntries = entries.filter(e => e.name === submittedName);
    const calcAttach = (key) => {
      let valid = ['Yes', 'No', 'Already Had'];
      if (key === 'business') valid.push('N/A');
      const filtered = userEntries.filter(e => valid.includes(e[key]));
      const success = filtered.filter(e => ['Yes', 'Already Had', ...(key === 'business' ? ['N/A'] : [])].includes(e[key]));
      return filtered.length ? ((success.length / filtered.length) * 100).toFixed(1) + '%' : '0%';
    };

    return (
      <div style={styles.container}>
        <h2>Stats for {submittedName}</h2>
        <p>Penetration Rate (Rewards): {calcAttach('reward')}</p>
        <p>Attach Rate (Paper): {calcAttach('promo')}</p>
        <p>Attach Rate (Biz): {calcAttach('business')}</p>
        <p>Total Sales: ${userEntries.reduce((a, e) => a + Number(e.amount || 0), 0)}</p>
        <p>Total Donations: ${userEntries.reduce((a, e) => a + Number(e.donation || 0), 0)}</p>
      </div>
    );
  };

  const HistoryScreen = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysEntries = entries.filter(e => e.timestamp && e.timestamp.startsWith(today));

    const exportPDF = () => {
      const html = `<html><body><h1>Uplink Core - Today's Entries</h1>` +
        todaysEntries.map((e, i) => `
        <div>
          <h3>Transaction ${i + 1}</h3>
          <p>Rewards: ${e.reward}</p>
          <p>Promo: ${e.promo}</p>
          <p>Biz: ${e.business}</p>
          <p>Donation: $${e.donation}</p>
          <p>Amount: $${e.amount}</p>
          <p>Time: ${e.timestamp}</p>
        </div>`).join('') + '</body></html>';
      const newWin = window.open();
      newWin.document.write(html);
      newWin.print();
      newWin.close();
    };

    return (
      <div style={styles.container}>
        <button style={styles.button} onClick={exportPDF}>Export Today's Entries to PDF</button>
        {entries.map((item, index) => (
          <div key={index} style={styles.card}>
            <p>Rewards: {item.reward}</p>
            <p>Promo: {item.promo}</p>
            <p>Biz: {item.business}</p>
            <p>Donation: ${item.donation}</p>
            <p>Amount: ${item.amount}</p>
            <button style={{ ...styles.button, backgroundColor: '#FF3B30' }} onClick={() => handleDeleteEntry(index)}>Delete</button>
          </div>
        ))}
      </div>
    );
  };

  const screenMap = {
    home: <HomeScreen />,
    entry: <EntryScreen />,
    stats: <StatsScreen />,
    history: <HistoryScreen />,
  };

  const [screen, setScreen] = useState('home');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px', background: '#eee' }}>
        {['home', 'entry', 'stats', 'history'].map(key => (
          <button key={key} onClick={() => setScreen(key)}>{key.charAt(0).toUpperCase() + key.slice(1)}</button>
        ))}
      </div>
      {screenMap[screen]}
    </div>
  );
}

const styles = {
  container: { padding: '40px', maxWidth: '700px', margin: 'auto' },
  input: { padding: '10px', margin: '10px 0', width: '100%', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '10px 15px', backgroundColor: '#8B0000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
};

export default App;
