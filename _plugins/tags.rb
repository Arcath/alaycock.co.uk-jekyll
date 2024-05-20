module TagsPlugin
  class TagPageGenerator < Jekyll::Generator
    safe true

    def generate(site)
      site.tags.each do |tag|
        site.pages << TagPage.new(site, tag[0], tag[1])
      end
    end
  end

  class TagPage < Jekyll::Page
    def initialize(site, tag, posts)
      @site = site
      @base = site.source
      @dir = "tag/#{tag}"

      @basename = 'index'
      @ext = ".html"
      @name = 'index.html'

      @data = {
        'layout' => 'tags',
        'tagged_posts' => posts,
        'title' => "Posts Tagged #{tag}"
      }
    end
  end
end