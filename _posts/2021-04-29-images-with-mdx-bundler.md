---
title: Images with MDX-Bundler
lead: Co-locate and bundle your images with MDX-Bundler!
date: 2021-04-29T21:10:37.426Z
tags:
  - next-js
  - mdx
---

mdx-bundler 3.4.0 has just been released! This new version improves on an
awesome feature of 3.3.0 which allows you to set the current working directory
of the build. With this you can require modules directly and co-locate your
images within the same directory as the post!

This cuts down on your overheads and means that `mdx-bundler` works alot more
like the way mdx does in Gatsby.

## Components

From my [last post](/2021/03/mdx-bundler) I had a `getComponents` function that
ran through the given directory to find any `.ts` or `.tsx` files and read them
into an object that mdx-bundler would understand. This function is now
redundant!

Instead of giving `getComponents` the posts directory I can now set `cwd` in the
options for `bundleMDX` to the posts directory and thats it! Relative imports
are resolved by esbuild like they would in any other file.

You can see from
[this commit](https://github.com/Arcath/arcath.net-next/commit/b11d432d304c3e1a483aa7d58681c79ce2cf2761)
how much I was able to remove from this site now that `cwd` exists.

## Images

Images can be linked to in the same way and with a couple of extra bits of
config they can be made to work extremely well!

Before we can get esbuild to handle the images it needs to know that there are
files to import. Enter
[remark-mdx-images](https://www.npmjs.com/package/remark-mdx-images) which takes
the images in your MDX and turns them into imports, like you would in your .tsx
files.

```js
import image from './image.jpg'
;<img src={image} />
```

So now esbuild knows about the images we need to do something with them, right
now its just going to complain that it doesn't have a loader for the `.jpg` file
type.

To start with the `dataurl` loader will do the job, it inlines all the images as
`dataurl:image/jpg...`. Not the most effecient solution but it does work out of
the box and I used it as a proof of concept.

```js#9-12
const {code} = await bundleMDX(source, {
  cwd: '/posts/directory/on/disk',
  xdmOptions: options => {
    options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkMdxImages]

    return options
  },
  esbuildOptions: options => {
    options.loader = {
      ...options.loader,
      '.jpg': 'dataurl'
    }

    return options
  }
})
```

This _just_ works, but as I said does inline all the images which will result in
some pretty big bundles. The real aim was always the `file` loader which copies
files from the source to the destination.

As the `file` loader is copying files around it needs to know more details about
the resulting environment. At a minimum, where should the files be outputted to
and what url is needed to request them.

```js#9-15
const {code} = await bundleMDX(source, {
  cwd: '/posts/directory/on/disk',
  xdmOptions: options => {
    options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkMdxImages]

    return options
  },
  esbuildOptions: options => {
    options.outdir = '/public/directory/on/disk/img'
    options.loader = {
      ...options.loader,
      '.jpg': 'file'
    }
    options.publicPath = '/img/'
    options.write = true

    return options
  }
})
```

`outdir` is where on disk to write to, `publicPath` is the url to that folder
and most importantly `write` tells `esbuild` that it should output the files
into the `outdir`.

The directories are specific to your site but here I supply a different folder
for each post/page etc... to give an example:

|Content|Post Directory|`outdir`|`publicPath`|
|:------||:-------------|:-------|:-----------|
|[This Post](/2021/04/images-with-mdx-bundler)|`<root>/_content/posts/2021-04-29-images-with-mdx-bundler`|`<root>/public/img/posts/2021/04/images-with-mdx-bundler`|`/img/posts/2021/04/images-with-mdx-bundler`|
|[About Page](/about)|`<root>/_content/pages/`|`<root>/public/img/pages/about`|`/img/pages/about`|

This prevents images from later builds overwriting earlier ones. You have to
remember that each call to `bundleMDX` is isolated so esbuild can't tell if the
image it wants to overwrite is from an another build or from the last time your
site was built.

This has been a big improvement to this site, getting very close now to the
experiance you get from
[gatsby-plugin-mdx](https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/) but in
an entirely platform agnostic way!

MDX-Bundler is going from strength to strength, I'm really happy with the new
features and it's only getting better!
