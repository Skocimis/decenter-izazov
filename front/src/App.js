import './App.css';
import { useEffect, useRef, useState } from 'react';
import async from 'async';

const tokens = ["ETH-A", "WBTC-A", "USDC-A"]

function getId(rough, relative) {
  if (relative >= 2 * rough + 2) {
    return relative;
  }

  const p = parseInt(rough);
  return (relative % 2 === 0) ? (p - relative / 2) : (p + (relative + 1) / 2);
}

function sortCriterium(a, b) {
  return a.id - b.id;
}

const POS_N = 20;


function App() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [roughCdpId, setRoughCdpId] = useState("11015");
  const [positions, setPositions] = useState([]);
  const queue = useRef(null);
  const last_pushed = useRef(-1);

  useEffect(() => {
    async function fetch_position(data) {
      if (Math.random() < 0.4) {
        const new_pushed = last_pushed.current = last_pushed.current + 1;
        queue.current.push({ id: getId(roughCdpId, new_pushed), relative: new_pushed });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500 + Math.floor(Math.random() * 1000)))
      const result = { id: data.id, collateral: "Lol", amount: 1, debt: 1000, relative: data.relative };

      setPositions(e => {
        if (e.length >= POS_N)
          return e;
        if (e.length == 0)
          return [{ ...result, first: true }];

        const arr = [...e, result];

        if (e.length == POS_N - 1)
          arr.sort(sortCriterium);

        return arr;
      })
    }
    queue.current = async.queue(fetch_position, 5);

    return () => queue.current.kill();
  }, [])

  return (
    <div>
      <select
        value={selectedToken}
        onChange={e => setSelectedToken(e.target.value)}
      >
        {tokens.map(e => <option value={e}>{e}</option>)}
      </select>
      <input type='text' value={roughCdpId} onChange={e => setRoughCdpId(e.target.value)}></input>
      <button onClick={async () => {
        setPositions(_ => []);

        for (let i = 0; i < POS_N; i++) {
          last_pushed.current = i;
          queue.current.push({ id: getId(roughCdpId, i), relative: i });
        }
      }}>Load positions</button>
      {positions.map(e => <div>{JSON.stringify(e)}</div>)}
    </div>
  );
}

export default App;