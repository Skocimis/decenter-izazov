import "./cdpView.css";
import { prettyFormat, formatBigNumber, formatOwner } from "../util/NumberFormat"
import { getTokenRatio, getTokenPriceSync } from "../util/Tokens.js"

function CdpInfo({ cdp }) {
    const collateral = parseFloat(cdp?.collateral || 0)
    const debt = parseFloat(cdp?.debt || 0)
    const token = cdp.token
    const owner = cdp.owner

    const collateral_price = getTokenPriceSync(token);
    const collateral_value = collateral * collateral_price
    const ratio = ((debt > 0) ? (collateral_value / debt) : 0);
    const liquidation_ratio = getTokenRatio(token);
    const liquidation_price = (ratio && liquidation_ratio) ? collateral_price / (ratio / liquidation_ratio) : 0;
    const max_debt = collateral_value / liquidation_ratio;
    const max_borrow = max_debt - debt;
    const min_collateral = debt * liquidation_ratio / collateral_price
    const max_withdraw = collateral - min_collateral;
    const max_withdraw_usd = max_withdraw * collateral_price;

    const Stat = ({ name, value, valueTooltip, currency, info, infoTooltip, tooltip }) =>
        <div style={{ display: "flex", justifyContent: 'center', flexShrink: 1, flexGrow: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: 'flex-start', lineHeight: 1.1 }}>
                <div style={{ color: "rgb(178, 245, 101)", display: "flex", flexDirection: "row", alignItems: "center", fontSize: "1.1em", fontWeight: "bold", cursor: tooltip ? "help" : "default" }} title={tooltip}>{name} {tooltip ? <img height={14} width={14} style={{ marginLeft: 5 }} src="/info.png"></img> : ""}</div>
                <div title={valueTooltip}>
                    <span style={{ fontSize: "2.2em" }}>{value}</span> <span style={{ color: "lightgray" }}>{currency}</span>
                </div>
                <div title={infoTooltip || ""} style={{ color: "lightgray", alignSelf: "center", fontSize: "1em" }}>{info}</div>
            </div>
        </div>


    return (
        cdp && <div style={{ width: "90%", margin: "auto", fontFamily: "monospace", flexGrow: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: "2vh" }}>
                <span style={{ color: "lightgray" }}>Owner: </span> <a target="_blank" href={"https://etherscan.io/txs?a=" + owner + "&p=3"} style={{ fontSize: "1.4em" }} title={owner}>{formatOwner(owner)}</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: "1.5vh", width: "fit-content", margin: "auto", alignItems: "flex-start" }}>
                <Stat name={"Debt"} value={formatBigNumber(debt, 1)} valueTooltip={prettyFormat(debt) + " DAI"} currency={"DAI"} info={"~" + formatBigNumber(debt, 2) + " $"} infoTooltip={""}></Stat>
                <Stat name={"Collateral"} value={formatBigNumber(collateral, 1)} valueTooltip={prettyFormat(collateral) + " " + token} currency={token} info={"~" + formatBigNumber(collateral_value, 2) + " $"} infoTooltip={""}></Stat>
                <Stat name={"Ratio"} value={prettyFormat(ratio * 100, 2)} valueTooltip={prettyFormat(100 * ratio) + " %"} currency={"%"} info={"Min " + Math.round(liquidation_ratio * 100).toFixed(0) + "%"} infoTooltip={""}></Stat>
                <Stat name={"Current price"} value={prettyFormat(collateral_price, 2)} valueTooltip={prettyFormat(collateral_price) + " $"} currency={"$"} info={"Liq. price: " + prettyFormat(liquidation_price, 2) + " $"} infoTooltip={prettyFormat(liquidation_price) + " $"}></Stat>
                <Stat name={"Max borrow"} value={formatBigNumber(max_borrow, 1)} valueTooltip={prettyFormat(max_borrow) + " DAI"} currency={"DAI"} info={"~" + formatBigNumber(max_borrow, 2) + " $"} infoTooltip={prettyFormat(max_borrow) + " $"} tooltip={"Maximum amount of DAI you can borrow without triggering liquidation"}></Stat>
                <Stat name={"Max withdraw"} value={formatBigNumber(max_withdraw, 1)} valueTooltip={prettyFormat(max_withdraw) + " " + token} currency={token} info={"~" + formatBigNumber(max_withdraw_usd, 2) + " $"} infoTooltip={prettyFormat(max_withdraw_usd) + " $"} tooltip={"Maximum amount of collateral you can withdraw without triggering liquidation"}></Stat>
            </div>
        </div>
    )
}

export default CdpInfo;