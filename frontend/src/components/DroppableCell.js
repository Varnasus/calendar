import React from 'react';
import { useDrop } from 'react-dnd';

function DroppableCell({ date, onDrop, children }) {
  const [{ isOver }, drop] = useDrop({
    accept: ['CONTENT_ITEM', 'SOCIAL_POST', 'MODAL'],
    drop: (item) => onDrop(item, date),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        backgroundColor: isOver ? 'var(--secondary-color)' : 'var(--cell-background)',
      }}
    >
      {children}
    </div>
  );
}

export default DroppableCell; 