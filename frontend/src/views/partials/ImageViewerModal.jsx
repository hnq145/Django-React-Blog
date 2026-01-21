import React, { useState, useEffect, useRef } from "react";
import { useImageContext } from "../../context/ImageContext";

function ImageViewerModal() {
  const { viewerOpen, currentImage, closeImageViewer } = useImageContext();
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (viewerOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "auto";
    }
  }, [viewerOpen]);

  if (!viewerOpen || !currentImage) return null;

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + scaleAmount), 5); // Limit zoom 0.5x to 5x
    setZoom(newZoom);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.5, 5));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.5, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const onMouseDown = (e) => {
    if (zoom > 1) {
      isDragging.current = true;
      startPosition.current = { x: e.clientX, y: e.clientY };
      lastPosition.current = { ...position };
    }
  };

  const onMouseMove = (e) => {
    if (isDragging.current && zoom > 1) {
      const dx = e.clientX - startPosition.current.x;
      const dy = e.clientY - startPosition.current.y;
      setPosition({
        x: lastPosition.current.x + dx,
        y: lastPosition.current.y + dy,
      });
    }
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      className="fixed-top w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.9)",
        zIndex: 9999,
        userSelect: "none",
      }}
      onClick={closeImageViewer}
    >
      <div
        className="position-relative w-100 h-100 d-flex align-items-center justify-content-center overflow-hidden"
        onWheel={handleWheel}
      >
        <img
          src={currentImage}
          alt="Full View"
          draggable={false}
          className="img-fluid"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging.current ? "none" : "transform 0.1s ease-out",
            cursor: zoom > 1 ? "grab" : "default",
            maxHeight: "90vh",
            maxWidth: "90vw",
            objectFit: "contain",
          }}
          onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>

      {/* Controls */}
      <div
        className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn btn-outline-light rounded-circle"
          onClick={handleZoomOut}
        >
          <i className="fas fa-minus"></i>
        </button>
        <button
          className="btn btn-outline-light rounded-pill"
          onClick={handleReset}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          className="btn btn-outline-light rounded-circle"
          onClick={handleZoomIn}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <button
        className="btn btn-link text-white position-absolute top-0 end-0 m-4 fs-2"
        onClick={closeImageViewer}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}

export default ImageViewerModal;
