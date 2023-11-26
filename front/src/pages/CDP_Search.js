import { useEffect, useRef, useState } from 'react';
import async from 'async';
import Web3 from 'web3';
import { getIlkInfo } from '@defisaver/tokens';

const tokens = ["ETH-A", "WBTC-A", "USDC-A"]
const contractAddress = '0x68C61AF097b834c68eA6EA5e46aF6c04E8945B2d'; // Adresa MakerDAO contracta
const contractABI = [
    {
      "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
      "name": "_getProxyOwner",
      "outputs": [{"internalType": "address", "name": "userAddr", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_cdpId", "type": "uint256"}],
      "name": "getCdpInfo",
      "outputs": [
        {"internalType": "address", "name": "urn", "type": "address"},
        {"internalType": "address", "name": "owner", "type": "address"},
        {"internalType": "address", "name": "userAddr", "type": "address"},
        {"internalType": "bytes32", "name": "ilk", "type": "bytes32"},
        {"internalType": "uint256", "name": "collateral", "type": "uint256"},
        {"internalType": "uint256", "name": "debt", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  

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


function CDP_Search() {
    const [cdpData, setCdpData] = useState(null);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [roughCdpId, setRoughCdpId] = useState("11015");
  const [positions, setPositions] = useState([]);
  const queue = useRef(null);
  const last_pushed = useRef(-1);

  useEffect(() => {
    async function fetch_position(data) {
        console.log(data.id)
        const currentPositionData = await fetchData(data.id)
        console.log(currentPositionData)
        if (hexToAsciiStr(currentPositionData.ilk).trim().toLowerCase() != selectedToken.trim().toLowerCase()) {
            console.log("lose" + hexToAsciiStr(currentPositionData.ilk).trim().toLowerCase() + "!=" + selectedToken.trim().toLowerCase())
        const new_pushed = last_pushed.current = last_pushed.current + 1;
        queue.current.push({ id: getId(roughCdpId, new_pushed), relative: new_pushed });
        return;
      }

      const result =  { id: data.id, collateral: currentPositionData.collateral, amount: 1, debt: currentPositionData.debt, relative: data.relative };
      console.log(result)
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
  const fetchData = async (id) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
  
        const web3 = new Web3(window.ethereum);
  
        const contract = new web3.eth.Contract(contractABI, contractAddress);
  
        const data = await contract.methods.getCdpInfo(id).call();
        return data
      } else {
        alert("Molimo Vas aktivirajte Metamask")
        console.error('Metamask nije detektovan');
      }
    } catch (error) {
      console.error('Error fetching CDP data:', error);
    }
  };
  
  function hexToAsciiStr(hexStr) {
    let asciiStr = '';
    for (let i = 0; i < hexStr.length; i += 2) {
      let part = hexStr.substr(i, 2);
      if (part !== '00') {
        asciiStr += String.fromCharCode(parseInt(part, 16));
      }
    }
    return asciiStr.replace(/[^\x20-\x7E]/g, '').trim(); // Uklanja sve ne-štampane karaktere i trimuje string
  }
  

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
        <button onClick={()=>fetchData(roughCdpId)}>Dohvati CDP Podatke</button>

      {positions.map(e => <div>{e.id}</div>)}
    </div>
  );
}

export default CDP_Search;