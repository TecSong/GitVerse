#! /usr/bin/env zx

import {$} from "zx";
import { NFTStorage, File, Blob } from 'nft.storage'
import { ethers } from 'ethers';
import process from 'process';
import {abi} from "./compile";

let infuraProvider = new ethers.providers.InfuraProvider('goerli');
const blocknum = await infuraProvider.getBlockNumber()

console.log(blocknum)
const tag_name = (await $`git tag|tail -1|xargs echo -n`).stdout; //获取到最后一个标签名,没有标签名抛出错误
if (!tag_name){
  console.log("Your project have no tags yet.")
  process.exit();
}
// const files = (await $`git ls-files -- . ':!:node_modules/*'`).stdout; //获取当前标签下所有文件的列表
const repo_path = (await $`git rev-parse --show-toplevel`).stdout;
const repo_name = await $`basename ${repo_path}|xargs echo -n`
const output_file_name = `${repo_name}-${tag_name}.tar.gz`

await $`git archive ${tag_name} --format=tar.gz --output ${output_file_name}`

let f = fs.readFileSync(output_file_name);
var someData = new Blob(f);

const NFT_STORAGE_TOKEN
  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDIxMmZkRTRBOEFhY0RCZWE3RWFkRGNFMGU1NkI0NTFDQzdlNTM2QjYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NzM4MTgzMDU2MywibmFtZSI6Ik5UQiJ9.Yj9ie65LXh6t6QECtGzKViX-AeTiAHnVoYybY3qfqNk'
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

async function checkExist(file) {
  try {
    const {cid} = await NFTStorage.encodeBlob(file)
    const isExist = await client.check(cid)
    if (isExist) {
      return {
        cid: `ipfs://${cid}`,
      }
    }
  } catch (err) {
    // nothing todo, as the file just do not store yet
    return false
  }
}


const storeBlob = async(file) => {
  let res = await checkExist(file)
  if (!res){
      const cid = await client.storeBlob(file)
      return `ipfs://${cid}`
  }
}

const metadataCID =  storeBlob(someData);
if (!metadataCID){
  console.log("store file error!")
  process.exit();
}

/* 合约交互 */

let infuraProvider = new ethers.providers.InfuraProvider('mumbai');
// let infuraProvider = new ethers.providers.InfuraProvider('goerli');

const contractAddress = '0xc61Ac59345150b0728ab3266766528C6e4aCbB75';
const account_from = {
  privateKey: '',
};
let wallet = new ethers.Wallet(account_from.privateKey, infuraProvider);
const gvNFT = new ethers.Contract(contractAddress, abi, wallet);

const basicPrice = 1000000;
const inviteCommission = 1;
const params = {}
await contractWriter.addBook(_basicPrice, _inviteCommission, metadataCID, { value })
const addpkg = async () => {
  const createReceipt = await gvNFT.addPkg(basicPrice, inviteCommission, metadataCID, params);
  await createReceipt.wait();

  console.log(`Tx successful with hash: ${createReceipt.hash}`);
};

addpkg();