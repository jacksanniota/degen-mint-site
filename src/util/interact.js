import { pinJSONToIPFS } from "./pinata.js";
import { BLOCK_EXPLORER, MINT_FEE } from "./constants.js";
require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
export const contractABI = require("../contracts/degen-abi.json");
export const contractAddress = "0x6883BA700c4C8fb098b851095fC4e1Ead0704FA2";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
export const web3 = createAlchemyWeb3(alchemyKey);

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "👆🏽 Mint our NFT and join the luxury phygital movement! 👆🏽",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Mint our NFT and join the luxury phygital movement! 👆🏽",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button in your browser.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const mintNFT = async () => {

  if (!window.ethereum) {
    return {
      success: false,
      status: "😥 Ethereum wallet not connected "
    }
  }

  const tokenId = await new web3.eth.Contract(contractABI, contractAddress).methods.totalSupply().call()
    //make metadata
  const metadata = new Object();
  metadata.name = "Degen Mint Pass #" + tokenId;
  metadata.image = "https://gateway.pinata.cloud/ipfs/QmZxk3tqqru4GK9mjrjHmZh6FGiBhnhfe9gSao5Ghr5Tha";
  metadata.description = 
  `Degen Labs is pushing the boudaries of Luxury Phygital Style. Coming to a wallet near you`;

  const pinataResponse = await pinJSONToIPFS(metadata);
  console.log("test")
  console.log(pinataResponse)
  if (!pinataResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your tokenURI.",
    };
  }
  const tokenURI = pinataResponse.pinataUrl;

  window.contract = await new web3.eth.Contract(contractABI, contractAddress);

  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    value: parseInt(web3.utils.toWei(`${MINT_FEE}`, 'ether')).toString(16),
    data: window.contract.methods
      .safeMint(window.ethereum.selectedAddress, tokenURI)
      .encodeABI(),
  };

  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        `✅ Check out your transaction on Etherscan: ${BLOCK_EXPLORER}` +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
};
