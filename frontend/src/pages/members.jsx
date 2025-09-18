import { React, useEffect, useState } from 'react';
import axios from '../utils/api';
import { useParams } from 'react-router-dom';

const Members = () => {
  const [members, setMembers] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    async function fetchMembers() {
      try {
        const parti = await axios.get(`/auth/${id}`, { withCredentials: true });
        setMembers(parti.data);
        console.log(parti.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch members. Please try again.");
      }
    }
    fetchMembers();
  }, [id]); // ✅ depends only on id

  return (
    <div>
      {members.length > 0 ? (
        members.map((m) => <p key={m._id}>{m.name},{m.email}</p>)
      ) : (
        <p>No members found.</p>
      )}
    </div>
  );
};

export default Members;
