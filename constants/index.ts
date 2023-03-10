const APP_NAME = 'OurTube'
const APP_DESCRIPTION = 'A decentralized video sharing platform'
const APP_VERSION = '0.0.1'
const CONTRACT_ADDRESS = '0xa0b98Bf623Ac0E88eD2418b0427ADA7FE94cad8d';
const IPFS_GATEWAY = 'https://cyberconnect.mypinata.cloud/ipfs/';
const IMAGEKIT_URL = 'https://ik.imagekit.io/' + process.env.NEXT_PUBLIC_IMAGEKIT_ID + '/';
const LIVEPEER_KEY = process.env.NEXT_PUBLIC_LIVEPEER_KEY;
const WEB3_STORAGE_URL = 'https://api.web3.storage/upload';
const WEB3_STORAGE_KEY = process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY;
const GRAPHQL_URI = "https://api.cyberconnect.dev/testnet/"
const ESSENCE_APP_ID = "cyberconnect-livepeer";
const DOMAIN = "test.com"; // Domain name
const ACCESS_TOKEN_KEY = 'CC_ACCESS_TOKEN'
const REFRESH_TOKEN_KEY = 'CC_REFRESH_TOKEN'
const WALLET_KEY = 'CC_WALLET'
export {
  APP_NAME,
  APP_DESCRIPTION,
  APP_VERSION,
  CONTRACT_ADDRESS,
  IPFS_GATEWAY,
  IMAGEKIT_URL,
  WEB3_STORAGE_URL,
  GRAPHQL_URI,
  LIVEPEER_KEY,
  WEB3_STORAGE_KEY,
  ESSENCE_APP_ID,
  DOMAIN,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  WALLET_KEY
}
