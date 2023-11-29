const { ethers } = require('ethers');

const getDebt = (debt) => Number(debt) / Number(BigInt(1e18));

async function main() {
    const provider = new ethers.JsonRpcProvider("https://rpc.tenderly.co/fork/a4579a6b-91ec-4ff0-b39d-3ff06733d685");

    const contractAddress = '0x8b64968f69e669facc86fa3484fd946f1bbe7c91';
          const contractABI = [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "_getProxyOwner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "userAddr",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "_cdpId",
                  "type": "uint256"
                }
              ],
              "name": "getCdpInfo",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "urn",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "userAddr",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "ilk",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint256",
                  "name": "collateral",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "debt",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "debtWithInterest",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    try {
        const cdpId = 13154;
        const cdpInfo = await contract.getCdpInfo(cdpId);
        console.log("Debt with interest:", cdpInfo.debtWithInterest);
    } catch (error) {
        console.error("Error calling the contract:", error);
    }
}

main().catch((error) => {
    console.error("Error running the script:", error);
});
