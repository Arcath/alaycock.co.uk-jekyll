---
title: Using HTMR to bring life to links in Gatsby
lead: Change the &quot;dead&quot; links in rendered markdown into proper links in Gatsby
date: 2019-05-15T10:12:51.203Z
tags:
  - gatsby
syndication:
  dev: https://dev.to/arcath/using-htmr-to-bring-life-to-links-in-gatsby-1968
---
One of the amazing things about Gatsby is that your site is a full blown React app. Because of this it's always bugged me that whilst the navigation within _app_ is extremely fast anything I link to from my markdown triggers a full request for the page.

This happens because the links in markdown are just an `a` tag placed on the page from `dangerouslySetInnerHTML`. This means no event listeners or anything, just a plain old fashioned link. The solution is to parse the HTML string and swap ot the links for the proper React components.

There are a few HTML to React converters but I found [HTMR](https://github.com/pveyes/htmr) easy to use for my needs. I'm only looking to swap out `a` tags for a `Link` component, not binding events or anything fancy like that.

I already have a `Content` component that takes a `html` prop. I created it for just such a case as this where I want to change the way content is rendered across the whole site.

```typescript
import React, {ReactHTMLElement} from 'react'
import convert from 'htmr'
import {HtmrOptions} from 'htmr/lib/types'
import {OutboundLink} from 'gatsby-plugin-google-gtag'
import {Link} from 'gatsby'

export const Content: React.FunctionComponent<{html: string}> = ({html}) => {
  const transform: HtmrOptions["transform"] = {
    a: (node: Partial<ReactHTMLElement<HTMLAnchorElement>["props"]>) => {
      const {href} = node

      if(href!.substr(0, 4) === 'http'){
        return <OutboundLink href={href!}>{node.children}</OutboundLink>
      }

      return <Link to={href!}>{node.children}</Link>
    }
  }

  return <div>{convert(html, { transform })}</div>
}
```

So what is this doing?

`convert` comes from HTMR and performs the actual conversion. I've put it in a `div` tag here to deal with the edge case of `html` being a string with no tags in it. To bring life to links I used the optional `transform` option that you can pass to the `convert` function. From here you can map tags to other tags e.g. `b: 'strong'` to use `strong` instead of `b` for all `b` tags. Or you can provide a replacement component, `button: Button` to use a styled button instead. The third usage method is to provide a function.

The function is passed a single argument which is the `props` that HTMR would use for the orginal tag.

For Example:
```html
// HTML
<a href="/something">a link</a>
// Props
{href: '/something', children: 'a link'}
```
In the code above I do a check of the `href` prop to see if this is an internal link, or an external link. If its an external link it is replaced with an `OutboundLink` which makes sure Google Analytics handles the link correctly. Otherwise it must be an internal link which gets replaced with a `Link`.

The outcome of all this is much faster internal links.

Take this link to [about me](/about) it is an internal link that is now a proper `Link`. Give it a try and notice how fast it is. This link to my [uses page](https://arcath.net/uses) on the other hand, thats a full blown link and works like internal links did before HTMR.

There is the plugin [gatsby-plugin-catch-links](https://www.gatsbyjs.org/packages/gatsby-plugin-catch-links/) that provides a similar outcome but does it in a very heavy handed way. It binds itself to all links in the browser and on a per-link basis decides if its an internal link and how to navigate to its target. My method with HTMR _fixes_ the links during site build and requires no extra even bindings on the client side. Plus it only applies to the markdown and not other links on the site that are already React components.
