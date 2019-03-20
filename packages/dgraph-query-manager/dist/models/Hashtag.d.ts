import { BaseModel, BaseModelInterface, Tweet } from '../models';
export interface HashtagInterface extends BaseModelInterface {
    'hashtag.hashtag': string;
    'hashtag.indices': [number];
    'hashtag.tweet': Tweet;
}
export declare class Hashtag extends BaseModel<Hashtag> implements HashtagInterface {
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
    constructor(params?: Partial<Hashtag>);
    static createObject(hashtag: string, indices: number[]): object;
    /**
     * Performs all steps of async Hashtag creation.
     * @param {Partial<Hashtag>} params
     * @returns {Promise<Hashtag<Tweet>>}
     */
    static load(params?: Partial<Hashtag>): Promise<Partial<Hashtag>>;
}
