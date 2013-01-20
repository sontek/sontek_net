<%inherit file="sontek:templates/layout3.mako"/>
<div class="resume">
  <div class="dev">
    <h1>${dev["name"]}</h1>
  </div>
  <div class="contact">
    <ul>
      % for c in contact:
      <li>
        % if c['method'] == 'Github':
          <a href="http://github.com/${c['value']}">${c['method']}</a>
        % elif c['method'] == 'Twitter':
          <a href="http://twitter.com/${c['value']}">${c['method']}</a>
        % elif c['method'] == 'LinkedIn':
          <a href="http://linkedin.com/in/${c['value']}">${c['method']}</a>
        % elif c['method'] == 'Email':
          <a href="mailto:${c['value']}">${c['value']}</a>
        % else:
          ${c['method']} ${c['value']}
        % endif
      </li>
      % endfor
    </ul>
  </div>
  % for exp in experience:
    <div class="exp">
      <h3>${exp['title']} @ ${exp['company']}</h3>
      ${exp['type']}
      <p>${exp['description']}</p>
      <p>
        <h4>Skills Used</h4>
        <ul class="skills">
          % for skill in exp['skillKeys']:
            <li>${skill['key']}</li>
          % endfor
        </ul>
        <br class="clear" />
        <h4>Accomplishments</h4>
        <ul>
          % for acc in exp['accomplishments']:
            <li>${acc}</li>
          % endfor
        </ul>
      </p>
    </div>
  % endfor
</div>
