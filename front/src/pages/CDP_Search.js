import { useEffect, useRef, useState } from 'react';
import async from 'async';
import Web3 from 'web3';
import './cdp.css';
import CdpSearchInput from '../components/CdpSearchInput';
import Contract from '../data/Contract.json';
import SearchLoader from '../components/SearchLoader';
import CancelButton from '../components/CancelButton';
import CdpDrawers from '../components/CdpDrawers';
import { formatBigNumber } from "../util/NumberFormat"
import CdpPage from '../components/CdpPage';
import { getTokenPrice, getTokens, getTokenPriceSync } from '../util/Tokens';

const tokens = getTokens();
const POS_N = 20;

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

function CDP_Search() {
  const [screenWidth, setScreenWidth] = useState(window.visualViewport ? window.visualViewport.width : window.innerWidth);
  const [openCDP, setOpenCDP] = useState(null);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [roughCdpId, setRoughCdpId] = useState();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    getTokenPrice(selectedToken);
  }, [selectedToken]);

  const stopSearchRef = useRef(0)
  const cdpIdOutOfRange = useRef(0);
  const queue = useRef(null);
  const last_pushed = useRef(-1);
  const handleResize = () => {
    if (window.visualViewport) {
      setScreenWidth(window.visualViewport.width);
    } else {
      setScreenWidth(window.innerWidth);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    queue.current = async.queue(fetch_position, 5);
    return () => {
      queue.current.kill()
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timer]);

  function getId(rough, relative) {
    if (relative >= 2 * rough + 2) {
      return relative;
    }

    const p = parseInt(rough);

    if (cdpIdOutOfRange.current === 1) {
      return p - relative;
    }

    if (cdpIdOutOfRange.current === 2) {
      return p + relative;
    }

    return (relative % 2 === 0) ? (p - relative / 2) : (p + (relative + 1) / 2);
  }

  function sortCriterium(a, b) {
    return a.id - b.id;
  }

  async function fetch_position(data) {
    if (stopSearchRef.current == 1)
      return
    if (data.id <= 0) cdpIdOutOfRange.current = 2;
    const currentPositionData = await fetchData(data.id);

    if (currentPositionData.urn === '0x0000000000000000000000000000000000000000' && data.id > 0) {
      cdpIdOutOfRange.current = 1;
    }

    if (hexToAsciiStr(currentPositionData.ilk).trim() !== data.curToken) {
      const new_pushed = last_pushed.current = last_pushed.current + 1;
      queue.current.push({ id: getId(data.cdpId, new_pushed), relative: new_pushed, cdpId: data.cdpId, curToken: data.curToken });
      return;
    }

    const owner = (currentPositionData.userAddr == "0x0000000000000000000000000000000000000000") ? currentPositionData.owner : currentPositionData.userAddr;
    const result = {
      id: data.id,
      collateral: Number(currentPositionData.collateral) / Number(1e18),
      amount: 1,
      debt: Number(currentPositionData.debtWithInterest) / Number(1e18),
      relative: data.relative,
      token: data.curToken,
      owner
    };

    setPositions(e => {
      if (e.length >= POS_N) {
        setLoading(false);
        cdpIdOutOfRange.current = 0;
        return e;
      }

      if (e.length === 0) {
        return [{ ...result, first: true }];
      }

      const arr = [...e, result];

      if (e.length === POS_N - 1) {
        arr.sort(sortCriterium);
        setLoading(false);
        cdpIdOutOfRange.current = 0;
      }

      return arr;
    });
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
        return data;
      } else {
        alert("Molimo Vas aktivirajte Metamask");
        console.error('Metamask nije detektovan');
      }
    } catch (error) {
      console.error('Error fetching CDP data:', error);
    }
  };

  const startSearch = async (curId, curToken) => {
    stopSearchRef.current = 0
    setLoading(true);
    setPositions([]);
    if (queue.current) {
      queue.current.kill();
    }
    queue.current = async.queue(fetch_position, 5);

    const id = await fetchData(curId);
    var lastCdpId = curId;

    if (id.urn === '0x0000000000000000000000000000000000000000') {
      cdpIdOutOfRange.current = 1;
      lastCdpId = await getLastExistingCpId(lastCdpId);
    }

    for (let i = 0; i < POS_N; i++) {
      last_pushed.current = i;
      queue.current.push({ id: getId(lastCdpId, i), relative: i, cdpId: lastCdpId, curToken: curToken });
    }
  };

  const handleInputChange = (value, curToken) => {
    if (parseFloat(value) <= 0) {
      alert('Must be greater than 0');
      return;
    }

    setRoughCdpId(value);
    cdpIdOutOfRange.current = 0;

    if (timer) clearTimeout(timer);

    if (!curToken) curToken = selectedToken;

    if (!value || value.length === 0) return;

    const newTimer = setTimeout(() => {
      startSearch(value, curToken);
    }, 500);

    setTimer(newTimer);
  };

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

  function stopSearch() {
    setLoading(false);
    cdpIdOutOfRange.current = 0;
    stopSearchRef.current = 1
    if (queue.current) {
      queue.current.kill();
    }
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  }


  return (
    <div className='cdp-div'>
      <div className='cdp-div-outer'></div>
      <div className='cdp-div-center'>
        <div className='cdp-div-center-top'>
          <div className="form-control">
            <select
              className="input input-alt"
              value={selectedToken}
              onChange={e => {
                setSelectedToken(e.target.value)
                handleInputChange(roughCdpId, e.target.value)
              }}
            >
              {tokens.map(e => <option key={e} value={e} style={{ color: 'white' }}>{e}</option>)}
            </select>
            <div className="input-border input-border-alt"></div>
          </div>
          <CdpSearchInput roughCdpId={roughCdpId} setRoughCdpId={setRoughCdpId} handleInputChange={handleInputChange} curToken={selectedToken} />
          {loading && <CancelButton onClick={stopSearch} />}
        </div>

        <div className="cdp-div-center-middle">
          {loading && <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginTop: "80px", padding: 30 }}>
            <SearchLoader found={positions} />
            <a style={{ marginTop: 30, fontFamily: "Inconsolata", fontSize: "1rem", color: "white" }}>{"Found " + positions.length + "/20 positions "}</a>
          </div>}
          {positions.length > 0 && <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  {(screenWidth > 330) && <th>Collateral</th>}
                  {(screenWidth > 930) && <th>Collateral($)</th>}
                  <th>Debt</th>
                  <th>Ratio</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(position => (
                  <tr onClick={() => {
                    setOpenCDP((position.id == openCDP?.id) ? null : position);
                  }} key={position.id} style={{ cursor: "pointer", backgroundColor: ((openCDP && openCDP.id) && position.id == openCDP.id) ? "black" : "" }}>
                    <td>{position.id}</td>
                    {(screenWidth > 330) && <td>{formatBigNumber(position.collateral, 2)} {selectedToken}</td>}
                    {(screenWidth > 930) && <td>{formatBigNumber(position.collateral * getTokenPriceSync(selectedToken), 1)}$</td>}
                    <td>{formatBigNumber(position.debt, 2)} DAI</td>
                    <td>{position.debt > 0 ? (position.collateral * getTokenPriceSync(selectedToken) / position.debt * 100).toFixed(0) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </div>
      </div>
      <br />
      <br />
      <div className='cdp-div-outer'>
        <br />
      </div>
      {(screenWidth > 768) ? <CdpDrawers cdp={openCDP}></CdpDrawers> : null}
      <CdpPage cdp={openCDP} isMobileNow={screenWidth <= 768} mobile={true} setOpenCDP={setOpenCDP}></CdpPage>
    </div>
  );
}

export default CDP_Search;

/* global BigInt */
