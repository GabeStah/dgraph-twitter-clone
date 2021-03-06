import { BaseModel, BaseModelInterface, Tweet, Uid } from '../models';

export interface HashtagInterface extends BaseModelInterface {
  'hashtag.hashtag': string;
  'hashtag.indices': [number];
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
    // Deserialize (e.g. convert payload back to object)
    params = this.deserialize(params);
    return params;
  }
}
