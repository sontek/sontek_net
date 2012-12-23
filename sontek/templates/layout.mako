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
    <link href="${request.static_url('sontek:static/css/sontek.css')}" rel="stylesheet">
    <link href="${request.static_url('sontek:static/css/sourcehighlight.css')}" rel="stylesheet">

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
            <h3><a href="${request.route_url('index')}">John Anderson's random thoughts</a></h3>
          </div>
        </div>
        <div class="row-fluid">
          <div class="span2">
            &nbsp;
            <!-- this div keeps the content centered -->
          </div>
          <div class="span6">
            ${next.body()}
          </div>
          <div class="span2">
            <div>
              <strong>My Blogs</strong>
              <ul class="categories">
              % for category in categories:
                <li><a href="${request.route_url('hiero_entry_category', slug=category.slug)}">${category.title}</a></li>
              % endfor
              </ul>
            </div>
            <strong>My Links</strong>
            <ul class="categories">
              <li><a href="http://twitter.com/sontek">Twitter</a></li>
              <li><a href="http://github.com/sontek">Github</a></li>
              <li><a href="http://linkedin.com/in/sontek">LinkedIn</a></li>
              <li><a href="http://eventray.com/">EventRay</a></li>
            </ul>
          </div>
        </div>
      </div> <!-- /container -->
    </div>

  </body>
</html>
