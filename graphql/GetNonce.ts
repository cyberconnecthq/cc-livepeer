import { gql } from "@apollo/client";

export const GET_NONCE = gql`
    mutation getNonce($domain: String!, $address: AddressEVM!) {
    loginGetMessage(input: { domain: $domain, address: $address }) {
      message
    }
  }
`;

