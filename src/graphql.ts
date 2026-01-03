import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone"
import _ from "lodash"
import { buildSchema } from 'graphql'
import { type RootResolver } from "@hono/graphql-server";

// Type definitions (Schema)
const typeDefs = `#graphql
  type Book {
    id: ID!
    title: String!
    author: String!
    year: Int!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
  }

  type Mutation {
    addBook(title: String!, author: String!, year: Int!): Book!
  }
`;

// Sample data
let books = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
  { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },
];

export const simpleSchema = buildSchema(typeDefs)
export const rootResolver: RootResolver = (c) => {
  return (
    {
      books: () => books,
      book: ({id}:{id:string}) => books.find((b) => b.id === id),
      addBook: ({ title, author, year }: {title:string, author:string, year:number}) => {
      const newBook = { id: String(books.length + 1), title, author, year };
      books.push(newBook);
      return newBook;
      },
    }
  )
}


// Resolvers
export const resolvers = {
  Query: {
    books: () => books,
    book: (_:any, { id }:{id:string}) => books.find(book => book.id === id),
  },
  Mutation: {
    addBook: (_: any, { title, author, year }: any) => {
      const newBook = {
        id: String(books.length + 1),
        title,
        author,
        year,
      };
      books.push(newBook);
      return newBook;
    },
  },
};


// Create Apollo Server instance
export const simpleGQLServer = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server
export async function startGQLServer() {
  const { url } = await startStandaloneServer(simpleGQLServer, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at ${url}`);
}

// startGQLServer();