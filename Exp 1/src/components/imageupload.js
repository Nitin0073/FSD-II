import { useState } from "react";

function ImageUpload({ image, setImage }) {
  const previewImage = (e) => {
    if (e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="section">
      <label>Upload Image</label>

      <input
        type="file"
        accept="image/*"
        onChange={previewImage}
      />

      {image && (
        <img
          src={image}
          alt="preview"
          className="imagePreview"
        />
      )}
    </div>
  );
}

export default ImageUpload;