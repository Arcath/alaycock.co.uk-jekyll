---
title: Write a Utils Library
lead: npm install @arcath/utils
date: 2020-08-28T16:34:12.870Z
tags:
  - typescript
  - node
---
If you [follow me on GitHub](https://github.com/Arcath) you may have seen that one of the repositories that I commit to on a semi regular basis is [Arcath/utils](https://github.com/Arcath/utils). This isn't the only thing I work on but it is the only bit of at-work code that enters the public domain.

Now you might be thinking _why do we need yet another utils library?_ and you'd be right, we don't need another utils library but I wrote one to practice and craft functions that work better for me.

I don't expect or have any designs on `@arcath/utils` becoming an always installed package for anyone other than myself. If it saves anyone time then great I'm glad I shared it but that was never the aim.

I started my own uitls library for a few reasons:

1. I needed some more esoteric functions that where too small for their own package but I still needed them in multiple codebases. (e.g. [rangeAsString](https://utils.arcath.net/globals.html#rangeasstring))
1. I needed to type some functions better. (e.g. [mapProperty](https://utils.arcath.net/globals.html#mapproperty))
1. I wanted to test functions more thoroughly than I could if it was within a bigger project.

It's been quite nice writing functions in a self contained format and focusing on small tasks. The feedback loop on getting them working is really quick and I'm really happy with the way they work.

I'll admit that some of them got used once and never again, the need for some have even been refactored out of the app I wrote them for but again the practice from writing them was good and I have them if I ever need them again I have them.

They are fully documented through TypeDoc at https://utils.arcath.net if anyone wants to use them.

I would reccomend that everyone build a utils library you don't have to release it publically but it is something I've found very helpful. I've enjoyed doing all the testing, documenting and design without any pressure.