import { ArticleData } from "./Article";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { TagData } from "./Tag";
import Dropdown from 'react-bootstrap/Dropdown';
import { getAllJSDocTagsOfKind } from "typescript";
import { gql, useMutation } from "@apollo/client";
import { ContentState, Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { convertToHTML, convertFromHTML } from 'draft-convert';

const DELETE_ARTICLE = gql`
  mutation deleteArticle($articleId: Float!) {
    deleteArticle(articleId: $articleId) 
  }
`

export function EditModal({ editData, show, handleClose, allTags, setEditData, setShow,
  refetchAllArticles, refetchFilterArticle }: any) {
  const { tags } = editData;
  const tagNames = tags ? tags.map((tag: TagData) => tag.name) : [];
  const [delCount, setDelCount] = useState<number>(0);
  const [savedText, setSavedText] = useState<string>("");
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  // Draft.js stuff
  const handleKeyCommand = (command: any, editorState: any) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      console.log(convertToHTML(newState.getCurrentContent()));
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
      <div>
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
  //---------------------------------

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
      setSavedText("Saved...");
      handleClose(true);
    } else if ((event.ctrlKey || event.metaKey) && charCode === 'c') {
      // alert("CTRL+C Pressed");
    } else if ((event.ctrlKey || event.metaKey) && charCode === 'v') {
      // alert("CTRL+V Pressed");
    }
  }

  const [deleteArticle, {
    data: delArticleData,
    loading: delArticleLoading,
    error: delArticleError
  }] = useMutation(DELETE_ARTICLE);

  return (
    <>
      <Modal show={show} size="xl">
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
            {/* <Form.Control as="textarea" rows={3} defaultValue={editData.summary}
              onChange={e => setEditData({ ...editData, summary: e.target.value })}
            /> */}
            <BlockStyleControls onToggle={onBlockClick} />
            <hr />
            <Editor editorState={editorState} onChange={(e) => {
              setEditorState(e)
            }} handleKeyCommand={handleKeyCommand} />
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

        </Modal.Body>
        <Modal.Footer>
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