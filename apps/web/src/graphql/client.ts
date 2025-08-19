import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: createHttpLink({ uri: "/graphql", credentials: "include" }),
  cache: new InMemoryCache()
});