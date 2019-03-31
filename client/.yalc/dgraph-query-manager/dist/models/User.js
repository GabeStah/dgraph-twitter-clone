'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// Lib
const faker = require('faker');
// Local
const config_1 = require('../config');
const models_1 = require('../models');
class User extends models_1.BaseModel {
  constructor(params = {}) {
    super(params);
    /**
     * UTC time when this User was created.
     * @type {Date}
     */
    this['user.createdAt'] = new Date();
    // Override defaults
    Object.assign(this, User.deserialize(params));
  }
  /**
   * Deserialize User object.
   * @param params
   */
  static deserialize(params = {}) {
    if (params['user.createdAt'])
      params['user.createdAt'] = new Date(params['user.createdAt']);
    params = super.deserialize(params);
    return params;
  }
  /**
   * Generates a User instance for testing.
   * @param seed
   * @param params
   */
  static generate(seed = config_1.default.faker.seed, params) {
    return new User(this.generateFakeParams(seed, params));
  }
  /**
   * Generates a mockup User object for testing.
   * @param seed
   * @param params
   */
  static generateFakeParams(seed = config_1.default.faker.seed, params) {
    // Set seed base.
    faker.seed(seed);
    const max = 1000;
    return Object.assign(
      {
        'user.avatar': faker.image.avatar(),
        'user.description': faker.lorem.paragraph(),
        'user.email': faker.internet.exampleEmail(),
        'user.favouritesCount': faker.random.number(max),
        'user.followersCount': faker.random.number(max),
        'user.friendsCount': faker.random.number(max),
        'user.listedCount': faker.random.number(max),
        'user.location': faker.fake('{{address.city}}, {{address.country}}'),
        'user.name': faker.name.findName(),
        'user.screenName': User.generateValidUsername(),
        'user.url': faker.internet.url()
      },
      params
    );
  }
  /**
   * Generates a valid random username.
   */
  static generateValidUsername() {
    let name = faker.internet.userName();
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
  static async load(params = {}) {
    // Combine params with default properties.
    params = this.injectDefaults(params);
    // Serialize (e.g. convert fields to payload-compatible object)
    params = await this.serialize(params);
    // Perform mutation (e.g. upsert)
    const serialization = await this.insert(params);
    if (!params.uid) {
      params.uid = new models_1.Uid(serialization);
    }
    // Deserialize (e.g. convert payload back to object)
    params = this.deserialize(params);
    return params;
  }
}
exports.User = User;

//# sourceMappingURL=User.js.map
