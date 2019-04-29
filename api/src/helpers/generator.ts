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
  static async generate() {
    const adapter = new DgraphAdapter();
    await adapter.dropAll();
    await adapter.alterSchema(config.dgraph.schema);
    // Create user
    const user = User.generate();
    // const newUser = new User(user);
    const s = await User.upsert();
    // Create tweets
    const t = Tweet.generate();
    // const tweet: Tweet = Tweet.generate();
    const seed = config.faker.seed;
    faker.seed(seed);
    const tweet: Tweet = new Tweet({
      'tweet.favoriteCount': faker.random.number(),
      'tweet.favorited': faker.random.boolean(),
      // 'tweet.hashtag'?: [Hashtag];
      'tweet.inReplyToStatusId': new Uid(123),
      'tweet.inReplyToUserId': new Uid(456),
      'tweet.isQuoteStatus': faker.random.boolean(),
      // 'tweet.quotedStatus'?: Tweet,
      'tweet.retweetCount': faker.random.number(),
      'tweet.retweeted': faker.random.boolean(),
      'tweet.text': faker.lorem.sentence(),
      'tweet.user': user
    });
    const serialization = await Tweet.create(tweet);
    logger.info('%o', serialization);
    const serialization2 = await Tweet.upsert({
      'tweet.text': faker.lorem.sentence()
    });
    logger.info('%o', serialization2);

    const tweetUpsert: Tweet = new Tweet({
      'tweet.favoriteCount': faker.random.number(),
      'tweet.favorited': faker.random.boolean(),
      // 'tweet.hashtag'?: [Hashtag];
      'tweet.inReplyToStatusId': new Uid(123),
      'tweet.inReplyToUserId': new Uid(456),
      'tweet.isQuoteStatus': faker.random.boolean(),
      // 'tweet.quotedStatus'?: Tweet,
      'tweet.retweetCount': faker.random.number(),
      'tweet.retweeted': faker.random.boolean(),
      'tweet.text': 'Upsertion tweet'
    });
    const serializationUpsert = await Tweet.upsert({
      'tweet.favoriteCount': 987654321
    });

    const tweetDelete = Tweet.generate();
    const serializationDeleteCreate = await Tweet.create(tweetUpsert);

    // tweet in data property.
    const found = await Tweet.find(tweet);
    const found2 = await Tweet.find(tweetDelete);
    // tweet2.delete();
    // Add hashtags
    const blah = false;
  }

  static async generator2() {
    const adapter = new DgraphAdapter();
    await adapter.dropAll();
    await adapter.alterSchema(config.dgraph.schema);
    // const sUser = await User.generate().create();
    // const user = sUser.data;
    const user = User.generate();
    // Tweet
    let tweet = Tweet.generate();
    tweet['tweet.user'] = user;
    // Upsert generated tweet with user value
    const serializationOriginal = await Tweet.upsert(tweet);
    tweet = serializationOriginal.response;
    tweet['tweet.text'] = 'This is a test';
    const serializationUpserted = await Tweet.upsert(tweet);
    // Find in db
    const serializationDb = await Tweet.find(tweet);
    const tweetDb = serializationDb.data;

    const userB = User.generate(98765);
    // Tweet
    // Upsert generated tweet with user value
    const serializationB = await Tweet.upsert({
      'tweet.user': userB
    });
    // Find in db
    const serializationBDb = await Tweet.find(tweet);
    const tweetBDb = serializationDb.data;
    const blah = true;
  }

  static async generator3() {
    const adapter = new DgraphAdapter();
    await adapter.dropAll();
    await adapter.alterSchema(config.dgraph.schema);

    // const sUser = await User.generate().create();
    // const user = sUser.data;
    // // Tweet
    // const tweetA = Tweet.generate();
    // // Upsert generated tweet with user value
    // const serializationOriginal = await tweetA.upsert({
    //     'tweet.user': user
    // });
    // // Find in db
    // const serializationDb = await Tweet.find(tweetA);
    // const tweetDb = serializationDb.data;
    // const blah = true;

    const tweetText =
      'Hello to @dgraphlabs and @Twitter #dgraph Check us out at https://dgraph.io! #node #tutorial';
    const generated = Tweet.generate();
    const serialization = await Tweet.upsert({
      'tweet.text': tweetText
    });
    const tweet = serialization.response;
    const hashtags = tweet.getHashtags();

    logger.info(`can include hashtags, getHashtags(): %o`, hashtags);
  }

  static async generator4() {
    const adapter = new DgraphAdapter();
    await adapter.dropAll();
    await adapter.alterSchema(config.dgraph.schema);

    const tweetText =
      'Hello to @dgraphlabs and @Twitter #dgraph Check us out at https://dgraph.io! #node #tutorial';
    const fakeParams: object = Tweet.generateFakeParams(987654321);
    const fakeUser: object = User.generateFakeParams(18723);
    fakeParams['tweet.text'] = tweetText;
    fakeParams['tweet.user'] = fakeUser;
    // fakeParams['tweet.inReplyToStatusId'] = undefined;
    // fakeParams['tweet.inReplyToUserId'] = undefined;
    const tweet: BaseModel<Tweet> = (await Tweet.create(fakeParams)).response;
    tweet['tweet.text'] = 'Something else';
    // const tweet2 = await Tweet.upsert(tweet);
    const tweet2 = await Tweet.upsert(tweet);
    // const hashtags = tweet.getHashtags();

    logger.info(`Generator4, tweet: %o`, tweet);
  }

  static async generator5() {
    const adapter = new DgraphAdapter();
    await adapter.dropAll();
    await adapter.alterSchema(config.dgraph.schema);

    const tweetText =
      'Hello to @dgraphlabs and @Twitter #dgraph Check us out at https://dgraph.io! #node #tutorial';
    const fakeParams: object = Tweet.generateFakeParams(987654321);
    const fakeUser: object = User.generateFakeParams(18723);
    fakeParams['tweet.text'] = tweetText;
    fakeParams['tweet.user'] = fakeUser;
    // fakeParams['tweet.inReplyToStatusId'] = undefined;
    // fakeParams['tweet.inReplyToUserId'] = undefined;
    const tweet = (await Tweet.create(fakeParams)).response;
    // const deleted = await Tweet.delete(tweet, BaseModelDeletionMode.Edge, 'tweet.user').catch((e) => {
    //     logger.error(`Tweet.delete error: %o`, e);
    // });
    const deleted = await tweet.deleteThis().catch(e => {
      logger.error(`Tweet.delete error: %o`, e);
    });
    const json = `{
	"tweet.hashtag": null,
	"uid": "${tweet.uid.toString()}"
}`;
    logger.info(`json test: %o`, JSON.parse(json));
    // const deletedJson = await Tweet.delete(json).catch((e) => {
    //     logger.error(`Tweet.delete error: %o`, e);
    // });
    //
    // const deleted = await Tweet.delete(tweet.uid).catch((e) => {
    //     logger.error(`Tweet.delete error: %o`, e);
    // });
    // const tweet = (await Tweet.generate().upsert({
    //     'tweet.text': tweetText
    // })).data;
    // const hashtags = tweet.getHashtags();

    logger.info(`Generator5, tweet: %o`, tweet);
  }

  static async generator6() {
    const adapter = new DgraphAdapter();
    await adapter.dropAll();
    await adapter.alterSchema(config.dgraph.schema);

    const tweetText =
      'Hello to @dgraphlabs and @Twitter #dgraph Check us out at https://dgraph.io! #node #tutorial';
    const fakeParams: object = Tweet.generateFakeParams(987654321);
    const fakeUser: object = User.generateFakeParams(18723);
    fakeParams['tweet.text'] = tweetText;
    fakeParams['tweet.user'] = fakeUser;
    // fakeParams['tweet.inReplyToStatusId'] = undefined;
    // fakeParams['tweet.inReplyToUserId'] = undefined;
    const tweet = (await Tweet.create(fakeParams)).response;
    // const deleted = await Tweet.delete(tweet, BaseModelDeletionMode.Edge, 'tweet.user').catch((e) => {
    //     logger.error(`Tweet.delete error: %o`, e);
    // });
    const found = await Tweet.find(tweet);
    const json = `{
	"tweet.hashtag": null,
	"uid": "${tweet.uid.toString()}"
}`;
    logger.info(`json test: %o`, JSON.parse(json));
    // const deletedJson = await Tweet.delete(json).catch((e) => {
    //     logger.error(`Tweet.delete error: %o`, e);
    // });
    //
    // const deleted = await Tweet.delete(tweet.uid).catch((e) => {
    //     logger.error(`Tweet.delete error: %o`, e);
    // });
    // const tweet = (await Tweet.generate().upsert({
    //     'tweet.text': tweetText
    // })).data;
    // const hashtags = tweet.getHashtags();

    logger.info(`Generator5, tweet: %o`, tweet);
  }

  static async generator7() {
    const adapter = new DgraphAdapter();
    await adapter.dropAll();
    await adapter.alterSchema(config.dgraph.schema);

    const tweetText =
      'Hello to @dgraphlabs and @Twitter #dgraph Check us out at https://dgraph.io! #node #tutorial';
    const genUserA = User.generateFakeParams(1);
    genUserA['user.email'] = 'gabe@gabewyatt.com';
    const userA = (await User.create(genUserA)).response;
    const userB = (await User.create(User.generateFakeParams(2))).response;
    let tweet;
    for (let i = 0; i < 20; i++) {
      const fakeParams: object = Tweet.generateFakeParams(i);
      fakeParams['tweet.user'] = Math.random() >= 0.5 ? userA : userB;
      fakeParams['tweet.text'] =
        Math.random() >= 0.8 ? tweetText : fakeParams['tweet.text'];
      tweet = (await Tweet.create(fakeParams)).response;
    }

    // await DgraphQueryExecutor.build(queries.Tweet.find, { $id: '0x30e35' })
    const executor = new DgraphQueryExecutor(Queries.Tweet.getAllForUser, {
      $id: userA.uid.toString()
    });
    const serialization = await executor.execute();
  }

  static async generator8() {
    const adapter = new DgraphAdapter();
    await adapter.dropAll();
    await adapter.alterSchema(config.dgraph.schema);

    const users = await this.createUsers(5);
    // Update a single user
    const primaryUser = getRandomElement(users);
    primaryUser['user.email'] = 'gabe@gabewyatt.com';
    primaryUser['user.screenName'] = 'GabeStah';
    primaryUser['user.name'] = 'Gabe Wyatt';
    await User.upsert(primaryUser);
    // Assign Tweets to random Users
    const tweets = await this.createTweets(users, 50);
    // Create random children
    for (const tweet of tweets) {
      // Decide if should be a reply (25% chance)
      if (weightedBoolean(config.generator.tweetReplyStatusChance)) {
        // Get random tweet
        const parentTweet = getRandomElement(tweets);
        if (parentTweet.uid !== tweet.uid) {
          // Assign other Uid tweets
          tweet['tweet.inReplyToStatusId'] = parentTweet.uid;
          // Upsert changes.
          await Tweet.upsert(tweet);
        }
      }
    }
  }

  static async generator9() {
    const adapter = new DgraphAdapter();
    await adapter.dropAll();
    await adapter.alterSchema(config.dgraph.schema);

    logger.info(`Starting random data generation.`);
    const users = await this.createUsers(config.generator.userCount);
    // Update a single user
    const primaryUser = getRandomElement(users);
    primaryUser['user.email'] = 'gabe@gabewyatt.com';
    primaryUser['user.screenName'] = 'GabeStah';
    primaryUser['user.name'] = 'Gabe Wyatt';
    primaryUser['user.avatar'] =
      'https://pbs.twimg.com/profile_images/488421746274340864/tVfs2FJs_bigger.png';
    await User.upsert(primaryUser);
    // Assign Tweets to random Users
    const tweets = await this.createTweets(users, config.generator.tweetCount);
    // Create random children
    for (const tweet of tweets) {
      // Decide if should be a reply (25% chance)
      if (weightedBoolean(config.generator.tweetReplyStatusChance)) {
        // Get random tweet
        const parentTweet = getRandomElement(tweets);
        if (parentTweet.uid !== tweet.uid) {
          // Assign other Uid tweets
          tweet['tweet.inReplyToStatusId'] = parentTweet.uid;
          // Upsert changes.
          await Tweet.upsert(tweet);
        }
      }
    }
    logger.info(`Random data generation complete.`);
  }

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

    // follower: someone following USER (reverse from user.friend)
    // user.friends: uids of USERS the USER is following
    // user.favorites: uids of TWEETS USER has favorited
    // user.retweets: uids of TWEETS USER have retweeted

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
