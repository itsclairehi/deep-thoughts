import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { QUERY_THOUGHTS } from '../utils/queries';
import ThoughtList from '../components/ThoughtList';


const Home = () => {
  //use useQuery hook to make query request
  const { loading, data } = useQuery(QUERY_THOUGHTS)
  //optional chaining syntax. "if data exists, store it in the thoughts const. if data is undefined, save an empty array to thoughts const"
  const thoughts = data?.thoughts || []
//conditionally render thoughtlist component if done loading
  return (
    <main>
      <div className='flex-row justify-space-between'>
        <div className='col-12 mb-3'>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ThoughtList thoughts={thoughts} title ="Some Feed for Thought(s)..." />
          )}
          </div>
      </div>
    </main>
  );
};

export default Home;
