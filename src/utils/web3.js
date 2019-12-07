import Web3 from 'web3';
import { address, ABI } from '@/constant/contractWrapper';
import { ABI as secretSantaABI } from '@/constant/secretSanta';
/*
 * 1. Check for injected web3 (mist/metamask)
 * 2. If metamask/mist create a new web3 instance and pass on result
 * 3. Get networkId - Now we can check the user is connected to the right network to use our dApp
 * 4. Get user account from metamask
 * 5. Get user balance
 */

window.ethereum.enable();
const web3 = new Web3(window.web3.currentProvider);

export const getWeb3 = new Promise(function(resolve, reject) {
  // Check for injected web3 (mist/metamask)
  var web3js = window.web3;
  if (typeof web3js !== 'undefined') {
    var web3 = new Web3(web3js.currentProvider);

    resolve({
      web3() {
        return web3;
      },
    });
  } else {
    reject(new Error('Unable to connect to Metamask'));
  }
}).then(result => {
  return new Promise(async function(resolve, reject) {
    const account = await window.ethereum.enable();
    result = Object.assign({}, result, { account: account[0] });

    resolve(result);
  });
});

export const getContract = from =>
  new Promise(resolve =>
    resolve(new web3.eth.Contract(ABI, address)),
  );

export const getSantaContract = address =>
  new Promise(resolve =>
    resolve(new web3.eth.Contract(secretSantaABI, address)),
  );
