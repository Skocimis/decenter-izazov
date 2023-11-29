import CdpInfo from "./CdpInfo";

function CdpPage({ cdp, isMobileNow, mobile, setOpenCDP }) {
    return (
        <div style={{ display: (mobile && !isMobileNow) ? "none" : "flex", height: (mobile && !cdp) ? 0 : "100%", flexDirection: "column", width: mobile ? "100%" : "auto", position: mobile ? "absolute" : "static", left: 0, zIndex: 100, backgroundColor: "#101010", color: "white", overflow: mobile ? 'auto' : 'none', marginLeft: (mobile && !cdp) ? "100vw" : 0, transition: mobile ? "margin-left 0.2s" : "" }}>
            {mobile ? <img height={24} width={24} src="/close.png" onClick={() => { setOpenCDP(null) }} style={{ alignSelf: "flex-end", margin: 5, cursor: "pointer" }}></img> : null}
            <h1 style={{ textAlign: "center", fontFamily: "monospace", fontSize: "2.5em", marginTop: "2vh", marginBottom: "2vh" }}>Position ID: {cdp?.id}</h1>
            <CdpInfo cdp={cdp || {}}></CdpInfo>
        </div>
    )
}

export default CdpPage;