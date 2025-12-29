import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import './Gamification.css';

const GET_BADGES = gql`
  query GetBadges($userId: ID!) {
    badges(userId: $userId) {
      id
      name
      description
      earned
    }
  }
`;

const EARN_BADGE = gql`
  mutation EarnBadge($userId: ID!, $badgeId: ID!) {
    earnBadge(userId: $userId, badgeId: $badgeId) {
      success
      message
    }
  }
`;

const Gamification = ({ userId }) => {
  const { loading, error, data } = useQuery(GET_BADGES, {
    variables: { userId },
  });

  const [earnBadge] = useMutation(EARN_BADGE);
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    if (data) {
      setEarnedBadges(data.badges.filter(badge => badge.earned));
    }
  }, [data]);

  const handleEarnBadge = async (badgeId) => {
    try {
      const { data } = await earnBadge({ variables: { userId, badgeId } });
      if (data.earnBadge.success) {
        alert('Badge earned successfully!');
        setEarnedBadges([...earnedBadges, badgeId]);
      } else {
        alert(data.earnBadge.message);
      }
    } catch (err) {
      console.error('Error earning badge:', err);
      alert('An error occurred while trying to earn the badge.');
    }
  };

  if (loading) return <p>Loading badges...</p>;
  if (error) return <p>Error loading badges: {error.message}</p>;

  return (
    <div className="gamification">
      <h2>Your Badges</h2>
      <ul>
        {data.badges.map(badge => (
          <li key={badge.id} className={badge.earned ? 'earned' : ''}>
            <h3>{badge.name}</h3>
            <p>{badge.description}</p>
            {!badge.earned && (
              <button onClick={() => handleEarnBadge(badge.id)}>Earn Badge</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Gamification;