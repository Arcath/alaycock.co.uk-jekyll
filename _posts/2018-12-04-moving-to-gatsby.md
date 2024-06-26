---
title: Moving to Gatsby
lead: Ive moved my site over to Gatsby!
date: 2018-12-04T20:30:00+01:00
tags:
 - gatsby
 - typescript
 - featured
---
![Gatsby Logo](/assets/2018/12/moving-to-gatsby/gatsby.png)

[Gatsby](https://www.gatsbyjs.org/) is you haven't heard about it already is a static site generator that uses React & GraphQL to build pages from your source.

The sites it creates are lightning fast and a bit more than a a static site due to the react components still _working_.

I've used it a couple of times to build some very basic sites for example [my Mums shop](/projects/the-book-lounge) which didn't really require me to dig into how it works. This site is something else, its a full featured blog with a portfolio style system as well.

I had a list of requirements before I started the project which were as follows:

 1. It must maintain the exisiting permalinks for my articles, I've had WordPress quite a while and I don't want to throw 404s or redirects onto the exisitng urls.
 1. It must be easy to edit. I don't want to be looking up documentation every time I add a new post.
 1. It should do more than my WordPress site. The whole point of moving to something more flexible is to be more flexible, If I'm just displaying posts in Gatsby instead of WordPress then there was no point.

I think I've met all those targets and more with this site.

## Why not a WordPress theme.

This is a genuine question, I am a WordPress developer and making themes is a big part of my job. For me WordPress and PHP are something I _have_ to work with, I enjoy it but if I had a choice I would drop it in favour of something else. I also prefer making my front-ends in React which isn't easily shoe-horned into WordPress.

## Typescript

I love Typescript, I've been using it for quite a while on a few projects and it had to be something I used here. Thankfully there are some starters that exist and I chose to use [gatsby-starter-typescript-plus](https://github.com/resir014/gatsby-starter-typescript-plus) which got me up and running straight away. I did have to delete a bunch of config from it as it breaks the most important rule (in my mind) for bootstrap code, it enforces a coding style.

Dont get me wrong I can see why people like:

```typescript
import { foo } from 'bar'

if ( foo.bar === true ) {
  return 0
}
```

but its not my style, and having VSCode reformat my code to that style everytime I save is just fustratring.

For reference I would format that as:

```typescript
import {foo} from 'bar'

if(foo.bar === true){
  return 0
}
```

I'm going to write a bit about Typescript in general soon, I really like it despite its pitfalls.

## The site

I'm really happy with how the site has turned out. Gatsby is incredibly powerful and has been more than up to the job.

This is the first time I've given styled components a real go and they are a huge part of how easy this site was to build. I found it much easier to design the site and make some of its fancier features work as the _css_ had access to the component props.

I've gone for a layout that prioritises the content in a _Medium_ like way. My old site had too many widgets and fluff around the content and I didn't really need it. I really like how _clean_ and easy to use this new site is.

I'm going to make the same pledge I always do when I update my blog and that is to write more and post more content. I have quite a library of photos taken on my Nikon D3300 that I'd like to share.

![More Photography](/assets/2018/12/moving-to-gatsby/photography.jpg)

I've added a new type of content called _notes_ where I will be posting smaller things that don't really deserve thier own post but are worth saying.

## Gatsby

Gatsby took some wrangling, I think I was held back by thinking of it as Jekyll written in javascript, its not. It's so much more.

One of the things that took a bit of getting used to was the Gatsby has no pre-defined folder structure. After `gatsby-config.js` and `gatsby-node.js` its all up to you. My gatsby-node file creates pages for all the markdown content, and the tags ready for the site to be built from my templates.

Gatsby uses Graphql to provide data to the templates which can be a little obscure at times as its not immediatley clear how data maps from your files to the graphql api, and then how you pass the variables the queries.

The source of this site is available on [GitHub](https://github.com/Arcath/arcath.net-gatsby) if you want to have a look at it.

I've found the site created by Gatsby is insanely fast, not just _static HTML_ fast, somehow even faster. I'm using some gatsby plugins to handle the images and performance which are doing some pretty incredible things. Most stuff has a gatsby plugin that _just works_, a dash of config from me and I've got a whole system running without me having to do any actual coding.

I've got more ideas to implement that I will look at in the not to distant future and a few drafts ready to go that I will be publishing soon.
