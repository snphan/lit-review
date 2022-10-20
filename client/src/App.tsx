import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ApolloProvider, ApolloClient, InMemoryCache, gql, useMutation, useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { Article, ArticleData } from './components/Article';
import Table from 'react-bootstrap/Table';
import { EditModal } from './components/EditModal'
import { TagData } from './components/Tag';
import { Button } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';

const GET_ALL_ARTICLES = gql`
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

const UPDATE_ARTICLE = gql`
  mutation updateArticle($updateData: CreateArticleDto!, $articleId: Float!) {
    updateArticle(articleData: $updateData, articleId: $articleId) {
      id
      title
      firstAuthor
      year
      tags {
        id
        name
      }
    }
  }
`
const GET_TAGS = gql`
        query getTags{
          tags {
            id
            name
          }
        }
      `

const CREATE_ARTICLE = gql`
  mutation createArticle($articleData: CreateArticleDto!) {
    addArticle(articleData: $articleData) {
      id
      title
      firstAuthor
      year
      tags {
        id
        name
      }
    }
  }
`


function App({ client }: any) {

  const [show, setShow] = useState(false);

  // const [articleData, setData] = useState<ArticleData[]>([]);
  const [editData, setEditData] = useState<ArticleData | null>(null);
  const [updateArticle, {
    data: updateData,
    loading: updateLoading,
    error: updateError }] = useMutation(UPDATE_ARTICLE, {});

  const [createArticle, {
    data: createData,
    loading: createLoading,
    error: createError
  }] = useMutation(CREATE_ARTICLE);

  const {
    loading: allArticlesLoading,
    data: articleData,
    error: allArticlesError,
    refetch: refetchAllArticles } = useQuery(GET_ALL_ARTICLES);

  const {
    loading: allTagsLoading,
    data: allTags,
    error: allTagsError,
    refetch: refetchAllTags
  } = useQuery(GET_TAGS);




  const handleClose = () => {
    // Update the database here
    if (editData) {
      if (editData.id) {
        const newEditData = editData
        let tagIds;
        if (newEditData?.tags) {
          tagIds = newEditData.tags.map((tag: TagData) => tag.id);
        } else {
          tagIds = null;
        }
        const { tags, id, ...updateData } = newEditData;

        updateData['inputTags'] = tagIds;

        updateArticle({
          variables: {
            updateData: updateData,
            articleId: parseFloat(newEditData.id)
          }
        }).then(() => refetchAllArticles());
      } else {
        // Create a new article
        const { tags, id, ...createData } = editData;
        const tagIds = tags.map((tag: TagData) => tag.id);

        createArticle({
          variables: {
            articleData: { ...createData, inputTags: tagIds }
          }
        }).then(() => refetchAllArticles());
      }
    }
    setShow(false);
  };

  const handleShow = () => setShow(true);

  const articleItems = articleData?.articles?.map((article: ArticleData) =>
    <Article
      key={article.id}
      article={article}
      setEditData={setEditData}
      handleShow={handleShow}
    />
  );
  return (
    <div className="">
      <nav className="d-flex justify-content-between fixed-top navbar navbar-dark bg-light">
        <h1>Lit Review Tracking App</h1>
        <Button onClick={() => {
          handleShow();
          // Empty ArticleData
          const emptyArticleData: ArticleData = {
            id: "",
            title: "",
            firstAuthor: "",
            summary: "",
            year: 0,
            tags: [],
            inputTags: []
          }
          setEditData(emptyArticleData);
        }} variant="primary">+</Button>
      </nav>
      <Table striped bordered hover style={{ marginTop: "4.5em" }}>
        <thead>
          <tr>
            <th style={{ width: "5%" }}>#</th>
            <th style={{ width: "10%" }}>Title</th>
            <th style={{ width: "5%" }}>Author</th>
            <th style={{ width: "5%" }}>Year</th>
            <th style={{ width: "70%" }}>Summary</th>
            <th style={{ width: "5%" }}>

              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  Tags
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {allTags?.tags
                    .map((tag: TagData) =>
                      <Dropdown.Item key={`$filter_${tag.name}`} onClick={(e) => {
                        console.log(tag);
                      }}>{tag.name}</Dropdown.Item>
                    )}

                </Dropdown.Menu>
              </Dropdown>

            </th>
          </tr>
        </thead>
        <tbody>
          {articleItems}
        </tbody>
      </Table>
      {editData ?
        <EditModal
          editData={editData}
          handleClose={handleClose}
          show={show}
          allTags={allTags}
          setEditData={setEditData}
        />
        : null}

    </div>
  );
}

export default App;
