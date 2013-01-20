<%inherit file="sontek:templates/layout3.mako"/>
<div class="resume">
  <div class="dev">
    <h1>${dev["name"]}</h1>
  </div>
  <div class="contact">
    <ul>
      % for c in contact:
        <li>${c['method']} - ${c['value']}</li>
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
