import { gql } from "@apollo/client";

export const PRIMARY_PROFILE_ESSENCES = gql`
  query PrimaryProfileEssences($address: AddressEVM!, $appId: String!) {
  address(address: $address) {
    wallet {
      primaryProfile {
        essences(first: 100, appID: $appId) {
          totalCount
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
              }
              metadata {
                metadata_id
                version
                app_id
                lang
                issue_date
                content
                media {
                  alt_tag
                  media_url
                  media_type
                }
                tags
                image
                image_data
                name
                description
                animation_url
                attributes {
                  display_type
                  value
                  trait_type
                }
                external_url
              }
              collectMw {
                contractAddress
                type
              }
              isCollectedByMe(me:$address) 
            }
          }
        }
      }
    }
  }
}
`;
