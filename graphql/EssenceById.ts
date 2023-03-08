import { gql } from "@apollo/client";


export const ESSENCE_BY_ID = gql`query EssenceById($metadataId:String!) {
    essenceByFilter(metadataID:$metadataId) {
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
  }
  }`