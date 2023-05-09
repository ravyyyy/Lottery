import Web3 from 'web3';
import { useState, useEffect } from 'react';

const web3 = new Web3(window.ethereum);
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint256","name":"lotteryId","type":"uint256"}],"name":"BuyTicket","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"startDate","type":"uint256"}],"name":"CreateLottery","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"lotteryId","type":"uint256"}],"name":"FinishLottery","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"m_commision","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"m_lotteries","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"startDate","type":"uint256"},{"internalType":"uint256","name":"totalPrize","type":"uint256"},{"internalType":"bool","name":"finalized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"m_lotteryId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"m_owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"m_ticketPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"m_tickets","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"lotteryId","type":"uint256"}],"stateMutability":"view","type":"function"}];
const contractAddress = '0x66A33c7F54c3a9070114B65747Dc7d373F946f65';
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);

  async function createLottery(name, startDate, creatorAddress) {
    const accounts = await web3.eth.getAccounts();
    if (accounts[0] !== creatorAddress) {
      throw new Error('Unauthorized');
    }
    const result = await contractInstance.methods.CreateLottery(name, startDate).send({ from: accounts[0] });
    console.log(result);
  }
  
  async function buyTicket(lotteryId) {
    const accounts = await web3.eth.getAccounts();
    const ticketPrice = await contractInstance.methods.m_ticketPrice().call();
    await contractInstance.methods.BuyTicket(lotteryId).send({ from: accounts[0], value: ticketPrice });
  }

  function Main() {
    const [content, setContent] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [creatorAddress, setCreatorAddress] = useState(null);
    const [lotteryId, setLotteryId] = useState(null);
  
    async function getCreatorAddress() {
      const owner = await contractInstance.methods.m_owner().call();
      setCreatorAddress(owner);
    }

    function handleLotteryIdChange(event) {
        setLotteryId(event.target.value);
      }
  
    useEffect(() => {
      async function getContent() {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          const currentAddress = accounts[0];
          await getCreatorAddress();
          if (creatorAddress === currentAddress) {
            setAuthenticated(true);
          }
        }
        setContent(
          <div className='Main'>
            <header className='Main-header'>
              <p>Loterie</p>
              {authenticated && (
                <button onClick={() => createLottery('My Lottery', Date.now(), creatorAddress)}>Create Lottery</button>
              )}
              <button onClick={() => buyTicket(lotteryId)}>Buy Ticket</button>
            </header>
          </div>
        );
      }
      getContent();
    }, [authenticated]);
  
    return content;
  }
  

export default Main;