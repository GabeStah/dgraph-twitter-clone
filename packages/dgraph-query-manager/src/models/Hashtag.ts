import { BaseModel, BaseModelInterface, Tweet, Uid } from '../models';

export interface HashtagInterface extends BaseModelInterface {
  'hashtag.hashtag': string;
  'hashtag.indices': [number];
  'hashtag.tweet': Tweet;
}

export class Hashtag extends BaseModel<Hashtag> implements HashtagInterface {
  /**
   * Name of the hashtag, minus the leading ‘#’ character.
   * @type {string}
   */
  'hashtag.hashtag': string;

  /**
   * An array of integers indicating the offsets within the Tweet text where the hashtag begins and ends.
   * The first integer represents the location of the # character in the Tweet text string.
   * The second integer represents the location of the first character after the hashtag.
   * @type {[number]}
   */
  'hashtag.indices': [number];

  /**
   * The associated tweet containing this hashtag.
   * @type {!Tweet}
   */
  'hashtag.tweet': Tweet;

  // TODO: Factory inverse generate database instances for BaseModel classes without uid
  constructor(params: Partial<Hashtag> = {}) {
    super(params);
    // Override defaults
    Object.assign(this, Hashtag.deserialize(params));
  }

  static createObject(hashtag: string, indices: number[]): object {
    return {
      'hashtag.hashtag': hashtag,
      'hashtag.indices': indices
    };
  }

  /**
   * Performs all steps of async Hashtag creation.
   * @param {Partial<Hashtag>} params
   * @returns {Promise<Hashtag<Tweet>>}
   */
  static async load(params: Partial<Hashtag> = {}): Promise<Partial<Hashtag>> {
    // Combine paramTypes with default properties.
    params = this.injectDefaults(params);
    // Serialize (e.g. convert fields to payload-compatible object)
    params = await this.serialize(params);
    // Perform mutation
    const serialization = await this.insert(params);
    if (!params.uid) {
      params.uid = new Uid(serialization);
    }
    // paramTypes = ().response;
    // Deserialize (e.g. convert payload back to object)
    params = this.deserialize(params);
    return params;
  }
}
