import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const LadderPage = () => {
  const { tableId } = useParams();
  const [ladder, setLadder] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [selectedToRemove, setSelectedToRemove] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [removeSearchQuery, setRemoveSearchQuery] = useState('');
  const [collabSearchQuery, setCollabSearchQuery] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const [newCollaborator, setNewCollaborator] = useState('');
  const [collabMessage, setCollabMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!username || !token) navigate('/login');
  }, [username, token, navigate]);

  useEffect(() => {
    const fetchLadder = async () => {
      try {
        const res = await axios.get(`https://backendcodeladder-2.onrender.com/ladder/${tableId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-username': username
          }
        });
        const ladderData = res.data;
        setLadder(ladderData);
        const userHasAccess = ladderData.user && ladderData.user.includes(username);
        setIsAuthorized(userHasAccess);
        setError(userHasAccess ? null : 'You do not have permission to access this ladder.');
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load ladder');
        setIsLoading(false);
      }
    };
    if (tableId && username && token) fetchLadder();
  }, [tableId, username, token]);

  useEffect(() => {
    if (!ladder || !ladder.questions || !isAuthorized) return;
    const fetchQuestions = async () => {
      try {
        const promises = ladder.questions.map((qId) =>
          axios.get(`https://backendcodeladder-2.onrender.com/question/${qId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-username': username
            }
          }).then(res => res.data)
        );
        const results = await Promise.all(promises);
        setQuestions(results);
      } catch {
        setError('Failed to load question details');
      }
    };
    fetchQuestions();
  }, [ladder, isAuthorized, token, username]);

  const fetchAllQuestions = async () => {
    try {
      const res = await axios.get('https://backendcodeladder-2.onrender.com/problemset', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-username': username
        }
      });
      setAllQuestions(res.data);
    } catch {
      alert('Failed to fetch all questions');
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaborator.trim()) return;
    try {
      await axios.post('https://backendcodeladder-2.onrender.com/collabtable', {
        source_table_id: Number(tableId),
        new_user_id: newCollaborator.trim(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-username': username
        }
      });
      setCollabMessage(`✅ ${newCollaborator} added successfully!`);
      setNewCollaborator('');
      const ladderRes = await axios.get(`https://backendcodeladder-2.onrender.com/ladder/${tableId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-username': username
        }
      });
      setLadder(ladderRes.data);
    } catch (err) {
      setCollabMessage(`❌ Failed to add collaborator: ${err.response?.data?.error || 'Unknown error'}`);
    }
  };

  const handleRemoveCollaborator = async (userToRemove) => {
    try {
      const response = await fetch('https://backendcodeladder-2.onrender.com/removecollab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-username': username
        },
        body: JSON.stringify({ source_table_id: ladder.table_id, user_to_remove: userToRemove }),
      });
      const data = await response.json();
      if (response.ok) {
        setLadder((prev) => ({ ...prev, user: data.users }));
        setCollabMessage(`✅ Removed ${userToRemove} successfully`);
      } else {
        setCollabMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setCollabMessage('❌ Internal error');
    }
  };

  const toggleSelectToAdd = (id) => setSelectedToAdd(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleAddToLadder = async () => {
    try {
      await axios.patch('https://backendcodeladder-2.onrender.com/edittable', {
        table_id: Number(tableId),
        questionIds: selectedToAdd,
        action: 'add',
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-username': username
        }
      });
      setShowAddModal(false);
      setSelectedToAdd([]);
      setSearchQuery('');
      setLadder(prev => ({ ...prev, questions: [...prev.questions, ...selectedToAdd] }));
    } catch {
      alert('Failed to add questions');
    }
  };

  // For remove modal
  const toggleSelectToRemove = (id) =>
    setSelectedToRemove(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  const handleRemoveSelected = async () => {
    try {
      await axios.patch('https://backendcodeladder-2.onrender.com/edittable', {
        table_id: Number(tableId),
        questionIds: selectedToRemove,
        action: 'remove',
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-username': username
        }
      });
      setLadder(prev => ({
        ...prev,
        questions: prev.questions.filter(q => !selectedToRemove.includes(q)),
      }));
      setQuestions(prev => prev.filter(q => !selectedToRemove.includes(q.question_id)));
      setSelectedToRemove([]);
      setShowRemoveModal(false);
      setRemoveSearchQuery('');
    } catch {
      alert('Failed to remove selected questions');
    }
  };

  const handleRemoveSingle = async (questionId) => {
    try {
      await axios.patch('https://backendcodeladder-2.onrender.com/edittable', {
        table_id: Number(tableId),
        questionIds: [questionId],
        action: 'remove',
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-username': username
        }
      });
      setLadder(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q !== questionId),
      }));
      setQuestions(prev => prev.filter(q => q.question_id !== questionId));
    } catch {
      alert('Failed to remove question');
    }
  };

  const handleMarkSolved = async (questionId) => {
    try {
      await axios.patch(`https://backendcodeladder-2.onrender.com/markquestion`, {
        questionid: questionId,
        user: username,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-username': username
        }
      });
      setQuestions(prev =>
        prev.map(q =>
          q.question_id === questionId
            ? { ...q, solved_by: [...(q.solved_by || []), username] }
            : q
        )
      );
    } catch {
      alert('❌ Could not mark as solved');
    }
  };

  const handleUnmark = async (questionId) => {
    try {
      await axios.patch(`https://backendcodeladder-2.onrender.com/unmarkquestion`, {
        questionid: questionId,
        user: username,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-username': username
        }
      });
      setQuestions(prev =>
        prev.map(q =>
          q.question_id === questionId
            ? { ...q, solved_by: (q.solved_by || []).filter(u => u !== username) }
            : q
        )
      );
    } catch {
      alert('❌ Could not unmark the question');
    }
  };

  const filteredQuestions = allQuestions
    .filter(q => !ladder?.questions.includes(q.question_id))
    .filter(q => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(query) ||
        (q.tags && q.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    });

  // For remove modal: filter questions by title/tags in removeSearchQuery
  const questionsToRemove = questions.filter(q => {
    if (!removeSearchQuery) return true;
    const query = removeSearchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      (q.tags && q.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  // For collab modal: filter collaborators
  const filteredCollabs = ladder?.user?.filter(user => {
    if (!collabSearchQuery) return true;
    return user.toLowerCase().includes(collabSearchQuery.toLowerCase());
  }) || [];

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setSearchQuery('');
    setSelectedToAdd([]);
  };

  const handleRemoveModalClose = () => {
    setShowRemoveModal(false);
    setRemoveSearchQuery('');
    setSelectedToRemove([]);
  };

  const handleCollabModalClose = () => {
    setShowCollabModal(false);
    setCollabSearchQuery('');
    setCollabMessage('');
    setNewCollaborator('');
  };

  const solvedCount = questions.filter(q => q.solved_by?.includes(username)).length;
  const totalCount = questions.length;
  const progressPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  // --- Render ---

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg min-h-[60vh] font-inter">
        <h2 className="text-3xl font-extrabold text-gray-700 mb-2 tracking-tight">Loading...</h2>
        <p className="text-lg text-gray-500 mb-6">Please wait while we load the ladder information.</p>
      </div>
    );
  }
  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg min-h-[60vh] font-inter">
        <h2 className="text-3xl font-extrabold text-red-500 mb-2 tracking-tight">🚫 Access Denied</h2>
        <p className="text-lg text-gray-500 mb-6">
          You do not have permission to access this ladder.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-900 transition"
        >
          ← Go Back to Dashboard
        </button>
      </div>
    );
  }
  if (error && isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg min-h-[60vh] font-inter">
        <h2 className="text-3xl font-extrabold text-red-500 mb-2 tracking-tight">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-900 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg min-h-[60vh] font-inter">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-2 tracking-tight">
        {ladder?.table_title || `Table ${tableId}`}
      </h1>
      <div className="text-gray-600 font-medium mb-5 text-lg">
        <span> <b>Grinding </b> </span>
      </div>

       {/* Sleek Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-blue-900 tracking-tight">Progress</span>
            <span className="text-gray-500">
              <span className="font-semibold">{solvedCount}</span> of <span className="font-semibold">{totalCount}</span> solved
              <span className="ml-2 text-sm">({Math.round(progressPercentage)}%)</span>
            </span>
          </div>
          {/* Progress bar: reduced height */}
          <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg transition-all duration-500 flex items-center"
              style={{
                width: `${progressPercentage}%`,
                minWidth: progressPercentage > 0 ? '2rem' : 0,
                background: progressPercentage === 100
                  ? 'linear-gradient(90deg,#22c55e 45%,#16a34a 100%)'
                  : undefined
              }}
            >
              <span className="absolute right-2 text-xs text-white font-bold" style={{ right: 8, top: -18 }}>
                {progressPercentage > 10 && `${Math.round(progressPercentage)}%`}
              </span>
            </div>
          </div>
          {progressPercentage === 100 && (
            <div className="text-center mt-2 text-green-600 font-bold text-lg">
              🎉 Congratulations! You've completed this ladder! 🎉
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => { fetchAllQuestions(); setShowAddModal(true); }}
          className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold hover:from-blue-600 hover:to-blue-900 transition"
        >
          ➕ Add Questions to Ladder
        </button>
        <button
          onClick={() => setShowRemoveModal(true)}
          className={`px-4 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold transition ${
            questions.length === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:from-red-600 hover:to-red-900'
          }`}
          disabled={questions.length === 0}
        >
          ❌ Remove Selected
        </button>
        <button
          onClick={() => setShowCollabModal(true)}
          className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-700 text-white font-semibold hover:from-purple-600 hover:to-blue-900 transition"
        >
          👥 Current Collaborators
        </button>
      </div>

      {/* Dynamic Questions Table */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200 mb-10">
        <table className="w-full table-fixed min-w-[900px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left font-bold text-gray-700 w-16">#</th>
              <th className="py-2 px-4 text-left font-bold text-gray-700 w-2/6">Title</th>
              <th className="py-2 px-4 text-left font-bold text-gray-700 w-2/6">Tags</th>
              <th className="py-2 px-4 text-left font-bold text-gray-700 w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {questions.map((q, idx) => {
              const isSolved = q.solved_by?.includes(username);
              return (
                <tr
                  key={q.question_id}
                  className={isSolved ? "bg-green-50" : "bg-white"}
                  style={{ height: "44px" }}
                >
                  <td className="py-1 px-4 align-middle font-mono text-sm text-gray-500">{idx + 1}</td>
                  <td className="py-1 px-4 align-middle">
                    <a
                      href={q.link}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-800 hover:text-blue-600 transition"
                    >
                      {q.title}
                    </a>
                  </td>
                  <td className="py-1 px-4 align-middle">
                    <div className="flex flex-wrap gap-1">
                      {q.tags && q.tags.length > 0 ? (
                        q.tags.map(tag =>
                          <span key={tag} className="inline-block bg-blue-100 text-blue-900 rounded-full text-xs px-2 py-0.5 font-medium">{tag}</span>
                        )
                      ) : (
                        <span className="text-gray-400 text-base">No tags</span>
                      )}
                    </div>
                  </td>
                  <td className="py-1 px-4 align-middle">
                    <button
                      onClick={() =>
                        isSolved
                          ? handleUnmark(q.question_id)
                          : handleMarkSolved(q.question_id)
                      }
                      className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${isSolved
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'border border-blue-400 bg-white hover:bg-blue-500 hover:text-white text-blue-500'}
                        transition focus:outline-none`}
                      title={isSolved ? 'Unmark as Solved' : 'Mark as Solved'}
                    >
                      {isSolved ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M7.629 14.996a1 1 0 01-.706-.293l-3.63-3.63a1 1 0 111.414-1.414l2.923 2.924 6.293-6.293a1 1 0 111.414 1.414l-7 7a1 1 0 01-.708.292z"/></svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="w-5 h-5"><circle cx="10" cy="10" r="8" strokeWidth="2" /><circle cx="10" cy="10" r="4" strokeWidth="2" /></svg>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add-Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center" onClick={handleAddModalClose}>
          <div className="bg-white rounded-xl p-8 w-[520px] shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-xl mb-3">Select Questions to Add</h3>
            <input
              type="text"
              placeholder="🔍 Search questions by title or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 text-base w-full mb-3"
            />
            <div className="text-gray-400 text-sm mb-2">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
              {searchQuery && ` (filtered from ${allQuestions.filter(q => !ladder?.questions.includes(q.question_id)).length})`}
            </div>
            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded">
              {filteredQuestions.length === 0 ? (
                <div className="p-7 text-center text-gray-400">
                  {searchQuery ? 'No questions match your search.' : 'No questions available to add.'}
                </div>
              ) : (
                filteredQuestions.map(q => (
                  <div
                    key={q.question_id}
                    className="flex justify-between items-center px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div>
                      <div className="font-bold">{q.title}</div>
                      {q.tags && q.tags.length > 0 && (
                        <div className="mt-1">
                          {q.tags.map(tag =>
                            <span key={tag} className="inline-block bg-blue-100 text-blue-900 rounded-full text-xs px-2 py-0.5 mr-1 mb-1 font-medium">{tag}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      onChange={() => toggleSelectToAdd(q.question_id)}
                      checked={selectedToAdd.includes(q.question_id)}
                      className="ml-2 w-5 h-5 accent-blue-500"
                    />
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-base text-gray-500">
                {selectedToAdd.length} selected
              </div>
              <div>
                <button
                  onClick={handleAddToLadder}
                  className={`px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold mr-2 transition ${selectedToAdd.length === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-900'
                    }`}
                  disabled={selectedToAdd.length === 0}
                >
                  ✅ Add Selected ({selectedToAdd.length})
                </button>
                <button
                  onClick={handleAddModalClose}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold hover:from-red-600 hover:to-red-900 transition">
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove-Question Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center" onClick={handleRemoveModalClose}>
          <div className="bg-white rounded-xl p-8 w-[600px] shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-xl mb-3">Select Questions to Remove</h3>
            <input
              type="text"
              placeholder="🔍 Search questions by title or tags..."
              value={removeSearchQuery}
              onChange={(e) => setRemoveSearchQuery(e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 text-base w-full mb-3"
            />
            <div className="text-gray-400 text-sm mb-2">
              {questionsToRemove.length} question{questionsToRemove.length !== 1 ? 's' : ''} found
              {removeSearchQuery && ` (filtered from ${questions.length})`}
            </div>
            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded">
              {questionsToRemove.length === 0 ? (
                <div className="p-7 text-center text-gray-400">
                  {removeSearchQuery ? 'No questions match your search.' : 'No questions available to remove.'}
                </div>
              ) : (
                questionsToRemove.map(q => (
                  <div
                    key={q.question_id}
                    className="flex justify-between items-center px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div>
                      <div className="font-bold">{q.title}</div>
                      {q.tags && q.tags.length > 0 && (
                        <div className="mt-1">
                          {q.tags.map(tag =>
                            <span key={tag} className="inline-block bg-blue-100 text-blue-900 rounded-full text-xs px-2 py-0.5 mr-1 mb-1 font-medium">{tag}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      onChange={() => toggleSelectToRemove(q.question_id)}
                      checked={selectedToRemove.includes(q.question_id)}
                      className="ml-2 w-5 h-5 accent-red-500"
                    />
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-base text-gray-500">
                {selectedToRemove.length} selected
              </div>
              <div>
                <button
                  onClick={handleRemoveSelected}
                  className={`px-4 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold mr-2 transition ${selectedToRemove.length === 0 ? 'opacity-60 cursor-not-allowed' : 'hover:from-red-600 hover:to-red-900'
                    }`}
                  disabled={selectedToRemove.length === 0}
                >
                  ❌ Remove Selected ({selectedToRemove.length})
                </button>
                <button
                  onClick={handleRemoveModalClose}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold hover:from-gray-600 hover:to-gray-800 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collaborators Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center" onClick={handleCollabModalClose}>
          <div className="bg-white rounded-xl p-8 w-[500px] shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-xl mb-3">Current Collaborators</h3>
            <input
              type="text"
              placeholder="🔍 Search collaborators by username..."
              value={collabSearchQuery}
              onChange={(e) => setCollabSearchQuery(e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 text-base w-full mb-3"
            />
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-2">
                {filteredCollabs.length} collaborator{filteredCollabs.length !== 1 ? "s" : ""} found
                {collabSearchQuery && ` (filtered from ${ladder.user.length})`}
              </div>
              <div className="max-h-60 overflow-y-auto border border-gray-100 rounded">
                {filteredCollabs.length === 0 ? (
                  <div className="p-7 text-center text-gray-400">
                    {collabSearchQuery ? 'No collaborators match your search.' : 'No collaborators found.'}
                  </div>
                ) : (
                  filteredCollabs.map((user, idx) => (
                    <div key={user} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition">
                      <div>
                        <span className="font-bold">{user}</span>
                        {idx === 0 && <span className="ml-2 text-blue-600 font-bold">(Owner)</span>}
                        {user === username && <span className="ml-2 text-green-600 font-semibold">(You)</span>}
                      </div>
                      {ladder.user[0] === username && idx !== 0 && (
                        <button
                          onClick={() => handleRemoveCollaborator(user)}
                          className="px-3 py-1 rounded bg-gradient-to-r from-red-500 to-red-700 text-white text-sm font-medium hover:from-red-600 hover:to-red-900 transition"
                        >
                          ❌ Remove
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            {ladder.user[0] === username && (
              <>
                <div className="my-4 border-t pt-4">
                  <input
                    type="text"
                    placeholder="Enter username/email to invite..."
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    className="px-3 py-2 rounded border border-gray-300 text-base w-full mb-2"
                  />
                  <button
                    onClick={handleAddCollaborator}
                    className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold hover:from-blue-600 hover:to-blue-900 transition"
                  >
                    ➕ Add Collaborator
                  </button>
                  {collabMessage && (
                    <div className={`mt-2 text-center font-medium ${collabMessage.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                      {collabMessage}
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="flex justify-end mt-2">
              <button
                onClick={handleCollabModalClose}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-gray-400 to-gray-600 text-white font-semibold hover:from-gray-600 hover:to-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LadderPage;