denvelop
--------
The source for my personal website, http://www.denvelop.nl/. Building it to
obtain a structure that can be deployed on any webserver is easy if you have
nanoc installed. Just do the following:

```
  $ cd path/to/repo/site
  $ nanoc
```

You will then find that [nanoc](http://nanoc.ws/) creates a directory `output`
that contains a folder structure with plain old `index.html` files in
directories and some images and such. **Future work:** make nanoc able to
publish using rsync or over FTP, I think it is able to.

Another sidenote: I have created figures using Ipe, the nanoc process will run
the `iperender` tool, which you hence need to be able to compile the site.
