const hre = require("hardhat");
const fs = require('fs');

async function main() {
    const CDPView = await hre.ethers.getContractFactory("CDPView");
    const cdpView = await CDPView.deploy();
    await cdpView.waitForDeployment();

    console.log("CDP View deployed to:", cdpView.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
