import React, { useState, useEffect } from "react";
import "./App.css";
import { API_BASE_URL } from "./supabase";

function App() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");

  // Form states
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    instructor: ""
  });

  const [createdCourseId, setCreatedCourseId] = useState(null);

  const [enrollForm, setEnrollForm] = useState({
    user_id: "",
    course_id: ""
  });

  const [uploadForm, setUploadForm] = useState({
    courseId: "",
    title: "",
    video: null
  });

  const [materialForm, setMaterialForm] = useState({
    courseId: "",
    title: "",
    material: null
  });

  const [courseDetails, setCourseDetails] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/courses`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Error fetching courses: " + error.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.description || !newCourse.instructor) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const courseId = data && data[0] && data[0].id ? data[0].id : "Unknown";

      setCreatedCourseId(courseId);
      alert(`Course created successfully! Course ID: ${courseId}`);
      setNewCourse({ title: "", description: "", instructor: "" });
      fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Error creating course: " + error.message);
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrollForm)
      });

      if (!response.ok) {
        throw new Error("Failed to enroll");
      }

      alert("Enrolled successfully!");
      setEnrollForm({ user_id: "", course_id: "" });
    } catch (error) {
      console.error("Error enrolling:", error);
      alert("Error enrolling in course");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (e) => {
    e.preventDefault();
    if (!uploadForm.video || !uploadForm.courseId || !uploadForm.title) {
      alert("Please fill all fields and select a video");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("video", uploadForm.video);
      formData.append("courseId", uploadForm.courseId);
      formData.append("title", uploadForm.title);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert("Video uploaded successfully!");
        setUploadForm({ courseId: "", title: "", video: null });
      } else {
        alert("Error uploading video: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.material || !materialForm.courseId || !materialForm.title) {
      alert("Please fill all fields and select a file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("material", materialForm.material);
      formData.append("courseId", materialForm.courseId);
      formData.append("title", materialForm.title);

      console.log("📤 Uploading material:", {
        fileName: materialForm.material.name,
        fileSize: materialForm.material.size,
        courseId: materialForm.courseId,
        title: materialForm.title
      });

      const response = await fetch(`${API_BASE_URL}/upload-material`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (!response.ok) {
        console.error("Upload error response:", data);
        alert(`Error uploading material: ${data.error || 'Unknown error'}`);
        return;
      }

      if (data.success) {
        alert("Study material uploaded successfully!");
        setMaterialForm({ courseId: "", title: "", material: null });
      } else {
        alert("Error uploading material: " + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error uploading material:", error);
      alert("Error uploading material: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourseDetails = async (courseId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/course-details/${courseId}`);
      const data = await response.json();

      if (!response.ok) {
        alert("Error loading course details: " + data.error);
        return;
      }

      setCourseDetails(data);
      setShowCourseModal(true);
    } catch (error) {
      console.error("Error fetching course details:", error);
      alert("Error loading course details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">📚 TechTutor - E-Learning Platform</h1>
          <div className="nav-links">
            <button
              className={`nav-btn ${activeTab === "courses" ? "active" : ""}`}
              onClick={() => setActiveTab("courses")}
            >
              View Courses
            </button>
            <button
              className={`nav-btn ${activeTab === "create" ? "active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
              Create Course
            </button>
            <button
              className={`nav-btn ${activeTab === "enroll" ? "active" : ""}`}
              onClick={() => setActiveTab("enroll")}
            >
              Enroll Course
            </button>
            <button
              className={`nav-btn ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              Upload Video
            </button>
            <button
              className={`nav-btn ${activeTab === "materials" ? "active" : ""}`}
              onClick={() => setActiveTab("materials")}
            >
              Upload Materials
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="tab-content">
            <h2>Available Courses</h2>
            {loading && <p className="loading">Loading courses...</p>}
            {courses.length === 0 ? (
              <p className="no-data">No courses available yet</p>
            ) : (
              <div className="courses-grid">
                {courses.map((course) => (
                  <div key={course.id} className="course-card">
                    <div className="course-id-badge">ID: {course.id}</div>
                    <h3>{course.title}</h3>
                    <p className="description">{course.description}</p>
                    <p className="instructor">
                      <strong>Instructor:</strong> {course.instructor}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleViewCourseDetails(course.id)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Course Tab */}
        {activeTab === "create" && (
          <div className="tab-content">
            <h2>Create a New Course</h2>
            {createdCourseId && (
              <div className="success-message">
                <p><strong>✓ Course Created Successfully!</strong></p>
                <p>Course ID: <strong>{createdCourseId}</strong></p>
                <div className="quick-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("upload")}
                  >
                    Upload Video to This Course
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={handleCreateCourse} className="form">
              <div className="form-group">
                <label>Course Title</label>
                <input
                  type="text"
                  placeholder="Enter course title"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter course description"
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Instructor Name</label>
                <input
                  type="text"
                  placeholder="Enter instructor name"
                  value={newCourse.instructor}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, instructor: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Course"}
              </button>
            </form>
          </div>
        )}

        {/* Enroll Tab */}
        {activeTab === "enroll" && (
          <div className="tab-content">
            <h2>Enroll in a Course</h2>
            <form onSubmit={handleEnroll} className="form">
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  placeholder="Enter your user ID"
                  value={enrollForm.user_id}
                  onChange={(e) =>
                    setEnrollForm({ ...enrollForm, user_id: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Select Course</label>
                {courses.length === 0 ? (
                  <p className="no-courses-msg">No courses available. Please create a course first.</p>
                ) : (
                  <select
                    value={enrollForm.course_id}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, course_id: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Select a Course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} (ID: {course.id}) - Instructor: {course.instructor}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? "Enrolling..." : "Enroll Now"}
              </button>
            </form>
          </div>
        )}

        {/* Upload Video Tab */}
        {activeTab === "upload" && (
          <div className="tab-content">
            <h2>Upload Course Video</h2>
            <form onSubmit={handleUploadVideo} className="form">
              <div className="form-group">
                <label>Select Course</label>
                {courses.length === 0 ? (
                  <p className="no-courses-msg">No courses available. Please create a course first.</p>
                ) : (
                  <select
                    value={uploadForm.courseId}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        courseId: e.target.value
                      })
                    }
                    required
                  >
                    <option value="">-- Select a Course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} (ID: {course.id}) - Instructor: {course.instructor}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Video Title</label>
                <input
                  type="text"
                  placeholder="Enter video title"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Select Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      video: e.target.files[0] || null
                    })
                  }
                  required
                />
              </div>
              {uploadForm.video && (
                <p className="file-info">
                  Selected: {uploadForm.video.name} (
                  {(uploadForm.video.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Video"}
              </button>
            </form>
          </div>
        )}

        {/* Upload Materials Tab */}
        {activeTab === "materials" && (
          <div className="tab-content">
            <h2>Upload Study Materials</h2>
            <p className="materials-subtitle">Upload PDFs, documents, images, and other study materials for your courses</p>
            <form onSubmit={handleUploadMaterial} className="form">
              <div className="form-group">
                <label>Select Course</label>
                {courses.length === 0 ? (
                  <p className="no-courses-msg">No courses available. Please create a course first.</p>
                ) : (
                  <select
                    value={materialForm.courseId}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        courseId: e.target.value
                      })
                    }
                    required
                  >
                    <option value="">-- Select a Course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} (ID: {course.id}) - Instructor: {course.instructor}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label>Material Title</label>
                <input
                  type="text"
                  placeholder="e.g., Chapter 1 Notes, Assignment 1, etc."
                  value={materialForm.title}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Select File</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      material: e.target.files[0] || null
                    })
                  }
                  required
                />
                <p className="file-types-hint">Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, PNG, JPG, ZIP, etc.</p>
              </div>
              {materialForm.material && (
                <p className="file-info">
                  📄 Selected: {materialForm.material.name} (
                  {(materialForm.material.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload Material"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {showCourseModal && courseDetails && (
        <div className="modal-overlay" onClick={() => setShowCourseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{courseDetails.course.title}</h2>
              <button className="close-btn" onClick={() => setShowCourseModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="course-info">
                <h3>Course Information</h3>
                <p><strong>Description:</strong> {courseDetails.course.description}</p>
                <p><strong>Instructor:</strong> {courseDetails.course.instructor}</p>
                <p><strong>Course ID:</strong> {courseDetails.course.id}</p>
              </div>

              <div className="enrolled-students">
                <h3>Enrolled Students ({courseDetails.enrolledStudents.length})</h3>
                {courseDetails.enrolledStudents.length === 0 ? (
                  <p className="no-data">No students enrolled yet</p>
                ) : (
                  <div className="students-list">
                    {courseDetails.enrolledStudents.map((enrollment, index) => (
                      <div key={index} className="student-item">
                        <span className="student-id">Student ID: {enrollment.user_id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="course-videos">
                <h3>Course Videos ({courseDetails.videos.length})</h3>
                {courseDetails.videos.length === 0 ? (
                  <p className="no-data">No videos uploaded yet</p>
                ) : (
                  <div className="files-list">
                    {courseDetails.videos.map((video, index) => (
                      <div key={index} className="file-item">
                        <div className="file-info">
                          <h4>🎥 {video.name}</h4>
                          <p>Size: {(video.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p>Uploaded: {new Date(video.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                          Watch Video
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="course-materials">
                <h3>Study Materials ({courseDetails.materials.length})</h3>
                {courseDetails.materials.length === 0 ? (
                  <p className="no-data">No study materials uploaded yet</p>
                ) : (
                  <div className="files-list">
                    {courseDetails.materials.map((material, index) => (
                      <div key={index} className="file-item">
                        <div className="file-info">
                          <h4>📄 {material.name}</h4>
                          <p>Size: {(material.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p>Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                          Download/View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>&copy; 2026 TechTutor - E-Learning Platform</p>
      </footer>
    </div>
  );
}

export default App;

