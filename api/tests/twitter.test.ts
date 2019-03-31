import * as twitter from 'twitter-text/dist';

const tweetText =
  'Hello to @dgraphlabs and @Twitter #dgraph Check us out at https://dgraph.io! #node #tutorial';

describe('twitter', () => {
  test('to extract and parse valid text', () => {
    const text = tweetText;
    const parsed = twitter.parseTweet(text);
    expect(parsed.valid).toBe(true);
    const mentions = twitter.extractMentionsOrListsWithIndices(text);
    expect(mentions).toMatchObject([
      {
        indices: [9, 20],
        listSlug: '',
        screenName: 'dgraphlabs'
      },
      {
        indices: [25, 33],
        listSlug: '',
        screenName: 'Twitter'
      }
    ]);
    const urls = twitter.extractUrlsWithIndices(text);
    expect(urls).toMatchObject([
      {
        indices: [58, 75],
        url: 'https://dgraph.io'
      }
    ]);
    const hashtags = twitter.extractHashtagsWithIndices(text);
    expect(hashtags).toMatchObject([
      {
        indices: [34, 41],
        hashtag: 'dgraph'
      },
      {
        indices: [77, 82],
        hashtag: 'node'
      },
      {
        indices: [83, 92],
        hashtag: 'tutorial'
      }
    ]);
    const linkMentions = twitter.autoLinkUsernamesOrLists(text);
    expect(linkMentions).toEqual(
      'Hello to @<a class="tweet-url username" href="https://twitter.com/dgraphlabs" data-screen-name="dgraphlabs" rel="nofollow">dgraphlabs</a> and @<a class="tweet-url username" href="https://twitter.com/Twitter" data-screen-name="Twitter" rel="nofollow">Twitter</a> #dgraph Check us out at https://dgraph.io! #node #tutorial'
    );
    const link = twitter.autoLink(text);
    expect(link).toEqual(
      'Hello to @<a class="tweet-url username" href="https://twitter.com/dgraphlabs" data-screen-name="dgraphlabs" rel="nofollow">dgraphlabs</a> and @<a class="tweet-url username" href="https://twitter.com/Twitter" data-screen-name="Twitter" rel="nofollow">Twitter</a> <a href="https://twitter.com/search?q=%23dgraph" title="#dgraph" class="tweet-url hashtag" rel="nofollow">#dgraph</a> Check us out at <a href="https://dgraph.io" rel="nofollow">https://dgraph.io</a>! <a href="https://twitter.com/search?q=%23node" title="#node" class="tweet-url hashtag" rel="nofollow">#node</a> <a href="https://twitter.com/search?q=%23tutorial" title="#tutorial" class="tweet-url hashtag" rel="nofollow">#tutorial</a>'
    );
  });

  test('to handle valid and invalid text length', () => {
    const short = tweetText.repeat(1);
    expect(twitter.parseTweet(short).valid).toBe(true);

    const long = tweetText.repeat(5);
    expect(twitter.parseTweet(long).valid).toBe(false);
  });
});
