import { gql } from "@apollo/client";

export const GET_ALL_ESSENCE_VIDEOS = gql`
query essencesByFilter($appID: String, $me: AddressEVM!) {
  essenceByFilter(appID: $appID) {
    essenceID
    tokenURI
    name
    createdBy {
      avatar
      handle
      profileID
      metadata
    }
    metadata {
      metadata_id
      issue_date
      attributes {
        display_type
        value
        trait_type
      }
      animation_url
      lang
      tags
      content
      description
      media {
        alt_tag
        media_url
        media_type
      }
      image
      image_data
    }
    collectMw {
      contractAddress
      type
    }
    isCollectedByMe(me: $me)
  }
}`;

// export const GET_ALL_VIDEOS = gql`
//   query videos(
//     $first: Int
//     $skip: Int
//     $orderBy: Video_orderBy
//     $orderDirection: OrderDirection
//     $where: Video_filter
//   ) {
//     videos(
//       first: $first
//       skip: $skip
//       orderBy: $orderBy
//       orderDirection: $orderDirection
//       where: $where
//     ) {
//       id
//       hash
//       title
//       description
//       location
//       category
//       thumbnailHash
//       date
//       author
//       createdAt
//     }
//   }
// `;
