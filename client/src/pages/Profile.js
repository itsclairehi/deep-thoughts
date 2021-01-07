import React from 'react';

import ThoughtList from '../components/ThoughtList';
import ThoughtForm from '../components/ThoughtForm';
import FriendList from '../components/FriendList';

import { ADD_FRIEND } from '../utils/mutations';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { QUERY_USER, QUERY_ME } from '../utils/queries';

import Auth from '../utils/auth';
import { Redirect, useParams } from 'react-router-dom';




const Profile = () => {

  //attach mutation function to variable to be used in onClick
  const [addFriend] = useMutation(ADD_FRIEND);

  //useParams retrieves username from URL
  const { username: userParam } = useParams();

  //assign values to loading and data based on if there's a username in the URL. if so, get data from QUERY_USER, else QUERY_ME
  const { loading, data } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam }
  });

  const user = data?.me || data?.user || {};

  const handleClick = async () => {
    try {
      await addFriend({
        variables: { id: user._id }
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!user?.username) {
    return (
      <h4>
        You need to be logged in to see this page. Use the navigation links above to sign up or log in!
      </h4>
    );
  }

  // redirect to personal profile page if username is the logged-in user's
  if (Auth.loggedIn() && Auth.getProfile().data.username === userParam) {
    return <Redirect to="/profile" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }
//conditionally render addFriend button only when there are user params(i.e not viewing your own profile)
  return (
    <div>
      <div className="flex-row mb-3">
        <h2 className="bg-dark text-secondary p-3 display-inline-block">
          Viewing {userParam ? `${user.username}'s` : 'your'} profile.
        </h2>

    {userParam &&(
        <button className="btn ml-auto" onClick={handleClick}>
          Add Friend
        </button>
        )}
      </div>

      <div className="flex-row justify-space-between mb-3">
        <div className="col-12 mb-3 col-lg-8">
          <ThoughtList thoughts={user.thoughts} title={`${user.username}'s thoughts...`} />
        </div>

        <div className="col-12 col-lg-3 mb-3">
          <FriendList
            username={user.username}
            friendCount={user.friendCount}
            friends={user.friends}
          />
        </div>
      </div>
      <div className="mb-3">{!userParam && <ThoughtForm />}</div>
    </div>
  );
};

export default Profile;
