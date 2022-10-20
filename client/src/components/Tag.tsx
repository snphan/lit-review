import { useState } from 'react';
import React from 'react';
const randomColor = require('randomcolor');

export interface TagData {
  id: number;
  name: string;
}

export function Tag(props: TagData) {
  return (
    <div className="tag" style={{ backgroundColor: randomColor({ luminosity: 'dark', seed: props.id * 167 }) }}>
      {props.name}
    </div>
  )
}