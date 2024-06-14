---
title: Setting up lunr.js in Jekyll
lead: In-Website searching for Jekyll using lunr.js
date: 2016-02-23T12:50:00+00:00
tags:
 - jekyll
---
[lunrjs](http://lunrjs.com/) is a client side search system that is perfectly suited for [Jekyll](http://jekyllrb.com/) and other static site systems.

Setting it up in Jekyll without any plugins (so it works on [Github Pages](https://pages.github.com/)) isn’t that hard only needs a couple of extra files and some Javascript. You can see the commit used to add lunr to this site [here](https://github.com/Arcath/arcath.github.io/commit/bc5b277393ae2c0a65054f9a21156dcee739a197).

First off I needed a JSON file with all the data I want to make searchable in, I created `/content.json` which is generated by this:

```json
{
    {% for entry in site.posts %}
        "{{ entry.url | slugify }}": {
            "title": "{{ entry.title | xml_escape }}",
            "url": "{{ entry.url | xml_escape }}",
            "summary": "{{ entry.content | strip_html | strip_newlines | truncatewords: 50 | xml_escape }}"
        },
    {% endfor %}
    {% for entry in site.pages %}
        "{{ entry.url | slugify }}": {
            "title": "{{ entry.title | xml_escape }}",
            "url": "{{ entry.url | xml_escape }}.html",
            "summary": "{{ entry.content | strip_html | strip_newlines | truncatewords: 50 | xml_escape }}"
        }
        {% unless forloop.last %},{% endunless %}
    {% endfor %}
}
```
I had issues getting the content safe for JSON, mainly with gists adding html etc… it got messy and I ended up truncating the number of words to 50 hoping that I wouldn’t have any special content in my posts in the first 50 words.

With lunr added to the template I added `loadSearch()` to the documents ready event to load search after the page has loaded.

```js
function loadSearch(){
    // Create a new Index
    idx = lunr(function(){
        this.field('id')
        this.field('title', { boost: 10 })
        this.field('summary')
    })

    // Send a request to get the content json file
    $.getJSON('/content.json', function(data){

        // Put the data into the window global so it can be used later
        window.searchData = data

        // Loop through each entry and add it to the index
        $.each(data, function(index, entry){
            idx.add($.extend({"id": index}, entry))
        })
    })

    // When search is pressed on the menu toggle the search box
    $('#search').on('click', function(){
        $('.searchForm').toggleClass('show')
    })

    // When the search form is submitted
    $('#searchForm').on('submit', function(e){
        // Stop the default action
        e.preventDefault()

        // Find the results from lunr
        results = idx.search($('#searchField').val())

        // Empty #content and put a list in for the results
        $('#content').html('<h1>Search Results (' + results.length + ')</h1>')
        $('#content').append('<ul id="searchResults"></ul>')

        // Loop through results
        $.each(results, function(index, result){
            // Get the entry from the window global
            entry = window.searchData[result.ref]

            // Append the entry to the list.
            $('#searchResults').append('<li><a href="' + entry.url + '">' + entry.title + '</li>')
        })
    })
}
```

A fair bit of that is unique to this site but the principle is the same for any site. On page load a new index is created and populate when the request for `/content.json` completes. Binding a couple of events to make the UI work how I wanted and to handle a user making a search.

The search is pretty simple the lunr index has a `search` method which you pass the search string to. It returns an array of results which I loop though and append to a list.

The order is set by the _relevance_ of the result with the closer matches at the top.

This is a great feature which should help users find content easier.