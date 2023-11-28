const { ethers } = require('ethers');

const getDebt = (debt) => Number(debt) / Number(BigInt(1e18));

async function main() {
    const provider = new ethers.JsonRpcProvider("https://rpc.vnet.tenderly.co/devnet/my-first-devnet/14fde028-8c3e-4511-a962-7b792021562e");

    const contractAddress = '0x19b3288bbae81def435800e1cefcd031d0c147b7';
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
        const cdpId = 29886;
        const cdpInfo = await contract.getCdpInfo(cdpId);
        console.log("Debt with interest:", getDebt(cdpInfo.debtWithInterest));
    } catch (error) {
        console.error("Error calling the contract:", error);
    }
}

main().catch((error) => {
    console.error("Error running the script:", error);
});
