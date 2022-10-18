import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { useState } from 'react';

function App() {
  const client = new ApolloClient({
    uri: 'http://localhost:3000/graphql',
    cache: new InMemoryCache(),
  });

  const [data, setData] = useState<any>({});

  const getData = () => {
    client.query({
      query: gql`
        query getArticles{
          articles {
            id
            title
            year
            summary
            tags {
              id
              name
            }
          }
        }
      `
    }).then((result) => setData(result));
  }


  return (
    <div className="">
      <h1>Hi World!</h1>
      <button onClick={() => getData()}>Get Data</button>
      <div><pre>{JSON.stringify(data, null, 2)}</pre></div>
    </div>
  );
}

export default App;
