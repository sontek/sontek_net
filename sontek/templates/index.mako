<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>sontek's Humble Abode - Writings from John Anderson</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="${request.static_url('hiero:static/assets/css/bootstrap.css')}" rel="stylesheet">
    <link href="${request.static_url('hiero:static/assets/css/bootstrap-responsive.css')}" rel="stylesheet">
    <link href="${request.static_url('sontek:static/css/sourcehighlight.css')}" rel="stylesheet">
    <link href="${request.static_url('sontek:static/css/sontek.css')}" rel="stylesheet">

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
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
  </head>

  <body>
    <div>
      <div class="container-fluid">
        <div class="row-fluid">
          <div class="span2">
            &nbsp;
            <!-- this div keeps the content centered -->
          </div>
          <div class="span8">
            <h2>John Anderson - sontek</h2>
          </div>
        </div>
        <div class="row-fluid">
          <div class="span2">
            &nbsp;
            <!-- this div keeps the content centered -->
          </div>
          <div class="span8">
            <ul class="index">
              <li><a href="${request.route_url('hiero_entry_category', slug='tech')}">Tech Blog</a></li>
              <li><a href="${request.route_url('hiero_entry_category', slug='startup')}">Business Blog</a></li>
              <li><a href="${request.route_url('hiero_entry_category', slug='personal')}">Personal Blog</a></li>
              <li><a href="https://github.com/sontek"><img class="github-ico" src="${request.static_url('sontek:static/img/octocat.png')}" />GitHub</a></li>
              <li><a href="https://twitter.com/sontek"><img class="twitter-ico" src="${request.static_url('sontek:static/img/twitter-bird-light-bgs.png')}" />Twitter</a></li>
              <li><a href="http://www.linkedin.com/in/sontek"><img class="linkedin-ico" src="${request.static_url('sontek:static/img/linkedin.jpg')}" />LinkedIn</a></li>
              <li><a href="http://eventray.com">My Company EventRay</a></li>
            </ul>
          </div>
        </div>
      </div> <!-- /container -->
    </div>
  </body>
</html>
