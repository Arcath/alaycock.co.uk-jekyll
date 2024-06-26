---
title: CSS Grid Layout
lead: A polished interface for this site using CSS Grid
date: 2020-02-20T21:52:38.292Z
tags:
  - css
---
I've been doing a fair bit of reading on CSS Grid recently and I'm conviced its magic.

I've re-styled this site to use a grid layout which has almost completely removed the need for breakpoints.

The main article layout came from [Dave Geddes' article](https://gedd.ski/post/article-grid-layout/) although I have put my own spin on it. Where as his system had 3 columns mine has 5.


<table>
<thead>
<tr>
<th>0.6rem, 1fr</th>
<th>0.6rem, 1fr</th>
<th>auto, 80ch</th>
<th>0.6rem, 1fr</th>
<th>0.6rem, 1fr</th>
</tr>
</thead>
<tbody>
<tr>
<td></td>
<td></td>
<td>Paragraphs & headings</td>
<td></td>
<td></td>
</tr>
<tr>
<td></td>
<td colSpan="3">Tables & Code Content</td>
<td></td>
</tr>
<tr>
<td colSpan="5">Images</td>
</tr>
</tbody>
</table>

The extra columns allow content like tables, like the one above, to expand outside the normal article width without making them the full page width. Images take up as much width as they need upto the full page width. The code container takes the full width keeping its content at the central 3 columns.

The header, footer and the none markdown content like article lists and the home page expand to the width of tables. I felt that this was the best width for this content. The central columns width is a bit too small to be displaying lists of articles etc... and the central 3 columns give a nice way to have everything in line.

These are all the grids I created to display the site.

```ts
export const Grid = styled.div`
  font-size:1.2rem;
  display:grid;
  grid-template-columns:
    minmax(0.6rem, 1fr)
    minmax(0.6rem, 1fr)
    minmax(auto, 60ch)
    minmax(0.6rem, 1fr)
    minmax(0.6rem, 1fr)
  ;
`

export const BoxGrid = styled.div<{targetWidth: number}>`
  ${({targetWidth}) => {
    return `
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(${targetWidth}px, 1fr));
      grid-gap:10px;
    `
  }}
`

export const WideGrid = styled(Grid)<{wideHeading?: boolean}>`
  h2{
    grid-column:${({wideHeading}) => wideHeading ? '2/5' : '3'};
  }

  & > div{
    grid-column:2/5;
  }
`

export const ArticleGrid = styled(Grid)`
  p, h1, h2, h3, h4, h5, h6, ul, ol, div, blockquote{
    grid-column: 3;
  }

  table{
    grid-column: 2 / 5;
  }

  p.full-width{
    grid-column 1 / 6;
  }

  img{
    grid-column 1 / 6;
  }

  div.gatsby-highlight{
    grid-column: 1 / 6;

    pre{
      display:grid;
      grid-template-columns:
        minmax(0.6rem, 1fr)
        minmax(auto, 90ch)
        minmax(0.6rem, 1fr)
      ;
      }

      code{
        grid-column:2;
      }
  }
`

export const ArticleListGrid = styled.div`
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap:10px;
  width:100%;
`
```

The `ArticleGrid` was the hardest to get working as I wanted. Remark was outputting images wrapped in `p` tags which wasn't helping style them properly. To fix this I needed to tweak the way [htmr modifies the content](/2019/05/using-htmr-to-bring-life-to-links-in-gatsby). The trick here was to inspect the `p` tag it was creating and if its only got a single `img` as a child it adds the `full-width` class.

```ts
{
  p: (node: Partial<ReactHTMLElement<HTMLParagraphElement>["props"]>) => {
      let className = ''

      if((node.children! as any).length === 1 && typeof (node.children! as any)[0] === 'object'){
        className = "full-width"
      }

      return <p {...node} className={className} />
    }
}
```

Overall I'm very happy with how the site is looking CSS grid has been a great addition. The grid has made keeping everything in line so easy. I've deleted quite a few `calc`s that involved adding the padding and margin widths to try and work out where to place an edge.

Dave Geddes' blog has a few more posts [on CSS grid](https://gedd.ski/post/tile-layouts/) that are well worth a read and really helped get this site looking as good as it does now.
