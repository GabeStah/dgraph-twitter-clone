import config from '../config';
import * as faker from 'faker';
import logger from './logger';
import * as _ from 'lodash';
import {
  BaseModel,
  BaseModelDeletionMode,
  DgraphAdapterHttp as DgraphAdapter,
  DgraphQueryExecutor,
  Queries,
  Tweet,
  Uid,
  User
} from 'dgraph-query-manager';
import { getRandomElement, getRandomInt, weightedBoolean } from './utility';

/**
 * Miscellaneous generators and testing methods.
 */
export class Generator {
  static async generateInitialData(resetFirst = false) {
    if (resetFirst) {
      const adapter = new DgraphAdapter();
      await adapter.dropAll();
      await adapter.alterSchema(config.dgraph.schema);
    }

    logger.info(`Starting random data generation.`);
    const users: User[] = await this.createUsers(config.generator.userCount);
    // Update a single user
    const primaryUser = getRandomElement(users);
    primaryUser['user.email'] = 'gabe@gabewyatt.com';
    primaryUser['user.screenName'] = 'GabeStah';
    primaryUser['user.name'] = 'Gabe Wyatt';
    primaryUser['user.avatar'] =
      'https://pbs.twimg.com/profile_images/488421746274340864/tVfs2FJs_bigger.png';
    await User.upsert(primaryUser);
    // Assign Tweets to random Users
    const tweets: Tweet[] = await this.createTweets(
      users,
      config.generator.tweetCount
    );

    // Add associations for friends, favorites, and retweets.
    // Select random number of existing tweets/users, up to maximum of half total count.
    for (const user of users) {
      const favorites: Uid[] = _.sampleSize(
        tweets,
        _.random(Math.floor(config.generator.tweetCount / 2))
      ).map(e => e.uid);

      const friends: Uid[] = _.reject(
        _.sampleSize(
          users,
          _.random(Math.floor(config.generator.userCount / 2))
        ),
        other => {
          return user.uid ? user.uid.toString() === other.uid.toString() : true;
        }
      ).map(e => e.uid);

      const retweets: Uid[] = _.sampleSize(
        tweets,
        _.random(Math.floor(config.generator.tweetCount / 2))
      ).map(e => e.uid);

      // Update User with associated nodes.
      await User.insert({
        uid: user.uid ? user.uid.toString() : '',
        'user.favorites': favorites,
        'user.friends': friends,
        'user.retweets': retweets
      });
    }

    // Set Tweet's `inReplyToStatusId` property to another Tweet, based on
    // weighted chance.  If set, also set matching User uid.
    await Tweet.insert(
      _.reduce(
        tweets,
        (accumulator, tweet) => {
          // Decide if should be a reply.
          if (weightedBoolean(config.generator.tweetReplyStatusChance)) {
            // Get random tweet
            const parentTweet = _.sample(tweets);
            if (tweet.uid && parentTweet.uid !== tweet.uid) {
              accumulator.push({
                uid: tweet.uid.toString(),
                'tweet.inReplyToStatusId': parentTweet.uid,
                'tweet.inReplyToUserId': parentTweet['tweet.user'].uid
              });
            }
          }
          return accumulator;
        },
        []
      )
    );

    logger.info(`Random data generation complete.`);
  }

  /**
   * Generate and then create multiple Tweets, optionally associated with User(s).
   * @param user - User(s) to assign authorship of Tweets to.
   *  An array of Users will be randomly selected from.
   * @param count - Number of Tweets to create.
   */
  static async createTweets(user?: User | User[], count = 1): Promise<Tweet[]> {
    const tweets: Tweet[] = [];
    for (let i = 0; i < count; i++) {
      let tempUser;
      if (user) {
        if (Array.isArray(user)) {
          tempUser = _.sample(user);
        } else {
          tempUser = user;
        }
      }
      const generated = Tweet.generateFakeParams(
        _.random(1, 999_999_999),
        undefined,
        tempUser
      );
      // Assign user, if applicable.
      if (user) {
        if (Array.isArray(user)) {
          // Pick random User.
          generated['tweet.user'] = _.sample(user);
        } else {
          generated['tweet.user'] = user;
        }
      }
      tweets.push((await Tweet.create(generated)).response);
    }
    return tweets;
  }

  /**
   * Generate and create multiple Users.
   * @param count - Number of Users to create.
   */
  static async createUsers(count = 1): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      const generated = User.generateFakeParams(getRandomInt(1, 999_999_999));
      users.push((await User.create(generated)).response);
    }
    return users;
  }
}
