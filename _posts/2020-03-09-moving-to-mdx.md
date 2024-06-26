---
title: Moving to MDX
lead: Adding dynamic content to my posts with MDX.
date: 2020-03-09T21:10:37.426Z
tags:
  - gatsby
---
[MDX](https://mdxjs.com/) if you haven't heard of it is an amazing merging between markdown and jsx. It allows you to import and use React components in your markdown, this makes for some amazing posts like [this one](https://kentcdodds.com/blog/avoid-the-test-user) by Kent C. Dodds.

I want to add it here so I was going to write up how to add MDX to a Gatsby site that already has a wide range of posts and content.

To start with lets install MDX.

```bash
npm install --save gatsby-plugin-mdx @mdx-js/mdx @mdx-js/react
```

So I already have a loads of Gatsby Remark plugins configured for my images and code blocks which I'd like to keep. Thankfully `gatsby-plugin-mdx` already supports all `gatsby-transformer-remark` plugins out of the box.

At first I thought about running both mdx and markdown side by side but this idea was going to take far more work than it would to simply swap everything to MDX. To that end I removed `gatsby-transformer-remark` from my config and renamed every `.md` file to `.mdx` a task made trivial with [power rename](https://github.com/microsoft/PowerToys/tree/master/src/modules/powerrename).

It's now a case of changing every `allMarkdownRemark` and `markdownRemark` query to `allMdx` and `mdx` respectively. I also need to replace the `html` in my queries with `body` to get the mdx render function.

I used [HTMR to enchance my markdown](/2019/05/using-htmr-to-bring-life-to-links-in-gatsby) and this is no longer needed as the MDX rendering components can do the same job. My `Content` component now looks like this:

{% highlight typescript %}
{% raw %}
import React, {ReactHTMLElement} from 'react'
import {OutboundLink} from 'gatsby-plugin-google-gtag'
import {Link} from 'gatsby'
import {MDXProvider} from "@mdx-js/react"
import {MDXRenderer} from 'gatsby-plugin-mdx'

const Anchor = (props: ReactHTMLElement<HTMLAnchorElement>["props"]) => {
  const {href} = props

  if(href!.substr(0, 4) === 'http'){
    return <OutboundLink href={href!}>{props.children}</OutboundLink>
  }

  return <Link to={href!}>{props.children}</Link>
}

const Paragraph = (node: Partial<ReactHTMLElement<HTMLParagraphElement>["props"]>) => {
  let className = ''

  if(
    node.children
    &&
    (
      (
        (node.children as any)[0]
        &&
        (node.children as any)[0].props
        &&
        (node.children as any)[0].props.className === 'gatsby-resp-image-wrapper'
      )
      ||
      (
        (node.children as any).props
        &&
        (node.children as any).props.className === 'gatsby-resp-image-wrapper'
      )
    )
  ){
    className = "full-width"
  }

  return <p {...node} className={className} />
}

export const Content: React.FC<{mdx: string}> = ({mdx}) => {
  return <MDXProvider
    components={{
      a: Anchor,
      p: Paragraph
    }}
  >
    <MDXRenderer>{mdx}</MDXRenderer>
  </MDXProvider>
}
{% endraw %}
{% endhighlight %}

Which is pretty similar to the old system, the paragraph tag modifications are from when I moved over to a [css grid layout](/2020/02/css-grid-layout). A slight tweak to each page to rename the `html` to `mdx` on the `Content` component.

So now I can import React components and use them in my posts. As a simple example here is a counter component. It's using `useState` to keep track of the count and prooves just how much power I have now with MDX.

import Demo from './demo'

<Demo />

I did fall into a trap that Gatsby needs to be restarted for MDX to import files, I spent an embarrasingly long time trying to work out why I was getting errors.

You can view the [full commit on GitHub](https://github.com/Arcath/arcath.net-gatsby/commit/4dac6e26813a19409c5356c7bf0a1f77d87551d2) which shows all the work that went into moving over to MDX. Most of the commit is renaming `*.md` to `*.mdx` but the `tsx` and `ts` file changes will be of interest.

I have some ideas for the new features that MDX will let me use and you will be seeing some posts shortly that use them.
