import { IPFS_GATEWAY } from "../constants";

/**
 *
 * @param hash - IPFS hash
 * @returns IPFS link
 */
const getIPFSLink = (hash: string): string => {
  const gateway = IPFS_GATEWAY;

  return `${gateway}${hash}`;
};


/**
 *
 * @param profile - Profile object
 * @returns avatar image url
 */

const getImage = (image: any): string => {
  // return imagekitURL(getIPFSLink(image), "thumbnail");
  return getIPFSLink(image);
};

export default getImage;
