import { useEffect, useState } from 'react';
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
  web3,
  contractABI,
  contractAddress
} from './util/interact.js';
import './css/degen.webflow.css';
import './css/normalize.css';
import './css/webflow.css';

const Minter = (props) => {
  const [walletAddress, setWallet] = useState('');
  const [status, setStatus] = useState('');
  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(async () => {
    const numMints = await new web3.eth.Contract(contractABI, contractAddress).methods.totalSupply().call()
    setTotalSupply(numMints);

    const { address, status } = await getCurrentWalletConnected();

    setWallet(address);
    setStatus(status);

    addWalletListener();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus('');
        } else {
          setWallet('');
          setStatus('🦊 Connect to Metamask using the top right button.');
        }
      });
    } else {
      setStatus(
        <p>
          {' '}
          🦊{' '}
          <a>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onMintPressed = async () => {
    const { success, status } = await mintNFT();
    setStatus(status);
  };
  return (
    <div className="body">
      <div className="navbar">
        <a className="button w-button" onClick={connectWalletPressed}>
          {walletAddress.length > 0 ? (
            'Connected: ' +
            String(walletAddress).substring(0, 6) +
            '...' +
            String(walletAddress).substring(38)
          ) : (
            <span>Connect Wallet</span>
          )}
        </a>
      </div>
      <div class="section wf-section">
        <h1 class="heading">DEGEN LABS MINT PASS</h1>
        <img src="https://gateway.pinata.cloud/ipfs/QmZxk3tqqru4GK9mjrjHmZh6FGiBhnhfe9gSao5Ghr5Tha" alt="Degen Mint Pass"></img>
        <button className="button" onClick={onMintPressed}>
          Mint NFT
        </button>
        <div class="div-block">
          <div class="text-block">
            {totalSupply} / 333
            <br></br>
            Mint Price: 0.05 ETH
<br></br>
<br></br>
          </div>
        </div>
      </div>
      <div class="text-block">
        <a> 
          { status }
          <br></br>
        </a>
      </div>
      <div class="footer">
        <div class="text-block-2">
        </div>
      </div>
    </div>
  );
};

export default Minter;
