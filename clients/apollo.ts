// import { ApolloClient as Apollo, InMemoryCache } from "@apollo/client";
import { GRAPHQL_URI } from '../constants';
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("accessToken");
  return {
    headers: {
      ...headers,
      Authorization: token ? `bearer ${token}` : "",
      "X-API-KEY": process.env.NEXT_PUBLIC_CYBERCONNECT_API_KEY,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
