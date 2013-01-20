<%inherit file="sontek:templates/layout3.mako"/>

<%namespace name="utils" file="hiero:templates/blog_utilities.mako" />

<div class="blog-body">
  ${utils.render_entry(entry)}
</div>
