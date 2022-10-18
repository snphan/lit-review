import { ArticleData } from "./Article";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { TagData } from "./Tag";
import Dropdown from 'react-bootstrap/Dropdown';
import { getAllJSDocTagsOfKind } from "typescript";

export function EditModal({ editData, show, handleClose, allTags, setEditData }: any) {
  const { tags } = editData;
  const tagNames = tags ? tags.map((tag: TagData) => tag.name) : [];
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editData.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" defaultValue={editData.title} />
          <Form.Label>Author</Form.Label>
          <Form.Control type="text" defaultValue={editData.firstAuthor} />
          <Form.Label>Year</Form.Label>
          <Form.Control type="text" defaultValue={editData.year} />
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Summary</Form.Label>
            <Form.Control as="textarea" rows={3} defaultValue={editData.summary} />
          </Form.Group>
          <Form.Label><strong>Tags</strong></Form.Label>
          <br />
          <br />
          <div className="container">
            {editData.tags?.map((tag: TagData) =>
              <Badge key={tag.name} bg="secondary" className="m-1">
                {tag.name}
                <Button
                  className="p-1 m-1"
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
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Dropdown Button
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {tagNames ? allTags
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
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}