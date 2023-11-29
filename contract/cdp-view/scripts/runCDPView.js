const hre = require("hardhat");

const getDebt = (debt) => Number(debt) / Number(BigInt(1e18));

async function main() {
    const CDPView = await hre.ethers.getContractFactory("CDPView");
    const cdpView = await CDPView.deploy();
    await cdpView.waitForDeployment();

    console.log("CDP View deployed to:", cdpView.target);

    try {
        const cdpInfo = await cdpView.getCdpInfo(13153);
        console.log("Debt with interest:", getDebt(cdpInfo.debtWithInterest));
    } catch (error) {
        console.error("Error fetching CDP Info:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
