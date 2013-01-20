<%inherit file="sontek:templates/layout3.mako"/>
<div class="dev">
  <h2>${dev["name"]}</h2>
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
    <h3>${exp['title']}</h3>
    ${exp['type']}
    <p>${exp['description']}</p>
    <p>
      <h4>Accomplishments</h4>
      <ul>
      % for acc in exp['accomplishments']:
        <li>${acc}</li>
      % endfor
      </ul>
    </p>
  </div>
% endfor
