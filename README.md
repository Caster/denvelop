# denvelop
The source for my personal website, https://www.denvelop.nl/. Building it to
obtain a structure that can be deployed on any webserver is easy. Just do the
following:

```
  $ cd path-to-repo/site
  $ bundle install
  $ bundle exec nanoc
```

You will then find that [Nanoc](https://nanoc.app/) creates a directory `output`
that contains a folder structure with plain old `index.html` files in
directories and some images and such.

## Dependencies
You may have noticed that I use [Bundler](http://bundler.io/) for dependency
management of gems needed for site compilation. This includes Nanoc, so you do
not need to install that separately. You will need Ruby 2.5 or later since Nanoc
depends on that. You can find [installation
instructions](https://www.ruby-lang.org/en/documentation/installation/) on the
Ruby website. Installing Bundler should be a matter of executing

```
  $ gem install bundler
```

You may need `sudo` there, but always try without first, installing gems with
root rights can damage your installation.

I have created figures using Ipe, the nanoc process will run the `iperender`
tool, which you hence need to be able to compile the site. The same holds for
the `tidy` tool, which is used to tidy up the HTML output. Finally, you'll need
to manually install the LESS CSS compiler (`lessc`), because I could no longer
find an up-to-date Ruby Gem for it.
