import React, { useState, useEffect } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import Toast from "../../plugin/Toast";

function Category() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ title: "", image: null });
  const [imagePreview, setImagePreview] = useState("");

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await apiInstance.get(`author/dashboard/category-list/`);
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ title: category.title, image: null });
      setImagePreview(category.image);
    } else {
      setEditingCategory(null);
      setFormData({ title: "", image: null });
      setImagePreview("");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ title: "", image: null });
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editingCategory) {
        await apiInstance.patch(
          `author/dashboard/category-detail/${editingCategory.id}/`,
          data,
        );
        Toast(
          "success",
          t("dashboard.categoryUpdated", "Danh mục đã được cập nhật"),
        );
      } else {
        await apiInstance.post(`author/dashboard/category-list/`, data);
        Toast(
          "success",
          t("dashboard.categoryCreated", "Danh mục mới đã được tạo"),
        );
      }
      fetchCategories();
      closeModal();
    } catch (error) {
      console.error(error);
      Toast("error", t("dashboard.error", "Có lỗi xảy ra"));
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t("dashboard.confirmDelete"),
      text: t("dashboard.deleteWarning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("dashboard.deleteConfirm"),
      cancelButtonText: t("dashboard.cancel"),
    });

    if (result.isConfirmed) {
      try {
        await apiInstance.delete(`author/dashboard/category-detail/${id}/`);
        Swal.fire(t("dashboard.deleted"), "", "success");
        fetchCategories();
      } catch (error) {
        console.error(error);
        Swal.fire(t("dashboard.deleteFailed"), "", "error");
      }
    }
  };

  return (
    <>
      <Header />
      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-12">
              <div className="card border bg-transparent rounded-3">
                <div className="card-header bg-transparent border-bottom p-3">
                  <div className="d-sm-flex justify-content-between align-items-center">
                    <h5 className="mb-2 mb-sm-0">
                      {t("dashboard.categories", "Danh mục")}{" "}
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {categories.length}
                      </span>
                    </h5>
                    <button
                      onClick={() => openModal()}
                      className="btn btn-sm btn-primary mb-0"
                    >
                      {t("dashboard.addNew")} <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive border-0">
                    <table className="table align-middle p-4 mb-0 table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th scope="col" className="border-0 rounded-start">
                            {t("dashboard.image")}
                          </th>
                          <th scope="col" className="border-0">
                            {t("dashboard.name", "Tên")}
                          </th>
                          <th scope="col" className="border-0">
                            {t("dashboard.postCount", "Số bài viết")}
                          </th>
                          <th scope="col" className="border-0 rounded-end">
                            {t("dashboard.action")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="border-top-0">
                        {isLoading ? (
                          <tr>
                            <td colSpan="4" className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : (
                          categories.map((c) => (
                            <tr key={c.id}>
                              <td>
                                {c.image && (
                                  <img
                                    src={c.image}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                      borderRadius: "10px",
                                    }}
                                    alt={c.title}
                                  />
                                )}
                              </td>
                              <td>{c.title}</td>
                              <td>{c.post_count}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    onClick={() => openModal(c)}
                                    className="btn btn-primary btn-round mb-0"
                                  >
                                    <i className="bi bi-pencil-square" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(c.id)}
                                    className="btn btn-danger btn-round mb-0"
                                  >
                                    <i className="bi bi-trash" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory
                    ? t("dashboard.editCategory", "Chỉnh sửa danh mục")
                    : t("dashboard.addCategory", "Thêm danh mục")}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      {t("dashboard.categoryName", "Tên danh mục")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("dashboard.categoryImage", "Hình ảnh")}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: "100%",
                            maxHeight: "200px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    {t("dashboard.close", "Đóng")}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {t("dashboard.save", "Lưu")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Category;
