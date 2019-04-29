// Lib
import * as faker from 'faker';
// Local
import config from '../config';
import { BaseModel, BaseModelInterface, Hashtag, Tweet, Uid } from '../models';

export interface UserInterface extends BaseModelInterface {
  'user.avatar': string;
  'user.createdAt': Date | string;
  'user.description'?: string;
  'user.email': string;
  'user.favorites': Tweet[];
  'user.friends': User[];
  'user.location'?: string;
  'user.name': string;
  'user.retweets': Tweet[];
  'user.screenName': string;
  'user.url'?: string;
}

export class User extends BaseModel<User> implements UserInterface {
  /**
   * User avatar url.
   * @type{string}
   */
  'user.avatar': string;

  /**
   * UTC time when this User was created.
   * @type {Date}
   */
  'user.createdAt': Date = new Date();

  /**
   * The user-defined UTF-8 string describing their account.
   * @type {?string}
   */
  'user.description'?: string;

  /**
   * Email address of this user.
   * @type {string}
   */
  'user.email': string;

  /**
   * Favorited Tweets.
   */
  'user.favorites': Tweet[] = [];

  /**
   * Users that are being followed.
   */
  'user.friends': User[] = [];

  /**
   * The user-defined location for this account’s profile. Not necessarily a location, nor machine-parseable.
   * @type {?string}
   */
  'user.location'?: string;

  /**
   * The key of the user, as they’ve defined it.
   * @type {string}
   */
  'user.name': string;

  /**
   * Tweets that have been retweeted.
   */
  'user.retweets': Tweet[] = [];

  /**
   * The screen key, handle, or alias that this user identifies themselves with.
   * @type {string}
   */
  'user.screenName': string;

  /**
   * A URL provided by the user in association with their profile.
   * @type {?string}
   */
  'user.url'?: string;

  constructor(params: Partial<User> = {}) {
    super(params);
    // Override defaults
    Object.assign(this, User.deserialize(params));
  }

  /**
   * Deserialize User object.
   * @param params
   */
  static deserialize<User>(params: Partial<User | any> = {}): Partial<User> {
    if (params['user.createdAt']) {
      params['user.createdAt'] = new Date(params['user.createdAt']);
    }
    if (params['user.favorites'] && params['user.favorites'].length > 0) {
      params['user.favorites'] = params['user.favorites'].map(
        tweet => new Tweet(tweet)
      );
    }
    if (params['user.friends'] && params['user.friends'].length > 0) {
      params['user.friends'] = params['user.friends'].map(
        user => new User(user)
      );
    }
    if (params['user.retweets'] && params['user.retweets'].length > 0) {
      params['user.retweets'] = params['user.retweets'].map(
        tweet => new Tweet(tweet)
      );
    }
    params = super.deserialize(params);
    return params;
  }

  /**
   * Generates a User instance for testing.
   * @param seed
   * @param params
   */
  static generate(
    seed: number = config.faker.seed,
    params?: Partial<User>
  ): User {
    return new User(this.generateFakeParams(seed, params));
  }

  /**
   * Generates a mockup User object for testing.
   * @param seed
   * @param params
   */
  static generateFakeParams(
    seed: number = config.faker.seed,
    params?: Partial<User>
  ): Partial<User> {
    // Set seed base.
    faker.seed(seed);
    const max = 1000;
    return {
      'user.avatar': faker.image.avatar(),
      'user.description': faker.lorem.paragraph(),
      'user.email': faker.internet.exampleEmail(),
      'user.location': faker.fake('{{address.city}}, {{address.country}}'),
      'user.name': faker.name.findName(),
      'user.screenName': User.generateValidUsername(),
      'user.url': faker.internet.url(),
      ...params
    };
  }

  /**
   * Generates a valid random username.
   */
  private static generateValidUsername() {
    let name: string = faker.internet.userName();
    if (name.includes('.')) {
      name = User.generateValidUsername();
    }
    return name;
  }

  /**
   * Performs all steps of async User creation.
   * @param {Partial<User>} params
   * @returns {Promise<User<Tweet>>}
   */
  static async load(params: Partial<User> = {}): Promise<Partial<User>> {
    // Combine params with default properties.
    params = this.injectDefaults(params);
    // Serialize (e.g. convert fields to payload-compatible object)
    params = await this.serialize(params);
    // Perform mutation (e.g. upsert)
    const serialization = await this.insert(params);
    if (!params.uid) {
      params.uid = new Uid(serialization);
    }
    // Deserialize (e.g. convert payload back to object)
    params = this.deserialize(params);
    return params;
  }
}
