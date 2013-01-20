<%inherit file="sontek:templates/layout3.mako"/>

<div id="main-body-left">
    <div class="entry">
        <ul class="index">
            <li><a href="https://github.com/sontek"><img class="github-ico" src="${request.static_url('sontek:static/img/octocat.png')}" />GitHub</a></li>
            <li><a href="https://twitter.com/sontek"><img class="twitter-ico" src="${request.static_url('sontek:static/img/twitter-bird-light-bgs.png')}" />Twitter</a></li>
            <li><a href="http://www.linkedin.com/in/sontek"><img class="linkedin-ico" src="${request.static_url('sontek:static/img/linkedin.jpg')}" />LinkedIn</a></li>
        </ul>
    </div>
    <br class="clear" />
    <div class="entry">
        <h4 class="green-header">Recent Blog Posts</h4>
        <div>
            <ul>
              % if entries:
                % for entry in entries:
                <li><a href="${request.route_url('hiero_entry_detail', slug=entry.slug)}">${entry.title}</a></li>
                % endfor
              % else:
                <li>No new entries</li>
              %endif
            </ul>
        </div>
    </div>
</div>
