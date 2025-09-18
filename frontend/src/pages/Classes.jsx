import { React, useEffect, useState } from 'react';
import axios from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate(); // ✅ from react-router

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get("/auth/classes", { withCredentials: true });
        if (response.status === 200) {
          setClasses(response.data);
        }
        console.log("Classes:", response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetch();
  }, []);

  async function enroll(id) {
    try {
      const response = await axios.post(
        "/auth/enroll",
        { classId: id },
        { withCredentials: true }
      );
      if (response.status === 200) {
        alert("Enrolled successfully!");
      }
    } catch (error) {
      console.error("Error enrolling in class:", error);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Available Classes</h1>

      {classes.length > 0 ? (
        classes.map((cls) => (
          <div
            key={cls._id}
            style={{
              border: "1px solid black",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <h2>{cls.name}</h2>
            <p>{cls.description}</p>
            <p>Members: {cls.members?.length || 0}</p>

            <button
              onClick={() => enroll(cls._id)} // ✅ pass correct ID
              style={{
                marginTop: "20px",
                padding: "10px 15px",
                borderRadius: "8px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Enroll
            </button>

            <button
              onClick={() => navigate(`/auth/${cls._id}`)} // ✅ fixed navigation
              style={{
                marginTop: "20px",
                marginLeft: "10px",
                padding: "10px 15px",
                borderRadius: "8px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              View
            </button>
          </div>
        ))
      ) : (
        <p>No classes available.</p>
      )}
    </div>
  );
};

export default Classes;
