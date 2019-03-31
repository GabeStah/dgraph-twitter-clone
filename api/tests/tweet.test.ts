import config from '../src/config';
import * as faker from 'faker';
import {
  Tweet,
  Uid,
  User,
  DgraphAdapterHttp as DgraphAdapter,
  Serialization
} from 'dgraph-query-manager';
import logger from '../src/helpers/logger';

let adapter;
const tweetText =
  'Hello to @dgraphlabs and @Twitter #dgraph Check us out at https://dgraph.io! #node #tutorial';

describe('tweet', () => {
  beforeEach(async () => {
    jest.setTimeout(60000);
    // Setup adapter
    adapter = new DgraphAdapter();
    // Drop all data
    await adapter.dropAll();
    // Configure schema
    await adapter.alterSchema(config.dgraph.schema);
    // Set consistent random seed
    const seed = config.faker.seed;
    faker.seed(seed);
  });

  test('can generate tweet', () => {
    const tweet = Tweet.generate();
    expect(tweet).toBeInstanceOf(Tweet);
    expect(tweet).toHaveProperty(['tweet.text']);
    expect(tweet['tweet.text'].length > 1);
  });

  test('can create tweet', async () => {
    const params = Tweet.generateFakeParams();
    const serialization = await Tweet.create(params);
    // expect(serialization).toBeInstanceOf(Serialization);
    expect(serialization).toHaveProperty('response');
    expect(serialization.response).toBeInstanceOf(Tweet);
    expect(serialization.response.uid).toBeDefined();
    expect(serialization.response.uid).toBeInstanceOf(Uid);
  });

  test('can generate user', () => {
    const user = User.generate();
    expect(user).toBeInstanceOf(User);
  });

  test('can create user', async () => {
    const user = User.generate();
    const serialization = await User.create(user);
    // expect(serialization).toBeInstanceOf(Serialization);
    expect(serialization).toHaveProperty('response');
    expect(serialization.response).toBeInstanceOf(User);
    expect(serialization.response.uid).toBeDefined();
    expect(serialization.response.uid).toBeInstanceOf(Uid);
  });

  test('can update tweet', async () => {
    const tweet = Tweet.generate();
    const serialization = await Tweet.create(tweet);
    // expect(serialization).toBeInstanceOf(Serialization);
    expect(serialization).toHaveProperty('response');
    expect(serialization.response).toBeInstanceOf(Tweet);
    expect(serialization.response.uid).toBeDefined();
    expect(serialization.response.uid).toBeInstanceOf(Uid);
    const tweetObject = tweet.toObject();
    expect(tweet).toMatchObject(tweetObject);
  });

  test('can be retrieved from database', async () => {
    const tweetGenerated = Tweet.generate();
    const serializationOriginal = await Tweet.create(tweetGenerated);
    // expect(serializationOriginal).toBeInstanceOf(Serialization);
    expect(serializationOriginal).toHaveProperty('response');
    const tweet = serializationOriginal.response;
    expect(tweet).toBeInstanceOf(Tweet);
    expect(tweet.uid).toBeDefined();
    expect(tweet.uid).toBeInstanceOf(Uid);
    // Find in db
    const serializationFound = await Tweet.find(tweet);
    expect(serializationFound).toBeInstanceOf(Serialization);
    expect(serializationFound).toHaveProperty('response');
    const tweetDb = serializationFound.response;
    expect(tweetDb).toBeInstanceOf(Tweet);
    // Fix up date imprecision due to processing time
    tweetDb['tweet.user']['user.createdAt'].setMilliseconds(
      tweet['tweet.user']['user.createdAt'].getMilliseconds()
    );
    tweetDb['tweet.user']['user.createdAt'].setSeconds(
      tweet['tweet.user']['user.createdAt'].getSeconds()
    );
    expect(tweetDb).toBeInstanceOf(Tweet);
  });

  test('cannot be retrieved without Uid', async () => {
    const mockTweet = Tweet.generate();
    const serialization = await Tweet.create(mockTweet);
    // expect(serialization).toBeInstanceOf(Serialization);
    expect(serialization).toHaveProperty('response');
    const tweet = serialization.response;
    expect(tweet).toBeInstanceOf(Tweet);
    expect(tweet.uid).toBeDefined();
    expect(tweet.uid).toBeInstanceOf(Uid);
    // Try to find generated instance in database (without Uid)
    const serializationFound = await Tweet.find(mockTweet);
    expect(serializationFound).toBeInstanceOf(Serialization);
    expect(serializationFound).toHaveProperty('success');
    expect(serializationFound.success).toBe(false);
    expect(serializationFound.message).toBe(
      'Failed to retrieve tweet via direct GraphQL+ request.'
    );
  });

  test('can be serialized to db and deserialized from db, with User', async () => {
    // Create user in db and return deserialized instance
    const mockUserA = User.generate();
    const userA = (await User.create(mockUserA)).response;
    // Tweet
    const mockTweetA = Tweet.generate();
    // Upsert generated tweet with User property
    const tweetA = (await Tweet.upsert(mockTweetA, {
      'tweet.user': userA
    })).response;
    // Find in db
    const tweetB = (await Tweet.find(tweetA)).response;
    const userB = tweetB['tweet.user'];
    expect(tweetB).toBeInstanceOf(Tweet);
    expect(userB).toBeInstanceOf(User);
    // Compare results
    expect(userB).toMatchObject(userA);
  });

  test('can include hashtags', async () => {
    const tweet = (await Tweet.upsert(Tweet.generate(), {
      'tweet.text': tweetText
    })).response;
    const hashtags = tweet.getHashtags();

    logger.info(`can include hashtags, getHashtags(): %o`, hashtags);
  });
});
