import { useEffect, useRef, useState } from "react";
import CdpPage from "./CdpPage";

function CdpDrawers({ cdp }) {
    const [frontDrawer, setFrontDrawer] = useState(<Drawer cdp={cdp}></Drawer>);
    const [backDrawer, setBackDrawer] = useState(null);
    const [hidden, setHidden] = useState(true);
    const previousCdp = useRef(null);

    useEffect(() => {
        if (previousCdp.current == null && cdp != null) {
            setFrontDrawer(<Drawer cdp={cdp}></Drawer>)
            setBackDrawer(null);
            setHidden(false);
            previousCdp.current = cdp;
        }
        else if (previousCdp.current != null && cdp == null) {
            setFrontDrawer(<Drawer cdp={previousCdp.current}></Drawer>)
            setBackDrawer(null);
            setHidden(true);
            setTimeout(() => {
                previousCdp.current = null;
                setFrontDrawer(null)
            }, 300)
        }
        else {
            setBackDrawer(<Drawer cdp={previousCdp.current} back={false} />);
            const pcpc = JSON.parse(JSON.stringify(previousCdp.current));
            setFrontDrawer(<OpeningDrawer cdp={cdp} back={true}></OpeningDrawer>)
            setTimeout(() => {
                setBackDrawer(<Drawer cdp={pcpc} closing={true} back={true}></Drawer>);
            }, 100)
            previousCdp.current = cdp;
        }
    }, [cdp])


    function OpeningDrawer({ cdp }) {
        const [marginRight, setMarginRight] = useState("-100%");
        useEffect(() => {
            const timeout = setTimeout(() => {
                setMarginRight(0);
            }, 100);
            return () => { clearTimeout(timeout) }
        }, [cdp])
        return <div style={{ zIndex: 2, position: "absolute", top: 0, right: marginRight, color: "white", width: "100%", marginRight: marginRight, backgroundColor: "#101010", transition: "right 0.4s", height: "100%",  padding: "2%", border: "3px solid rgb(178, 245, 101)" }}>
            <CdpPage cdp={cdp}></CdpPage>
        </div>
    }
    function Drawer({ cdp, closing, back }) {
        const { id, collateral, debt, token } = cdp || {};
        const marginRight = closing ? "-104%" : "0";

        if (!id) return null;

        return (
            <div style={{ zIndex: back ? 1 : 2, position: "absolute", top: 0, right: marginRight, color: "white", width: "100%", backgroundColor: "#101010", transition: "right 0.4s", height: "100%",  padding: "2%", border: "3px solid rgb(178, 245, 101)" }}>
                <CdpPage cdp={cdp}></CdpPage>
            </div>
        );
    }


    return (
        <div style={{ display: (cdp || previousCdp.current) ? "flex" : "none", position: "relative", width: "40%", minWidth: 300, maxWidth: 400, marginRight: hidden ? "-43%" : 0, height: "90%", minHeight: "550px", transition: "margin-right 0.4s" }}>
            {backDrawer}
            {frontDrawer}
        </div>
    )
}

export default CdpDrawers