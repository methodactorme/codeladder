import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Utility for progress bar color
function getProgressBarColor(percentage) {
  if (percentage === 100) return 'bg-gradient-to-r from-green-400 to-green-600';
  if (percentage > 0) return 'bg-gradient-to-r from-blue-400 to-blue-700';
  return 'bg-gray-200';
}

function Ladders() {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [ladders, setLadders] = useState([]);
  const [laddersWithProgress, setLaddersWithProgress] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLadderTitle, setNewLadderTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // Copy ladder state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [sourceTableId, setSourceTableId] = useState('');
  const [newTableTitle, setNewTableTitle] = useState('');
  const [copying, setCopying] = useState(false);

  // Delete ladder state
  const [deleting, setDeleting] = useState(null); // stores table_id being deleted

  useEffect(() => {
    if (!username || !token) {
      navigate('/login');
      return;
    }
    fetchLadders();
    // eslint-disable-next-line
  }, [username, token, navigate]);

  const fetchLadders = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        'https://backendcodeladder-2.onrender.com/ladders',
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-username': username
          }
        }
      );
      setLadders(res.data);

      // Fetch progress for each ladder
      await fetchProgressForLadders(res.data);

      setError('');
    } catch (err) {
      setError('❌ Failed to load ladders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLadder = async (e) => {
    if (e) e.preventDefault();

    const trimmedTitle = newLadderTitle.trim();

    if (!trimmedTitle) {
      setError('❌ Please enter a name for your ladder');
      return;
    }

    if (trimmedTitle.length < 3) {
      setError('❌ Ladder name must be at least 3 characters long');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const response = await axios.post(
        'https://backendcodeladder-2.onrender.com/createtable',
        {
          table_title: trimmedTitle,
          user: username
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-username': username
          }
        }
      );

      if (response.status === 201) {
        setShowCreateModal(false);
        setNewLadderTitle('');
        await fetchLadders();
        setError(`✅ Ladder "${trimmedTitle}" created successfully!`);
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create ladder';
      setError(`❌ ${errorMsg}`);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLadder = async (e) => {
    if (e) e.preventDefault();

    const trimmedSourceId = sourceTableId.trim();
    const trimmedTitle = newTableTitle.trim();

    if (!trimmedSourceId) {
      setError('❌ Please enter a source table ID');
      return;
    }

    if (!trimmedTitle) {
      setError('❌ Please enter a name for the new ladder');
      return;
    }

    if (trimmedTitle.length < 3) {
      setError('❌ Ladder name must be at least 3 characters long');
      return;
    }

    try {
      setCopying(true);
      setError('');

      const response = await axios.post(
        'https://backendcodeladder-2.onrender.com/copytable',
        {
          source_table_id: trimmedSourceId,
          new_table_title: trimmedTitle,
          new_user_id: username
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-username': username
          }
        }
      );

      if (response.status === 201) {
        setShowCopyModal(false);
        setSourceTableId('');
        setNewTableTitle('');
        await fetchLadders();
        setError(`✅ Ladder "${trimmedTitle}" copied successfully!`);
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to copy ladder';
      setError(`❌ ${errorMsg}`);
    } finally {
      setCopying(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewLadderTitle('');
    setError('');
  };

  const handleCloseCopyModal = () => {
    setShowCopyModal(false);
    setSourceTableId('');
    setNewTableTitle('');
    setError('');
  };

  const handleDeleteLadder = async (tableId, tableName) => {
    if (!window.confirm(`Are you sure you want to delete "${tableName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(tableId);
      setError('');

      const response = await axios.delete(
        'https://backendcodeladder-2.onrender.com/deleteladder',
        {
          data: {
            table_id: tableId,
            user_id: username
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'x-username': username
          }
        }
      );

      if (response.status === 200) {
        await fetchLadders();
        setError(`✅ Ladder "${tableName}" deleted successfully!`);
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete ladder';
      setError(`❌ ${errorMsg}`);
    } finally {
      setDeleting(null);
    }
  };

  const fetchProgressForLadders = async (laddersList) => {
    try {
      const laddersWithProgressData = await Promise.all(
        laddersList.map(async (ladder) => {
          if (!ladder.questions || ladder.questions.length === 0) {
            return {
              ...ladder,
              solvedCount: 0,
              totalCount: 0,
              progressPercentage: 0
            };
          }
          const questionPromises = ladder.questions.map(async (qId) => {
            try {
              const res = await axios.get(
                `https://backendcodeladder-2.onrender.com/question/${qId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'x-username': username
                  }
                }
              );
              return res.data;
            } catch {
              return null;
            }
          });
          const questions = await Promise.all(questionPromises);
          const validQuestions = questions.filter(q => q !== null);

          const solvedCount = validQuestions.filter(q =>
            q.solved_by && q.solved_by.includes(username)
          ).length;

          const totalCount = validQuestions.length;
          const progressPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

          return {
            ...ladder,
            solvedCount,
            totalCount,
            progressPercentage
          };
        })
      );
      setLaddersWithProgress(laddersWithProgressData);
    } catch (err) {
      setLaddersWithProgress(laddersList.map(ladder => ({
        ...ladder,
        solvedCount: 0,
        totalCount: ladder.questions?.length || 0,
        progressPercentage: 0
      })));
    }
  };

  const LadderCard = ({ ladder }) => {
    const { table_id, table_title, solvedCount, totalCount, progressPercentage } = ladder;
    return (
      <li
        key={table_id}
        className="group bg-white border border-gray-200 rounded-2xl shadow-md p-6 mb-6 transition-all hover:shadow-lg hover:-translate-y-1 relative cursor-pointer"
        onClick={() => navigate(`/ladder/${table_id}`)}
      >
        {/* Delete Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            handleDeleteLadder(table_id, table_title);
          }}
          disabled={deleting === table_id}
          className="absolute top-3 right-3 rounded-full bg-red-100 hover:bg-red-400 transition-colors w-8 h-8 flex items-center justify-center text-lg text-red-500 hover:text-white font-bold border-none z-10"
          title={`Delete ${table_title}`}
        >
          {deleting === table_id ? (
            <span className="animate-spin">⏳</span>
          ) : (
            '🗑️'
          )}
        </button>

        <h3 className="mb-1 text-xl font-bold text-blue-900 truncate">{table_title}</h3>
        <div className="flex justify-between text-gray-500 text-sm mb-2">
          <span>{totalCount} questions</span>
          <span>
            {solvedCount} solved ({Math.round(progressPercentage)}%)
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 rounded-lg bg-gray-200 overflow-hidden mb-1">
          <div
            className={`${getProgressBarColor(progressPercentage)} h-2 rounded-lg transition-all duration-300`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {progressPercentage === 100 && (
          <div className="mt-2 text-green-600 font-semibold flex items-center text-xs">
            <span className="mr-1">🏆</span> Completed!
          </div>
        )}
        {totalCount > 0 && progressPercentage > 0 && progressPercentage < 100 && (
          <div className="mt-2 text-xs text-gray-500">{totalCount - solvedCount} questions remaining</div>
        )}
      </li>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-3">Your Ladders</h2>
        <p className="text-gray-500">Loading ladders and progress...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="m-0 text-2xl font-bold text-blue-800 flex items-center gap-2">
          📚 <span>Your Ladders</span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCopyModal(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow transition"
          >
            📋 Copy Ladder
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center gap-1 shadow transition"
          >
            ➕ Create New Ladder
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded bg-red-50 text-red-700 font-semibold border border-red-200">
          {error}
        </div>
      )}

      {laddersWithProgress.length === 0 ? (
        <div className="text-center px-8 py-14 bg-gray-50 rounded-lg text-gray-500">
          <p className="text-lg mb-2">No ladders found.</p>
          <p className="text-sm">Create your first ladder to get started!</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 flex flex-col sm:flex-row justify-between text-center gap-4">
            <div>
              <div className="text-lg font-bold text-blue-800">{laddersWithProgress.length}</div>
              <div className="text-xs text-gray-500">Total Ladders</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-800">
                {laddersWithProgress.reduce((sum, l) => sum + (l.totalCount || 0), 0)}
              </div>
              <div className="text-xs text-gray-500">Total Questions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-800">
                {laddersWithProgress.reduce((sum, l) => sum + (l.solvedCount || 0), 0)}
              </div>
              <div className="text-xs text-gray-500">Questions Solved</div>
            </div>
          </div>

          <ul className="list-none p-0">
            {laddersWithProgress.map(ladder => (
              <LadderCard key={ladder.table_id} ladder={ladder} />
            ))}
          </ul>
        </>
      )}

      {/* Create Ladder Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-white p-8 rounded-xl shadow-xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-xl font-bold text-blue-800">Create New Ladder</h3>
            <form onSubmit={handleCreateLadder}>
              <input
                type="text"
                value={newLadderTitle}
                onChange={(e) => setNewLadderTitle(e.target.value)}
                placeholder="Ladder name"
                className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:outline-none text-lg"
                disabled={creating}
                autoFocus
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-lg transition"
              >
                {creating ? 'Creating...' : 'Create Ladder'}
              </button>
            </form>
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-2xl font-bold bg-transparent border-none"
              title="Close"
              aria-label="Close create ladder modal"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Copy Ladder Modal */}
      {showCopyModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={handleCloseCopyModal}
        >
          <div
            className="relative bg-white p-8 rounded-xl shadow-xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-xl font-bold text-blue-800">Copy Ladder</h3>
            <form onSubmit={handleCopyLadder}>
              <input
                type="text"
                value={sourceTableId}
                onChange={(e) => setSourceTableId(e.target.value)}
                placeholder="Source table ID"
                className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:outline-none text-lg"
                disabled={copying}
                autoFocus
              />
              <input
                type="text"
                value={newTableTitle}
                onChange={(e) => setNewTableTitle(e.target.value)}
                placeholder="New ladder name"
                className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:outline-none text-lg"
                disabled={copying}
              />
              <button
                type="submit"
                disabled={copying}
                className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-700 text-white font-bold text-lg transition"
              >
                {copying ? 'Copying...' : 'Copy Ladder'}
              </button>
            </form>
            <button
              onClick={handleCloseCopyModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-2xl font-bold bg-transparent border-none"
              title="Close"
              aria-label="Close copy ladder modal"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ladders;