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
import Form from 'react-bootstrap/Form';

const GET_ARTICLES_BY_TAGS = gql`
query getArticleByTag($tagNames: [String!]!) {
  filterByTags(tagNames: $tagNames) {
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

const CREATE_TAG = gql`
mutation createTag($tagData: TagDto!) {
  addTag(tagData: $tagData) {
    id
    name
  }
}
`


function App({ client }: any) {

  const [show, setShow] = useState(false);
  const [filtTags, setFiltTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");

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

  const [createTag, {
    data: createTagData,
    loading: tagLoading,
    error: tagError
  }] = useMutation(CREATE_TAG);

  const {
    loading: allArticlesLoading,
    data: articleData,
    error: allArticlesError,
    refetch: refetchAllArticles } = useQuery(GET_ALL_ARTICLES);

  const {
    loading: filterArticlesLoading,
    data: filterArticleData,
    error: filterArticleError,
    refetch: refetchFilterArticle } = useQuery(GET_ARTICLES_BY_TAGS, {
      variables: {
        tagNames: filtTags
      }
    })

  const {
    loading: allTagsLoading,
    data: allTags,
    error: allTagsError,
    refetch: refetchAllTags
  } = useQuery(GET_TAGS);


  useEffect(() => {
    refetchFilterArticle({ tagNames: filtTags });
    console.log(filterArticleData);
  }, [filtTags]);



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

  const articleItems = (filtTags.length > 0 ? filterArticleData?.filterByTags : articleData?.articles)?.map((article: ArticleData) =>
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
        <div className="d-flex">
          <Form.Control id="tag-input" type="input" placeholder="New Tag" onChange={(e) => setNewTag(e.target.value)} />
          <Button variant='primary' onClick={() => {
            createTag({
              variables: {
                tagData: { name: newTag }
              }
            }).then(() => {
              setNewTag('');
              const input = document.getElementById('tag-input') as HTMLInputElement;
              input.value = "";
              refetchAllTags();
            })
          }}>+</Button>
        </div>

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

                  <Dropdown.Item onClick={() => { setFiltTags([]) }}>❌</Dropdown.Item>
                  {allTags?.tags
                    .map((tag: TagData) =>
                      <Dropdown.Item key={`$filter_${tag.name}`} onClick={() => {
                        if (filtTags.includes(tag.name)) {
                          let removeInd = filtTags.indexOf(tag.name);
                          setFiltTags([...filtTags.slice(0, removeInd), ...filtTags.slice(removeInd + 1)])
                        } else {
                          setFiltTags([...filtTags, tag.name]);
                        }
                      }}>{filtTags.includes(tag.name) ? "✅" : ""} {tag.name}</Dropdown.Item>
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
