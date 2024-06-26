---
title: Setting Swiggle as the default search provider for Chrome
lead: Setting Chromes default search provider to Swiggle using the ADMX templates.
date: 2019-10-18T09:01:30.391Z
tags:
  - work
  - chrome
---
[Swiggle](https://swiggle.org.uk/) is a child friendly search engine developed by [SWGfl](https://swgfl.org.uk) that has come up in a few of the schools I work in.

The request is normally to change the homepage, or change the homepages search box to a Swiggle box but that doesn't feel like enough to me. Chrome's omnibox and new tab screen are still going to search using Google and most users (or atleast I assume most users) are just going to open a new tab and fire a search off.

So the question becomes can we set the default serach provider in Chrome for all users? Yes, of course we can.

First off we need the Chrome ADMX templates installing on the domain, you can find instructions and the templates download [over on Chromes support site](https://support.google.com/chrome/a/answer/187202?hl=en).

Once those are installed we need to make a choice about who we apply it to. I tend to be very granular with my OUs which allows for some very specific configuration. I decided that I need 2 group policies, one that applied the settings to a computer and one that applied it to users. This is so that I can apply Swiggle to all pupils where ever they login and to staff when they logon to whiteboard computers, this way staff use it by default when modelling work to pupils but they can go back to normal Google when on PPA.

# GPO Configuration

The policy settings for the default search provider are located in _Computer or User Configuration\Policies\Administrative Templates\Google\Google Chrome\Default search provider_ making sure to apply them to users or computers depending on the members of the OU.

|Setting|Value|About|
|:------|:----|:----|
|Enable Default Search Provider|`Yes`|Forces chrome to use the new search provider|
|Default Search Provider Icon|`https://swiggle.org.uk/graphics/favicons/favicon-228.png`|Sets the icon that appears at the start of the omnibox.|
|Default Search Provider Name|`Swiggle`|The name Chrome uses to describe the provider|
|Default search provider new tab page URL|`https://swiggle.org.uk`|The New tab screen URL, this could be your intranet page.|
|Default search provider search URL|`https://swiggle.org.uk/?q={searchTerms}&type=chrome`|The URL of the search page. `{searchTerms}` will be replaced with the users query.|

That is it, default searches within the omnibox will now use Swiggle instead of Google. I edited the intranet page so it would use Swiggle for search instead as well so pupils now have no way of using Google unless they explicitly go to Google and search it there.
