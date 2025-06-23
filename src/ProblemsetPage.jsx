import React, { useEffect, useState } from 'react';
import ContestTable from './components/pages/ContestTable';

const ProblemsetPage = () => {
  const [tableData, setTableData] = useState([]);
  const [contestsJsonRaw, setContestsJsonRaw] = useState({});

  useEffect(() => {
    const loadProblemset = async () => {
      try {
        const res = await fetch('/problemset.json');
        const json = await res.json();

        if (json.status !== 'OK') {
          console.error('Invalid problemset.json structure');
          return;
        }

        const problems = json.result.problems.map(p => ({
          contestId: p.contestId,
          contestName: undefined, // will be set via contest.json in ContestTable
          problemIndex: p.index,
          problemName: p.name,
          problemLink: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
          rating: p.rating || null,
          userStatus: 'NOT_ATTEMPTED', // Static for now
        }));

        setTableData(problems);
      } catch (err) {
        console.error('Failed to fetch problemset.json', err);
      }
    };

    const loadContests = async () => {
      try {
        const res = await fetch('/contest.json');
        const json = await res.json();
        setContestsJsonRaw(json);
      } catch (err) {
        console.error('Failed to fetch contest.json', err);
      }
    };

    loadProblemset();
    loadContests();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Codeforces Problemset</h1>
      <ContestTable tableData={tableData} contestsJsonRaw={contestsJsonRaw} />
    </div>
  );
};

export default ProblemsetPage;