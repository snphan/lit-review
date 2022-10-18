import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { useState, useEffect } from 'react';
import { Article, ArticleData } from './components/Article';
import Table from 'react-bootstrap/Table';
import { EditModal } from './components/EditModal'
import { TagData } from './components/Tag';

function App() {
  const client = new ApolloClient({
    uri: 'http://localhost:3000/graphql',
    cache: new InMemoryCache({
      addTypename: false
    }),
  });


  const [show, setShow] = useState(false);

  const [data, setData] = useState<ArticleData[]>([]);
  const [editData, setEditData] = useState<ArticleData | Object>({});
  const [allTags, setAllTags] = useState<TagData[]>([]);

  const getData = () => {
    client.query({
      query: gql`
        query getArticles{
          articles {
            id
            firstAuthor
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
    }).then((result) => {
      console.log(result);
      setData(result.data?.articles ? result.data.articles : []);
    }
    );
  }

  const getAllTags = () => {
    client.query({
      query: gql`
        query getTags{
          tags {
            id
            name
          }
        }
      `
    }).then((result) => {
      setAllTags(result.data?.tags ? result.data.tags : []);
    }
    );
  }


  useEffect(() => {
    getData();
    getAllTags();
  }, []);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const articleItems = data.map((article) =>
    <Article
      key={article.id}
      article={article}
      setEditData={setEditData}
      handleShow={handleShow}
    />
  );
  return (
    <div className="">
      <h1>Hi World!</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th style={{ width: "5%" }}>#</th>
            <th style={{ width: "10%" }}>Title</th>
            <th style={{ width: "5%" }}>Author</th>
            <th style={{ width: "5%" }}>Year</th>
            <th style={{ width: "70%" }}>Summary</th>
            <th style={{ width: "5%" }}>Tags</th>
          </tr>
        </thead>
        <tbody>
          {articleItems}
        </tbody>
      </Table>
      <EditModal
        editData={editData}
        handleClose={handleClose}
        show={show}
        allTags={allTags}
        setEditData={setEditData}
      />

    </div>
  );
}

export default App;
