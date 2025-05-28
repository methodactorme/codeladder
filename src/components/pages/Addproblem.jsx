import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

function Addproblem() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!username || !token) navigate('/login');
  }, [username, token, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    link: '',
    tags: ''
  });
  const [message, setMessage] = useState('');
  const [csvUploadMessage, setCsvUploadMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    try {
      await axios.post('https://backendcodeladder-2.onrender.com/addquestion', {
        title: formData.title,
        link: formData.link,
        tags: tagsArray
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-username': username
        }
      });

      setMessage('✅ Question added successfully!');
      setFormData({ title: '', link: '', tags: '' });
    } catch (error) {
      const errMsg = error.response?.data?.error || '❌ Server error';
      setMessage(errMsg);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
          const { title, link, tags } = row;
          if (!title || !link) {
            errorCount++;
            continue;
          }

          const tagsArray = tags?.split(',').map(tag => tag.trim()).filter(tag => tag !== '') || [];

          try {
            await axios.post('https://backendcodeladder-2.onrender.com/addquestion', {
              title,
              link,
              tags: tagsArray
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
                'x-username': username
              }
            });
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }

        setCsvUploadMessage(`✅ ${successCount} uploaded, ❌ ${errorCount} failed`);
      },
      error: (err) => {
        setCsvUploadMessage('❌ Failed to parse CSV');
        console.error(err);
      }
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Add New Problem</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="url"
          name="link"
          placeholder="Problem Link"
          value={formData.link}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Submit</button>
      </form>
      {message && <p style={{ marginTop: 15 }}>{message}</p>}

      <hr style={{ margin: '30px 0' }} />

      <h3>Bulk Upload via CSV</h3>
      <input
        type="file"
        accept=".csv"
        onChange={handleCSVUpload}
        style={{ marginBottom: 10 }}
      />
      {csvUploadMessage && <p>{csvUploadMessage}</p>}
    </div>
  );
}

export default Addproblem;