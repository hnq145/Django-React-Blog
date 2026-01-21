import React, { createContext, useContext, useState } from "react";

const ImageContext = createContext();

export const useImageContext = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const openImageViewer = (src) => {
    if (src) {
      setCurrentImage(src);
      setViewerOpen(true);
    }
  };

  const closeImageViewer = () => {
    setViewerOpen(false);
    setCurrentImage(null);
  };

  return (
    <ImageContext.Provider
      value={{ viewerOpen, currentImage, openImageViewer, closeImageViewer }}
    >
      {children}
    </ImageContext.Provider>
  );
};
