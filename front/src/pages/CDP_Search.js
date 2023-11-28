import { useEffect, useRef, useState } from 'react';
import async from 'async';
import Web3 from 'web3';
import './cdp.css'
import CdpSearchInput from '../components/CdpSearchInput';
import Contract from '../data/Contract.json'

const tokens = ["ETH-A", "WBTC-A", "USDC-A"]

const POS_N = 20;


function CDP_Search() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [roughCdpId, setRoughCdpId] = useState("11015");
  const [positions, setPositions] = useState([]);
  const [cdpIdOutOfRange, setCdpIdOutOfRange] = useState(false)
  const queue = useRef(null);
  const last_pushed = useRef(-1);

  useEffect(() => {
    queue.current = async.queue(fetch_position, 5);
    return () => queue.current.kill();
  }, [])
  function getId(rough, relative) {
    if (relative >= 2 * rough + 2) {
      return relative;
    }
  
    const p = parseInt(rough);
    if(cdpIdOutOfRange)
    {
        return p - relative
    }
    return (relative % 2 === 0) ? (p - relative / 2) : (p + (relative + 1) / 2);
  }
  
  function sortCriterium(a, b) {
    return a.id - b.id;
  }
  async function fetch_position(data) {
    const currentPositionData = await fetchData(data.id)

    if(currentPositionData.urn == '0x0000000000000000000000000000000000000000')
            setCdpIdOutOfRange(true)

    if (hexToAsciiStr(currentPositionData.ilk).trim() != selectedToken) {
    const new_pushed = last_pushed.current = last_pushed.current + 1;
    queue.current.push({ id: getId(data.cdpId, new_pushed), relative: new_pushed, cdpId: data.cdpId  });
    return;
  }
  const result =  { id: data.id, collateral: weiToEthString(currentPositionData.collateral), amount: 1, debt: weiToEthString(currentPositionData.debtWithInterest), relative: data.relative };
  setPositions(e => {
    if (e.length >= POS_N)
    {
        setCdpIdOutOfRange(false)
      return e;
    }
      if (e.length == 0)
      return [{ ...result, first: true }];

    const arr = [...e, result];

    if (e.length == POS_N - 1)
      arr.sort(sortCriterium);

    return arr;
  })
}
  const fetchData = async (id) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [Contract.network]
        });
  
        const web3 = new Web3(window.ethereum);
  
        const contract = new web3.eth.Contract(Contract.abi, Contract.address);
  
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
    return asciiStr.replace(/[^\x20-\x7E]/g, '').trim(); 
  }
  

  function weiToEthString(weiValue) {
    const WEI_PER_ETH = BigInt(1e18);
    const ethValue = Number(weiValue) / Number(WEI_PER_ETH);
    return ethValue.toFixed(2);
  }
  function weiToDebtString(weiValue) {
    const WEI_PER_ETH = BigInt(1e27);
    const ethValue = Number(weiValue) / Number(WEI_PER_ETH);
    return ethValue.toFixed(5);
  }

  async function getLastExistingCpId(cpId) {
    let low = 1; 
    let high = cpId; 
  
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const data = await fetchData(mid);
  
      if (data.urn !== '0x0000000000000000000000000000000000000000') {
     
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  
    return high > 0 ? high : 0;
  }
  return (
    <div className='cdp-div'>
        <div className='cdp-div-outer'></div>
        <div className='cdp-div-center'>
            <div className='cdp-div-center-top'>
            <div className="form-control">
  <select
    className="input input-alt" // Use both 'input' and 'input-alt' classes for styling
    value={selectedToken}
    onChange={e => setSelectedToken(e.target.value)}
  >
    {tokens.map(e => <option key={e} value={e} style={{color:'white'}}>{e}</option>)}
  </select>
  <div className="input-border input-border-alt"></div> {/* This div is for the animated border */}
</div>
            <CdpSearchInput roughCdpId={roughCdpId} setRoughCdpId={setRoughCdpId}  />

            </div>
      
      <button onClick={async () => {
        setPositions(_ => []);
        if (queue.current) {
            queue.current.kill(); // This clears the queue
        }
        queue.current = async.queue(fetch_position, 5); // Re-initialize the queue
    
        const id = await fetchData(roughCdpId)

        var lastCdpId = roughCdpId;
            if (id.urn == '0x0000000000000000000000000000000000000000') {
                setCdpIdOutOfRange(true)
                lastCdpId = await getLastExistingCpId(roughCdpId);
            }

            for (let i = 0; i < POS_N; i++) {
                last_pushed.current = i;
                queue.current.push({ id: getId(lastCdpId, i), relative: i, cdpId: lastCdpId });
            }

      }}>Load positions</button>

<div className="table-container">
  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Collateral</th>
        <th>Debt</th>
      </tr>
    </thead>
    <tbody>
      {positions.map(e => (
        <tr key={e.id}>
          <td>{e.id}</td>
          <td>{e.collateral}</td>
          <td>{e.debt}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        </div>
        <div className='cdp-div-outer'></div>

    </div>
  );
}

export default CDP_Search;
/* global BigInt */
