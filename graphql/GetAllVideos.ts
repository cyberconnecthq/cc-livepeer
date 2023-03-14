import { gql } from "@apollo/client";

export const GET_ALL_ESSENCE_VIDEOS = gql`
query essencesBy($appID: String, $me: AddressEVM!) {
  essencesBy(appID: $appID) {
    edges {
      node {
        essenceID
        tokenURI
        name
        createdBy {
          avatar
          handle
          profileID
          metadata
          owner {
            address
          }
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
        collectedBy(first:100) {
          totalCount
        }
      }
    }
  }
}`;
