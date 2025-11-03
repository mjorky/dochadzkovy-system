import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
    ssrMode: typeof window === 'undefined',
  });
}

export default createApolloClient;
