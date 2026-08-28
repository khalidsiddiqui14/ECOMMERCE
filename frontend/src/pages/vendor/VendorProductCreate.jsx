import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  createVendorProduct,
  uploadVendorProductImage,
} from "../../services/vendorService";

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function VendorProductCreate() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [formData, setFormData] =
    useState({
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

  const [images, setImages] =
    useState([]);

  const [previews, setPreviews] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleNameChange = (event) => {
    const value =
      event.target.value;

    setFormData((previous) => ({
      ...previous,
      name: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleImageChange = (
    event
  ) => {
    const selectedFiles =
      Array.from(
        event.target.files || []
      );

    if (
      !selectedFiles.length
    ) {
      return;
    }

    setError("");

    const invalidType =
      selectedFiles.find(
        (file) =>
          !ALLOWED_IMAGE_TYPES.includes(
            file.type
          )
      );

    if (invalidType) {
      setError(
        `"${invalidType.name}" is not a supported image. Please use JPG, PNG or WEBP.`
      );

      event.target.value = "";
      return;
    }

    const oversizedFile =
      selectedFiles.find(
        (file) =>
          file.size > MAX_IMAGE_SIZE
      );

    if (oversizedFile) {
      setError(
        `"${oversizedFile.name}" is larger than 5 MB.`
      );

      event.target.value = "";
      return;
    }

    const limitedFiles =
      selectedFiles.slice(
        0,
        MAX_IMAGES
      );

    if (
      selectedFiles.length >
      MAX_IMAGES
    ) {
      setError(
        `Only ${MAX_IMAGES} images can be selected.`
      );
    }

    previews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    setImages(limitedFiles);

    setPreviews(
      limitedFiles.map((file) =>
        URL.createObjectURL(file)
      )
    );

    event.target.value = "";
  };

  const removeImage = (
    indexToRemove
  ) => {
    const previewToRemove =
      previews[indexToRemove];

    if (previewToRemove) {
      URL.revokeObjectURL(
        previewToRemove
      );
    }

    setImages((previous) =>
      previous.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );

    setPreviews((previous) =>
      previous.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const category =
      Number(formData.category);

    const price =
      Number(formData.price);

    const stock =
      Number(formData.stock);

    const name =
      formData.name.trim();

    const slug =
      formData.slug.trim();

    const sku =
      formData.sku.trim();

    const description =
      formData.description.trim();

    if (
      !Number.isInteger(category) ||
      category <= 0
    ) {
      return "Please enter a valid Category ID.";
    }

    if (!name) {
      return "Product name is required.";
    }

    if (!slug) {
      return "Product slug is required.";
    }

    if (!sku) {
      return "SKU is required.";
    }

    if (!description) {
      return "Product description is required.";
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return "Please enter a valid product price.";
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return "Stock must be a whole number greater than or equal to 0.";
    }

    if (
      ![
        "DRAFT",
        "PUBLISHED",
        "OUT_OF_STOCK",
      ].includes(formData.status)
    ) {
      return "Please select a valid product status.";
    }

    return "";
  };

  const formatApiError = (
    error
  ) => {
    const responseData =
      error.response?.data;

    if (!responseData) {
      return (
        error.message ||
        "Product create nahi ho paaya."
      );
    }

    if (
      typeof responseData ===
      "string"
    ) {
      return responseData;
    }

    if (responseData.detail) {
      return Array.isArray(
        responseData.detail
      )
        ? responseData.detail.join(
            ", "
          )
        : String(
            responseData.detail
          );
    }

    if (responseData.message) {
      return Array.isArray(
        responseData.message
      )
        ? responseData.message.join(
            ", "
          )
        : String(
            responseData.message
          );
    }

    return Object.entries(
      responseData
    )
      .map(
        ([field, message]) => {
          const value =
            Array.isArray(message)
              ? message.join(", ")
              : typeof message ===
                  "object" &&
                message !== null
              ? JSON.stringify(
                  message
                )
              : String(message);

          return `${field}: ${value}`;
        }
      )
      .join(" | ");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    setLoading(true);

    try {
      const productData = {
        category: Number(
          formData.category
        ),
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        sku: formData.sku.trim(),
        description:
          formData.description.trim(),
        price: Number(
          formData.price
        ).toFixed(2),
        stock: Number(
          formData.stock
        ),
        status: formData.status,
        is_active:
          formData.is_active,
        brand: formData.brand
          ? Number(formData.brand)
          : null,
      };

      const product =
        await createVendorProduct(
          productData
        );

      if (!product?.id) {
        throw new Error(
          "Product created, but product ID was not returned by the server."
        );
      }

      let uploadedImages = 0;

      for (
        let index = 0;
        index < images.length;
        index += 1
      ) {
        const imageData =
          new FormData();

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

        uploadedImages += 1;
      }

      if (
        images.length > 0 &&
        uploadedImages <
          images.length
      ) {
        throw new Error(
          "Product created, but some images could not be uploaded."
        );
      }

      setSuccess(
        images.length > 0
          ? "Product and images created successfully."
          : "Product created successfully."
      );

      setFormData({
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

      previews.forEach((preview) => {
        URL.revokeObjectURL(
          preview
        );
      });

      setImages([]);
      setPreviews([]);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      setTimeout(() => {
        navigate(
          "/vendor/products"
        );
      }, 1200);
    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );

      setError(
        formatApiError(error)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="vendor-product-create-page">
      <div className="vendor-container">
        {/* HEADER */}

        <div className="vendor-products-header">
          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>
              Add Product
            </h1>

            <p>
              Add a new product to
              your store.
            </p>
          </div>
        </div>

        {/* MESSAGES */}

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="success-message"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        {/* FORM */}

        <section className="vendor-product-form-card">
          <form
            onSubmit={handleSubmit}
            noValidate
          >
            {/* PRODUCT INFORMATION */}

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
                      handleNameChange
                    }
                    disabled={loading}
                    maxLength={255}
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
                    disabled={loading}
                    maxLength={100}
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
                    disabled={loading}
                    maxLength={255}
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
                    step="1"
                    placeholder="1"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
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
                    step="1"
                    placeholder="Optional"
                    value={
                      formData.brand
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
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
                    disabled={loading}
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
                    step="1"
                    placeholder="15"
                    value={
                      formData.stock
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading}
                  maxLength={5000}
                  required
                />

                <small>
                  {
                    formData
                      .description
                      .length
                  }
                  /5000 characters
                </small>
              </div>
            </div>

            {/* IMAGES */}

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
                    Select up to{" "}
                    {MAX_IMAGES} JPG,
                    PNG or WEBP images
                    (max 5 MB each)
                  </small>
                </label>

                <input
                  ref={fileInputRef}
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={
                    handleImageChange
                  }
                  disabled={loading}
                />

                {images.length >
                  0 && (
                  <div className="product-selected-images">
                    {images.map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          className="product-selected-file"
                          key={`${image.name}-${image.lastModified}-${index}`}
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

                          {index ===
                            0 && (
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
                            disabled={
                              loading
                            }
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {previews.length >
                  0 && (
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
                              index +
                              1
                            }`}
                          />

                          {index ===
                            0 && (
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

            {/* SETTINGS */}

            <div className="vendor-product-form-section">
              <h2>
                Product Settings
              </h2>

              <label className="product-active-checkbox">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={
                    formData.is_active
                  }
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                />

                <span>
                  Product is active
                </span>
              </label>
            </div>

            {/* ACTIONS */}

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