import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createVendorProduct,
  uploadVendorProductImage,
} from "../../services/vendorService";

function VendorProductCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    brand: "",
    name: "",
    slug: "",
    sku: "",
    description: "",
    price: "",
    stock: "",
    status: "DRAFT",
    is_active: true,
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const selectedImages = Array.from(
      event.target.files
    );

    if (!selectedImages.length) {
      return;
    }

    const validImages = selectedImages.filter(
      (file) =>
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp"
    );

    if (validImages.length === 0) {
      setError(
        "Please select JPG, PNG or WEBP images."
      );
      return;
    }

    const limitedImages =
      validImages.slice(0, 4);

    setImages(limitedImages);

    setPreviews(
      limitedImages.map((file) =>
        URL.createObjectURL(file)
      )
    );

    setError("");
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = images.filter(
      (_, index) =>
        index !== indexToRemove
    );

    const updatedPreviews = previews.filter(
      (_, index) =>
        index !== indexToRemove
    );

    setImages(updatedImages);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const productData = {
        category: Number(formData.category),
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        sku: formData.sku.trim(),
        description:
          formData.description.trim(),
        price: formData.price,
        stock: Number(formData.stock),
        status: formData.status,
        is_active: formData.is_active,
      };

      if (formData.brand) {
        productData.brand = Number(
          formData.brand
        );
      } else {
        productData.brand = null;
      }

      const product =
        await createVendorProduct(
          productData
        );

      for (
        let index = 0;
        index < images.length;
        index++
      ) {
        const imageData = new FormData();

        imageData.append(
          "image",
          images[index]
        );

        imageData.append(
          "is_primary",
          index === 0
            ? "true"
            : "false"
        );

        await uploadVendorProductImage(
          product.id,
          imageData
        );
      }

      setSuccess(
        "Product created successfully."
      );

      setTimeout(() => {
        navigate("/vendor/products");
      }, 1000);
    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );

      const responseData =
        error.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages =
          Object.entries(responseData)
            .map(
              ([field, message]) => {
                if (
                  Array.isArray(
                    message
                  )
                ) {
                  return `${field}: ${message.join(
                    ", "
                  )}`;
                }

                return `${field}: ${message}`;
              }
            )
            .join(" | ");

        setError(
          messages ||
            "Product create nahi ho paaya."
        );
      } else {
        setError(
          error.message ||
            "Product create nahi ho paaya."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="vendor-product-create-page">
      <div className="vendor-container">

        <div className="vendor-products-header">
          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>
              Add Product
            </h1>

            <p>
              Add a new product to your store.
            </p>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <section className="vendor-product-form-card">
          <form
            onSubmit={handleSubmit}
          >

            <div className="vendor-product-form-section">

              <h2>
                Product Information
              </h2>

              <div className="vendor-product-form-grid">

                <div className="form-group">
                  <label htmlFor="name">
                    Product Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Bluetooth Speaker"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sku">
                    SKU
                  </label>

                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    placeholder="BS-002"
                    value={
                      formData.sku
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="slug">
                    Slug
                  </label>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    placeholder="bluetooth-speaker"
                    value={
                      formData.slug
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">
                    Category ID
                  </label>

                  <input
                    id="category"
                    name="category"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="brand">
                    Brand ID
                  </label>

                  <input
                    id="brand"
                    name="brand"
                    type="number"
                    min="1"
                    placeholder="Optional"
                    value={
                      formData.brand
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">
                    Price
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="2499.00"
                    value={
                      formData.price
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">
                    Stock
                  </label>

                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="15"
                    value={
                      formData.stock
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="PUBLISHED">
                      Published
                    </option>

                    <option value="OUT_OF_STOCK">
                      Out of Stock
                    </option>
                  </select>
                </div>

              </div>

              <div className="form-group">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  placeholder="Enter product description..."
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

            </div>

            <div className="vendor-product-form-section">

              <h2>
                Product Images
              </h2>

              <div className="product-upload-area">

                <label
                  htmlFor="product-image"
                  className="product-upload-label"
                >
                  <span>
                    Choose Files
                  </span>

                  <small>
                    Select up to 4 JPG,
                    PNG or WEBP images
                  </small>
                </label>

                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={
                    handleImageChange
                  }
                />

                {images.length > 0 && (
                  <div className="product-selected-images">

                    {images.map(
                      (image, index) => (
                        <div
                          className="product-selected-file"
                          key={`${image.name}-${index}`}
                        >
                          <div>
                            <strong>
                              {image.name}
                            </strong>

                            <span>
                              {(
                                image.size /
                                1024 /
                                1024
                              ).toFixed(
                                2
                              )}{" "}
                              MB
                            </span>
                          </div>

                          {index === 0 && (
                            <span className="primary-image-badge">
                              Primary
                            </span>
                          )}

                          <button
                            type="button"
                            className="remove-product-image"
                            onClick={() =>
                              removeImage(
                                index
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}

                  </div>
                )}

                {previews.length > 0 && (
                  <div className="product-image-preview-grid">

                    {previews.map(
                      (
                        preview,
                        index
                      ) => (
                        <div
                          className="product-image-preview"
                          key={preview}
                        >

                          <img
                            src={preview}
                            alt={`Product preview ${
                              index + 1
                            }`}
                          />

                          {index === 0 && (
                            <span className="primary-image-badge">
                              Primary
                            </span>
                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </div>

            <div className="vendor-product-form-section">

              <h2>
                Product Settings
              </h2>

              <label className="product-active-checkbox">

                <input
                  type="checkbox"
                  checked={
                    formData.is_active
                  }
                  onChange={(event) =>
                    setFormData(
                      (previous) => ({
                        ...previous,
                        is_active:
                          event.target
                            .checked,
                      })
                    )
                  }
                />

                <span>
                  Product is active
                </span>

              </label>

            </div>

            <div className="vendor-product-form-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  navigate(
                    "/vendor/products"
                  )
                }
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading
                  ? "Creating Product..."
                  : "Add Product"}
              </button>

            </div>

          </form>
        </section>

      </div>
    </main>
  );
}

export default VendorProductCreate;