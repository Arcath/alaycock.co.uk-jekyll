---
title: MDX Bundler with Next.JS
lead: Using MDX Bundler with Next.JS.
date: 2021-03-12T21:10:37.426Z
tags:
  - mdx
  - next-js
---
I've been using [mdx](/2020/03/moving-to-mdx) on this site for a little while now and with my move to [Next.JS](/2021/02/next.js) I went with [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) to compile it. I felt that next-mdx-remote just wasn't quite what I was after. It forced me to do some _odd_ things to get components into MDX and, all in all, felt like MDX was a hindrance more than a help. However it was the only option I could see and it did work to a point so I stuck with it.

Then came [mdx-bundler](https://github.com/kentcdodds/mdx-bundler) which on paper almost sounded too good to be true. It supports import statements and bundling of any dependencies. I jumped to it and swapped out next-mdx-remote for mdx-bundler and got most things working pretty quickly.


## Server Side

MDX Bundler's server side component is `bundleMDX`. This takes your mdx source as a string as well as a few options.

I have all my MDX running through the function `prepareMDX` which is just a middle man between my pages and MDX Bundler. It takes the source MDX and the imported files as arguments. 

```ts
import {bundleMDX} from 'mdx-bundler'

export const prepareMDX = async (source: string, files?: Record<string, string>) => { 
  const {code} = await bundleMDX(source, {
    files
  })

  return code
}
```

`files` is an object that contains the source for files imported in your MDX. This part is very much up to your structure. I have any components used by a post in the same folder as the post so I wrote a `getComponents` function which takes the directory and returns any tsx files in it as `{'./file.tsx': 'content'}`

```ts
import fs from 'fs'
import path from 'path'
import {asyncForEach} from '@arcath/utils'

const {readdir, readFile} = fs.promises

interface Components{[file: string]: string}

export const getComponents = async (directory: string) => {
  const components: Components = {}

  const files = await readdir(directory)

  await asyncForEach(files, async (file) => {
    if(file.substr(-3) === 'tsx'){
      const fileBuffer = await readFile(path.join(directory, file))

      components[`./${file}`] = fileBuffer.toString().trim()
    }
  })

  return components
}
```

Bringing this all together in `getStaticProps` I now fetch the post, its components and then pass that to `prepareMDX`.

```ts
export const getStaticProps = async ({params}: GetStaticPropsContext) => {
  if(params?.slug && params.year && params.month){
    const post = await getPostBySlug([params.year as string, params.month as string, params.slug as string], ['slug', 'title', 'content', 'lead', 'href', 'tags', 'year', 'month', 'day', 'directory'])

    const components = await getComponents(post.directory)

    const source = await prepareMDX(post.content, components)

    return {
      props: {
        post: pick(post, ['slug', 'title', 'lead', 'href', 'tags', 'year', 'month', 'day']),
        source
      }
    }
  }
}
```

<a id="esbuild-executable" />

### Error: spawn \esbuild.exe ENOENT

It appears that Next.JS/Webpack break `__dirname`. This is then causing esbuild to come up with the wrong path for its executable which means builds fail, or should I say development builds fail.

Thankfully esbuilds executable path can be overridden with an environment variable, `ESBUILD_BINARY_PATH`. You could just specify this variable at run time however as it needs to be the full path it will be unique to your computer and maybe hard to set on CI. My solution was to set the variable in Node which only applies it for the duration of the process.

To do this I added this to my `prepareMDX` function.

```ts
if(process.platform === "win32"){
  process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), 'node_modules', 'esbuild', 'esbuild.exe')
}else{
  process.env.ESBUILD_BINARY_PATH = path.join(process.cwd(), 'node_modules', 'esbuild', 'bin', 'esbuild')
}
```

With that I've had no problems on my computer or Vercel and should be portable to any system.

## Client Side

So now `perpareMDX` and `bundleMDX` have done their jobs and got the bundled code to React its time to use it.

MDX Bundler supplies `getMDXComponent` to turn the string of compiled code into something you can mount.

Again I have a single component that takes the source and does everything I need to it. This goes back to when [I started using HTMR](/2019/05/using-htmr-to-bring-life-to-links-in-gatsby) to improve the rendered output so I only need to update the MDX rendering in one place.

```ts
import React, {useMemo} from 'react'
import {getMDXComponent} from 'mdx-bundler/client'

export const MDX: React.FC<{source: any}> = ({source}) => {
  const Component = useMemo(() => getMDXComponent(source), [source])

  return <Component />
}
```

This is a simplified example. I do more here with replacing some components and some shorthands to display MDX with a heading, you can [view the whole file on GitHub](https://github.com/Arcath/arcath.net-next/blob/main/lib/components/mdx.tsx).

There isn't much to show on the pages themselves as this post for example just uses `<MDX source={source} />`.

## More

There is alot more you can do with MDX Bundler, like supplying globals, changing the build target and more. The [Readme](https://github.com/kentcdodds/mdx-bundler#options) has a full list of the options and I encourage you to check it out.

Overall I've been very happy with MDX Bundler and 2.0.0 has fixed my inital issue and brought in quite a few improvements. I encourage you to check it out, it works very well with Next.JS and will work with any framework.
