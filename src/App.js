import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { FaMoneyBillAlt } from "react-icons/fa";
import "./App.css";

const contractABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "BuyTicket",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "startDate", type: "uint256" },
    ],
    name: "CreateLottery",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "lotteryId", type: "uint256" }],
    name: "FinishLottery",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "m_commision",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "m_lotteries",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "startDate", type: "uint256" },
      { internalType: "uint256", name: "totalPrize", type: "uint256" },
      { internalType: "bool", name: "finalized", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "m_lotteryId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "m_owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "m_ticketPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "m_tickets",
    outputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "lotteryId", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const contractAddress = "0x66A33c7F54c3a9070114B65747Dc7d373F946f65";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI, signer);
let lotteryId = 0;
let contractOwnerAddress = 0;
// the user on the website is the signer
let signerAddress = 0;
let lotteries = [];
let ownerAuth = false;

async function createLottery(name) {
  // time in seconds
  let time = Math.floor(Date.now() / 1000);
  return await contract.CreateLottery(name, time);
}

async function buyTicket(id) {
  const options = { value: ethers.utils.parseEther("0.01") };
  await contract.BuyTicket(id, options);
}

async function chooseWinner(id) {
  await contract.FinishLottery(id);
}

async function getContractOwner() {
  contractOwnerAddress = await contract.m_owner();
}

async function getSignerAddress() {
  signerAddress = await signer.getAddress();
}

async function setLotteryId() {
  lotteryId = await contract.m_lotteryId();
}

function getRealLotteryId(id) {
  // currently we refer to the id of our lottery as the index in our array in this app.js file
  // in the contract, it is the index from their array, which might be bigger
  // ours contains only active lotteries
  // the contract contains all lotteries
  let totalNumberOfLotteries = lotteryId;
  let numberOfActiveLotteries = lotteries.length;
  let realId = totalNumberOfLotteries - numberOfActiveLotteries + id;
  return realId;
}

async function getActiveLotteries() {
  let maxLottery = (await contract.m_lotteryId()).toNumber();
  for (let i = 0; i < maxLottery; i++) {
    let lottery = await contract.m_lotteries(i);
    if (lottery.finalized == false) {
      lotteries.push(lottery);
    }
  }
}

function LotteryCards() {
  return lotteries.map((lottery, index) => (
    <LotteryCard key={index} id={index} />
  ));
}

function LotteryCard(props) {
  return (
    <div className="lottery-container">
      <h2 className="lottery-name lottery-text">{lotteries[props.id].name}</h2>
      <h2 className="lottery-money lottery-text">
        <FaMoneyBillAlt className="FaMoneyBillAlt" />
        {ethers.utils.formatEther(lotteries[props.id].totalPrize)} ETH
      </h2>
      <button
        className="btn buy-btn"
        onClick={() => buyTicket(getRealLotteryId(props.id))}
      >
        Buy ticket
      </button>
      {ownerAuth && (
        <button
          className="btn end-lottery-btn"
          onClick={() => chooseWinner(getRealLotteryId(props.id))}
        >
          End lottery
        </button>
      )}
    </div>
  );
}

function AdminPanel() {
  const [name, setName] = useState("");
  return (
    <div className="admin-container container">
      <h1 className="head-text">Admin panel</h1>
      <input
        type="text"
        className="lottery-name-input"
        placeholder="Lottery name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="btn" onClick={() => createLottery(name)}>
        Create a lottery
      </button>
    </div>
  );
}

class App extends React.Component {
  // this is what renders
  componentDidMount() {
    // before we render we do this
    this.setState({ loading: true });
    setLotteryId();
    getContractOwner().then(() => {
      getSignerAddress().then(() => {
        if (signerAddress == contractOwnerAddress) {
          ownerAuth = true;
        }
      });
    });
    getActiveLotteries().then(() => {
      // while loading is true we won't render
      this.setState({ loading: false });
    });
  }
  render() {
    return (
      <div className="App">
        <img
          className="icon"
          src={require("./lottery-balls.png")}
          alt="Lottery icon"
        ></img>
        {ownerAuth && <AdminPanel />}
        <div className="container">
          <h1 className="head-text">Lotteries</h1>
          <div className="lotteries-container">
            <LotteryCards />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
