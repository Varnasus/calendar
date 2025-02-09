import React from 'react';
import { useDrag } from 'react-dnd';

function DraggableItem({ type, item, children, onDragEnd }) {
  const [{ isDragging }, drag] = useDrag({
    type: type,
    item: () => ({ ...item }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onDragEnd(item, dropResult);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      {children}
    </div>
  );
}

export default DraggableItem; 