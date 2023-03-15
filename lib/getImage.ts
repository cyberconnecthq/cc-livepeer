import getIPFSLink from "./getIPFSLink";

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
