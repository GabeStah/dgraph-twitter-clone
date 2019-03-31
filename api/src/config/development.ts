const development = {
  dgraph: {
    schema: `
hashtag.indices: [int] .
hashtag.hashtag: string @index(exact, fulltext) @count .
hashtag.tweet: uid @count .
tweet.createdAt: dateTime @index(hour) .
tweet.favoriteCount: int @index(int) .
tweet.favorited: bool .
tweet.hashtag: uid @count @reverse .
tweet.inReplyToStatusId: uid @count .
tweet.inReplyToUserId: uid @count .
tweet.isQuoteStatus: bool .
tweet.quotedStatus: uid @count .
tweet.retweetCount: int @index(int) .
tweet.retweeted: bool .
tweet.text: string @index(fulltext) @count @upsert .
tweet.user: uid @count @reverse .
user.avatar: string .
user.createdAt: dateTime @index(hour) .
user.description: string @index(fulltext) @count .
user.email: string @index(exact) @upsert .
user.favouritesCount: int @index(int) .
user.followersCount: int @index(int) .
user.friendsCount: int @index(int) .
user.listedCount: int @index(int) .
user.location: string @index(term) @count .
user.name: string @index(hash) @count .
user.screenName: string @index(term) @count .
user.url: string @index(exact, fulltext) @count .
`
  },
  faker: {
    seed: 1234567890
  }
};

export default development;
