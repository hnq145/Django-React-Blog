import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const TagInput = ({ value, onChange, placeholder }) => {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const finalPlaceholder =
    placeholder || t("addPost.enterTags", "Enter tags...");

  useEffect(() => {
    // Sync internal state with prop value (comma separated string)
    if (value) {
      const newTags = value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      // Only update if arrays differ to avoid unnecessary re-renders
      if (JSON.stringify(newTags) !== JSON.stringify(tags)) {
        setTags(newTags);
      }
    } else {
      setTags([]);
    }
  }, [value, tags]); // Run when value prop or tags state matches

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmedInput = inputValue.trim();
      if (trimmedInput && !tags.includes(trimmedInput)) {
        const newTags = [...tags, trimmedInput];
        setTags(newTags);
        onChange(newTags.join(",")); // Notify parent
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      onChange(newTags.join(",")); // Notify parent
    }
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    onChange(newTags.join(",")); // Notify parent
  };

  return (
    <div className="form-control d-flex flex-wrap align-items-center gap-2 focus-ring">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="badge bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-1"
        >
          {tag}
          <i
            className="fas fa-times"
            style={{ cursor: "pointer", fontSize: "0.8em" }}
            onClick={() => removeTag(index)}
          ></i>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border-0 bg-transparent flex-grow-1"
        style={{ outline: "none", minWidth: "120px" }}
        placeholder={tags.length === 0 ? finalPlaceholder : ""}
      />
    </div>
  );
};

export default TagInput;
