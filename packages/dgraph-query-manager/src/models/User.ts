// Lib
import * as faker from 'faker';
// Local
import config from '../config';
import { BaseModel, BaseModelInterface, Uid } from '../models';

export interface UserInterface extends BaseModelInterface {
  'user.createdAt': Date | string;
  'user.description'?: string;
  'user.email': string;
  'user.favouritesCount': number;
  'user.followersCount': number;
  'user.friendsCount': number;
  'user.listedCount': number;
  'user.location'?: string;
  'user.name': string;
  'user.screenName': string;
  'user.url'?: string;
}

export class User extends BaseModel<User> implements UserInterface {
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
   * The number of Tweets this user has liked in the account’s lifetime
   * @type {number}
   */
  'user.favouritesCount': number;

  /**
   * The number of followers this account currently has.
   * @type {number}
   */
  'user.followersCount': number;

  /**
   * The number of users this account is following.
   * @type {number}
   */
  'user.friendsCount': number;

  /**
   * The number of public lists that this user is a member of.
   * @type {number}
   */
  'user.listedCount': number;

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
    if (params['user.createdAt'])
      params['user.createdAt'] = new Date(params['user.createdAt']);
    params = super.deserialize(params);
    return params;
  }

  /**
   * Generates a User instance for testing.
   * @param seed
   */
  static generate(seed: number = config.faker.seed): User {
    return new User(this.generateFakeParams(seed));
  }

  /**
   * Generates a mockup User object for testing.
   * @param seed
   */
  static generateFakeParams(seed: number = config.faker.seed): Partial<User> {
    // Set seed base.
    faker.seed(seed);
    return {
      'user.description': faker.lorem.paragraph(),
      'user.email': faker.internet.exampleEmail(),
      'user.favouritesCount': faker.random.number(),
      'user.followersCount': faker.random.number(),
      'user.friendsCount': faker.random.number(),
      'user.listedCount': faker.random.number(),
      'user.location': faker.fake('{{address.city}}, {{address.country}}'),
      'user.name': faker.name.findName(),
      'user.screenName': faker.internet.userName(),
      'user.url': faker.internet.url()
    };
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
