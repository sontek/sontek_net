<%inherit file="sontek:templates/layout2.mako"/>

<div id="main-body-left">
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
<div id="main-body-right">
    <img src="${request.static_url('sontek:static/img/sontek-in-barcelona.png')}" alt="" />
</div>
