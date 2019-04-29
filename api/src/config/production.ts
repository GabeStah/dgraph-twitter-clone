const production = {
  dgraph: {
    schema: `
hashtag.indices: [int] .
hashtag.hashtag: string @index(exact, fulltext) @count .
tweet.createdAt: dateTime @index(hour) .
tweet.hashtag: uid @count @reverse .
tweet.inReplyToStatusId: uid @count .
tweet.inReplyToUserId: uid @count .
tweet.isQuoteStatus: bool .
tweet.quotedStatus: uid @count .
tweet.text: string @index(fulltext) @count @upsert .
tweet.user: uid @count @reverse .
user.avatar: string .
user.createdAt: dateTime @index(hour) .
user.description: string @index(fulltext) @count .
user.email: string @index(exact) @upsert .
user.favorites: uid @count @reverse .
user.friends: uid @count @reverse .
user.location: string @index(term) @count .
user.name: string @index(hash) @count .
user.retweets: uid @count @reverse .
user.screenName: string @index(term) @count .
user.url: string @index(exact, fulltext) @count .
`
  },
  faker: {
    seed: 1234567890
  },
  generator: {
    tweetReplyStatusChance: 0.85,
    userCount: 50,
    tweetCount: 1000
  }
};

export default production;
