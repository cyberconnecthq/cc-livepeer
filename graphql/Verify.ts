import { gql } from "@apollo/client";

export const VERIFY = gql`
  mutation loginVerify($domain: String!, $address: AddressEVM!, $signature: String!, $isEIP1271: Boolean) {
    loginVerify(input: { domain: $domain, address: $address, signature: $signature, isEIP1271: $isEIP1271 }) {
      accessToken
      refreshToken
    }
  }
`;

