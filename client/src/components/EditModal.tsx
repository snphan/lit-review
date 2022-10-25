import { ArticleData } from "./Article";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { TagData } from "./Tag";
import Dropdown from 'react-bootstrap/Dropdown';
import { getAllJSDocTagsOfKind } from "typescript";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { ContentState, Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { convertToHTML, convertFromHTML } from 'draft-convert';

const DELETE_ARTICLE = gql`
  mutation deleteArticle($articleId: Float!) {
    deleteArticle(articleId: $articleId) 
  }
`

const GET_PDF = gql`
  query getArticlesById($articleId: Float!) {
    articlesById(articleId: $articleId) {
      pdf
    }
  }
`

export function EditModal({ editData, show, handleClose, allTags, setEditData, setShow,
  refetchAllArticles, refetchFilterArticle }: any) {
  const { tags } = editData;
  const tagNames = tags ? tags.map((tag: TagData) => tag.name) : [];
  const [delCount, setDelCount] = useState<number>(0);
  const [savedText, setSavedText] = useState<string>("");
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [pdfURL, setPdfURL] = useState<string>("")
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [getPDF, { loading: pdfLoading, error: pdfError, data: pdfData, refetch: refetchPdf }] = useLazyQuery(GET_PDF);
  const [newFileAdded, setNewFileAdded] = useState<boolean>(false);

  // Draft.js stuff
  const handleKeyCommand = (command: any, editorState: any) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);

      return 'handled';
    }

    return 'not-handled';
  }

  useEffect(() => {
    setEditData({ ...editData, summary: convertToHTML(editorState.getCurrentContent()) });
  }, [editorState])

  useEffect(() => {
    if (show) {
      // Set the editor with the new content everytime we show the editmodal
      const convertedHTML = convertFromHTML(editData.summary as string);
      const editorState = EditorState.createWithContent(convertedHTML);
      setEditorState(editorState);
    }
    setNewFileAdded(false);
    setShowPDF(false);
  }, [show])

  const BLOCK_TYPES = [
    { label: "H1", style: "header-one" },
    { label: "H2", style: "header-two" },
    { label: "H3", style: "header-three" },
    { label: "H4", style: "header-four" },
    { label: "H5", style: "header-five" },
    { label: "H6", style: "header-six" },
    { label: "Blockquote", style: "blockquote" },
    { label: "UL", style: "unordered-list-item" },
    { label: "OL", style: "ordered-list-item" },
    { label: "Code Block", style: "code-block" }
  ];

  const StyleButton = (props: any) => {
    let onClickButton = (e: any) => {
      e.preventDefault();
      props.onToggle(props.style);
    };
    return <Button className="mx-2" variant="outline-secondary" onMouseDown={onClickButton}>{props.label}</Button>;
  };

  const BlockStyleControls = (props: any) => {
    return (
      <div className={props.className}>
        {BLOCK_TYPES.map((type) => (
          <StyleButton
            key={type.label}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        ))}
      </div>
    );
  };

  const onBlockClick = (e: any) => {
    let nextState = RichUtils.toggleBlockType(editorState, e);
    setEditorState(nextState);
  };

  const onTab = (e: any) => {
    //prevent cursor from selecting the next interactive element
    e.preventDefault()

    // assign a constant for the new editorState
    const newState = RichUtils.onTab(e, editorState, 4)

    // if a new editor state exists, set editor state to new state
    // and return 'handled', otherwise return 'not-handled
    if (newState) {
      setEditorState(newState)
      return 'handled'
    } else {
      return 'not-handled'
    }
  }

  //---------------------------------

  useEffect(() => {
    if (showPDF && !newFileAdded) {
      if (pdfURL) {
        URL.revokeObjectURL(pdfURL)
        setPdfURL("");
      }
      refetchPdf({ articleId: parseInt(editData.id) }).then(async (result: any) => {

        await new Promise(() => {
          const pdfDataBit = new Uint8Array(result?.data?.articlesById.pdf);
          if (pdfDataBit) {
            const fileBlob = new Blob([pdfDataBit], { type: "application/pdf" })
            const newURL = URL.createObjectURL(fileBlob);
            setPdfURL(newURL);
          }
        });
      });
    }
  }, [showPDF]);

  const handleClickShowPdf = () => {
    setShowPDF(!showPDF);
  }

  useEffect(() => {
    // Show the saved prompt for 2 secs on save
    const sleep = async (ms: number) => {
      await new Promise(r => setTimeout(r, ms));
    }
    sleep(2000).then(() =>
      setSavedText("")
    );
  }, [savedText])

  const handleKeyDown = async (event: any) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === 's') {
      event.preventDefault();
      if (editData.id) {
        setSavedText("Saved...");
        handleClose(true);
      }
    } else if ((event.ctrlKey || event.metaKey) && charCode === '5') {
      event.preventDefault();
      onBlockClick("header-five");
    } else if ((event.ctrlKey || event.metaKey) && charCode === '4') {
      event.preventDefault();
      onBlockClick("header-four");
    } else if ((event.ctrlKey || event.metaKey) && charCode === '3') {
      event.preventDefault();
      onBlockClick("header-three");
    } else if ((event.ctrlKey || event.metaKey) && charCode === '2') {
      event.preventDefault();
      onBlockClick("header-two");
    } else if ((event.ctrlKey || event.metaKey) && charCode === '1') {
      event.preventDefault();
      onBlockClick("header-one");
    } else if ((event.ctrlKey || event.metaKey) && event.shiftKey && charCode === '8') {
      event.preventDefault();
      onBlockClick("unordered-list-item");
    } else if ((event.ctrlKey || event.metaKey) && charCode === 'c') {
      // alert("CTRL+C Pressed");
    } else if ((event.ctrlKey || event.metaKey) && charCode === 'v') {
      // alert("CTRL+V Pressed");
    }
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files!);
    const file = files[0];

    if (pdfURL) {
      URL.revokeObjectURL(pdfURL)
      setPdfURL("");
    }
    let x: Uint8Array;
    file.arrayBuffer().then(buff => {
      x = new Uint8Array(buff);
      setEditData({ ...editData, pdf: Array.from(x) });
      setNewFileAdded(true);
    }).then(() => {
      const fileBlob = new Blob([x], { type: "application/pdf" })
      const newURL = URL.createObjectURL(fileBlob);
      setPdfURL(newURL);
      setShowPDF(true);
    })
  }

  const [deleteArticle, {
    data: delArticleData,
    loading: delArticleLoading,
    error: delArticleError
  }] = useMutation(DELETE_ARTICLE);

  return (
    <>
      <Modal show={show} size="xl" onHide={() => setShow(false)} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{editData.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body onKeyDown={handleKeyDown}>
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" defaultValue={editData.title}
            onChange={e => setEditData({ ...editData, title: e.target.value })}
          />
          <Form.Label>Author</Form.Label>
          <Form.Control type="text" defaultValue={editData.firstAuthor}
            onChange={e => setEditData({ ...editData, firstAuthor: e.target.value })}
          />
          <Form.Label>Year</Form.Label>
          <Form.Control type="text" defaultValue={editData.year}
            onChange={e => setEditData({ ...editData, year: parseFloat(e.target.value) })}
          />
          <Form.Group className="m-4" controlId="exampleForm.ControlTextarea1">
            <h3 className="text-center">Summary</h3>
            <BlockStyleControls onToggle={onBlockClick} className="blockstyles" />
            <hr />
            <Editor editorState={editorState} onChange={(e) => {
              setEditorState(e)
            }} handleKeyCommand={handleKeyCommand}
              onTab={onTab}
            />
            <hr />
          </Form.Group>
          <Form.Label><strong>Tags</strong></Form.Label>
          <br />
          <br />
          <div className="container">
            {editData.tags?.map((tag: TagData) =>
              <Badge key={tag.name} bg="secondary" className="mx-1">
                {tag.name}
                <Button
                  className="m-1 tag-remove"
                  variant="danger"
                  onClick={() => {
                    const newTags = tags.filter((oldTag: TagData) => oldTag.name !== tag.name);
                    setEditData({ ...editData, tags: newTags });
                  }}
                >&times;</Button>
              </Badge>
            )}
          </div>
          <br />
          <br />
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Select Tags
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {tagNames ? allTags.tags
                .filter((tag: TagData) => !tagNames.includes(tag.name))
                .map((filtTag: TagData) =>
                  <Dropdown.Item key={`${editData.id}_${filtTag.name}`} onClick={() => {
                    const newTags: TagData[] = tags ? [...tags, filtTag] : [filtTag];
                    setEditData({ ...editData, tags: newTags });
                  }}>{filtTag.name}</Dropdown.Item>
                ) : null}
            </Dropdown.Menu>
          </Dropdown>
          {editData.id ?
            <Button variant="primary" onClick={handleClickShowPdf}>Show PDF</Button>
            : null}
          {pdfLoading ?
            <p>Loading...</p> : null
          }
          {showPDF ?
            <embed
              src={pdfURL}
              type="application/pdf"
              width="100%"
              height="800px"
            /> : null}
        </Modal.Body>
        <Modal.Footer>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Default file input example</Form.Label>
            <Form.Control type="file" onChange={handleFileSelected} />
          </Form.Group>
          <span style={{ color: "green" }}>{savedText}</span>
          {editData.id ?
            <Button variant="danger" onClick={() => {
              if (delCount == 0) {
                alert("If you are sure click again.");
                setDelCount(delCount + 1);
              } else {
                setShow(false);
                deleteArticle({
                  variables: {
                    articleId: parseFloat(editData.id)
                  }
                }).then(() => {
                  refetchAllArticles();
                  refetchFilterArticle();
                });
                setDelCount(0);
              }
            }}
            >
              🗑️
            </Button>
            : null}

          <Button variant="secondary" onClick={() => { setShow(false); setDelCount(0); }}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleClose(false)}>
            Save Changes
          </Button>

        </Modal.Footer>
      </Modal>
    </>
  )
}