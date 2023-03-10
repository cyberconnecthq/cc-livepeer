const APP_NAME = 'CyberTube'
const APP_DESCRIPTION = 'A decentralized video sharing platform'
const APP_VERSION = '0.0.1'
const IPFS_GATEWAY = 'https://cyberconnect.mypinata.cloud/ipfs/';
const IMAGEKIT_URL = 'https://ik.imagekit.io/' + process.env.NEXT_PUBLIC_IMAGEKIT_ID + '/';
const LIVEPEER_KEY = process.env.NEXT_PUBLIC_LIVEPEER_KEY;
const GRAPHQL_URI = "https://api.cyberconnect.dev/testnet/"
const ESSENCE_APP_ID = "cyberconnect-livepeer";
const DOMAIN = "cc-livepeer.com"; // Domain name
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'CC_REFRESH_TOKEN'
const WALLET_KEY = 'address'
export {
  APP_NAME,
  APP_DESCRIPTION,
  APP_VERSION,
  IPFS_GATEWAY,
  IMAGEKIT_URL,
  GRAPHQL_URI,
  LIVEPEER_KEY,
  ESSENCE_APP_ID,
  DOMAIN,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  WALLET_KEY
}
