---
title: 'Building a Twitter Clone with Dgraph and React - Part 1: The Architecture'
date: 2019-03-24T10:42:34-07:00
draft: false
# url: 'building-twitter-clone-with-dgraph-react-part-1-architecture'
---

<script type="text/javascript">window.DGRAPH_ENDPOINT = "http://127.0.0.1:8080/query?latency=true";</script>
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/languages/typescript.min.js"></script>

Graph databases like Dgraph provide fast and efficient data querying, even across complex, hierarchical data. This capability offers significant advantages over more traditional relational databases, as data creation is not enforced by a rigid schema, and data retrieval is as dynamic and fluid as your application requires. Dgraph expands on these capabilities by providing out-of-the-box horizontally-distributed scaling via sharded storage and query processing, combining the flexibility of the graph databases with unprecedented speed.

While having that much power at your disposal is all well and good, it can be difficult to grasp how many modern applications might integrate with and use a graph database like Dgraph. In this series, we'll explore a real-world Twitter clone application that was created entirely around its integration with Dgraph. Throughout this guide, you'll see how the [`dgraph-twitter-clone`](https://github.com/GabeStah/dgraph-twitter-clone) is designed and structured to work with Dgraph and produce an end product that mimics Twitter while having access to the powerful data manipulation capabilities provided by Dgraph. Whether performing queries and transactions directly with the Dgraph server or performing tasks indirectly through an API middleware, the `dgraph-twitter-clone` app illustrates how a modern JavaScript app can take full advantage of Dgraph and the GraphQL+- query language.

You're encouraged to install the repo and play with the application code yourself or feel free to just read and follow along with the guide as we walk through the major features and structure of this app and how it utilizes Dgraph to create a Twitter-like single page application. Below is a short animation showing the client application we've created. Let's get into it!

![Dgraph Twitter Client](/images/dgraph-twitter-client.gif)

{{< include file="/content/sections/1.md" markdown="true" >}}

{{< include file="/content/sections/2.md" markdown="true" >}}

{{< include file="/content/sections/3.md" markdown="true" >}}

{{< include file="/content/sections/4.md" markdown="true" >}}

{{< include file="/content/sections/5.md" markdown="true" >}}
