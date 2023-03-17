import { gql } from "@apollo/client";

// This is the mutation that will be used to get the nonce from the CyberConnect generated message
export const GET_NONCE = gql`
    mutation getNonce($domain: String!, $address: AddressEVM!) {
    loginGetMessage(input: { domain: $domain, address: $address }) {
      message
    }
  }
`;

