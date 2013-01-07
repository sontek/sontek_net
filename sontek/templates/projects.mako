<%inherit file="sontek:templates/layout2.mako"/>

% for project in projects:
  <div class="project">
    % if 'screenshot' in project:
      <a class="screenshot" href="${request.static_url('sontek:static/img/' + project['screenshot'])}">Screenshot</a>
    % endif
    <h2><a href="${project['url']}">${project['name']}</a></h2>
    <p>${project['description']}</p>
    <p>
      <h3>Tags:</h3>
        % if project['tags']:
          <div class="tags">
          % for tag in project['tags']:
            <span>${tag}</span>
          % endfor
          </div>
        % else:
          No Tags
        % endif
    </p>
  </div>
% endfor
