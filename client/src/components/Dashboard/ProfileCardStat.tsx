import React from 'react';

const ProfileCardStat = props => {
  const content = (
    <li className='ProfileCardStats-stat Arrange-sizeFit'>
      <a
        className='ProfileCardStats-statLink u-textUserColor u-linkClean u-block js-nav js-tooltip'
        href='/gabestah'
        data-element-term='tweet_stats'
        data-original-title='29 Tweets'
      >
        <span className='ProfileCardStats-statLabel u-block'>Tweets</span>
        <span
          className='ProfileCardStats-statValue'
          data-count='29'
          data-is-compact='false'
        >
          29
        </span>
      </a>
    </li>
  );

  return content;
};

export default ProfileCardStat;
