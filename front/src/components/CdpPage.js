import CdpInfo from "./CdpInfo";
import Web3 from 'web3';
import React, { useState } from 'react';

function CdpPage({ cdp, isMobileNow, mobile, setOpenCDP }) {
    const [signature, setSignature] = useState('');

    async function signMessage() {
        if (window.ethereum) {
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
      
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
      
            if (accounts.length === 0) {
              console.error("Nije pronađen nijedan nalog.");
              return;
            }
      
            const message = "Ovo je moj CDP";

            const from = accounts[0];
            if (!from) {
              throw new Error("Adresa naloga nije pronađena.");
            }
      
            const signature = await web3.eth.personal.sign(message, from, ''); 
      
            return signature;
          } catch (error) {
            console.error("Greška prilikom potpisivanja poruke:", error);
          }
        } else {
          console.error("MetaMask nije detektovan.");
        }
      }
      
      const handleSignMessage = async () => {
        const signedMessage = await signMessage();
        setSignature(signedMessage);
      };
    return (
        <div style={{ display: (mobile && !isMobileNow) ? "none" : "flex", height: (mobile && !cdp) ? 0 : "100%", flexDirection: "column", width: mobile ? "100%" : "auto", position: mobile ? "absolute" : "static", left: 0, zIndex: 100, backgroundColor: "#101010", color: "white", overflow: mobile ? 'auto' : 'none', marginLeft: (mobile && !cdp) ? "100vw" : 0, transition: mobile ? "margin-left 0.2s" : "" }}>
            {mobile ? <img height={24} width={24} src="/close.png" onClick={() => { setOpenCDP(null) }} style={{ alignSelf: "flex-end", margin: 5, cursor: "pointer" }}></img> : null}
            <h1 style={{ textAlign: "center", fontFamily: "monospace", fontSize: "2.5em", marginTop: "2vh", marginBottom: "2vh" }}>Position ID: {cdp?.id}</h1>
            <CdpInfo cdp={cdp || {}}></CdpInfo>
            <button 
        onClick={handleSignMessage}
        style={{
            backgroundColor: "rgb(178, 245, 101)", 
            color: "#101010", 
            border: "none",
            borderRadius: "5px",
            padding: "10px 20px",
            fontSize: "1em",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0, 255, 0, 0.5)",
            margin: "10px 0",
            fontFamily: "monospace",
            transition: "background-color 0.3s, color 0.3s", 
        }}
    >
        Sign message
    </button>    {signature && (
        <div style={{
            backgroundColor: "#202020",
            color: "rgb(178, 245, 101)",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            boxShadow: "0 0 10px rgba(0, 255, 0, 0.5)"
        }}>
            <h3 style={{ textAlign: "center", fontFamily: "monospace" }}>Signature:</h3>
            <p style={{ wordWrap: "break-word", fontFamily: "monospace" }}>{signature}</p>
        </div>
    )}
        </div>
    )
}

export default CdpPage;