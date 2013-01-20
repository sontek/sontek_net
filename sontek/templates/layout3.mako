<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" type="text/css" href="${request.static_url('sontek:static/css/svbtle.css')}">
  <!--<link rel="stylesheet/less" type="text/css" href="/theme/css/style.less">-->
  <!--<script src="/theme/js/less.js" type="text/javascript"></script>-->
  <link href='http://fonts.googleapis.com/css?family=Open+Sans:800,400,300|Inconsolata' rel='stylesheet' type='text/css'>
  <link href="${request.static_url('sontek:static/css/sourcehighlight.css')}" rel="stylesheet">
  <link href="${request.static_url('sontek:static/css/main.css')}" rel="stylesheet">

  <title>sontek's humble adode - John Anderson</title>
  <meta charset="utf-8" />
</head>
<body>
  <section id="sidebar">
    <figure id="user_logo">
        <img src="http://s.gravatar.com/avatar/848c8fa8f54256aa570becc90123bee2?s=130" />
    </figure>

    <div class="user_meta">
            <h1 id="user"><a href="#" class="">John Anderson</a></h1>
      <h2>Open Source Hacker</h2>
      <ul>
          <li><a href="${request.route_url('index')}">Home</a></li>
          <li><a href="${request.route_url('hiero_entry_category', slug='tech')}">Tech Blog</a></li>
          <li><a href="${request.route_url('hiero_entry_category', slug='personal')}">Personal Blog</a></li>
          <li><a href="${request.route_url('projects')}">Projects</a></li>
          <li><a href="${request.route_url('resume')}">Resumé</a></li>
          <li><a href="${request.route_url('about')}">About</a></li>
      </ul>
    </div>
    <footer>
      <address>
        Powered by <a href="https://github.com/eventray/hiero">Hiero</a>
      </address>
    </footer>
  </section>

  <section id="posts">
    ${next.body()}
  </section>
  <script type="text/javascript">

    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-9376946-2']);
    _gaq.push(['_trackPageview']);

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

  </script>
</body>
</html>
