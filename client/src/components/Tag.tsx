import { useState } from 'react';
import React from 'react';

export interface TagData {
  id: number;
  name: string;
}

export function Tag(props: TagData) {

  return (
    <div className="tag">
      {props.name}
    </div>
  )
}