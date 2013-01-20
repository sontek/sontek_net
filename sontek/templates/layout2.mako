<!DOCTYPE html>
<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>sontek's Humble Abode - Writings from John Anderson</title>
        <link href="${request.static_url('hiero:static/assets/css/bootstrap.css')}" rel="stylesheet">
        <link href="${request.static_url('hiero:static/assets/css/bootstrap-responsive.css')}" rel="stylesheet">
        <link href="${request.static_url('sontek:static/css/main.css')}" rel="stylesheet">
        <link href="${request.static_url('sontek:static/css/sourcehighlight.css')}" rel="stylesheet">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

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
        <div id="main-container">
            <div id="main-content">
                <div id="main-header">
                  <div id="logo"><img src="${request.static_url('sontek:static/img/logo.png')}" alt="sontek.net" /></div>
                    <div id="menu">
                        <ul>
                        </ul>
                    </div>
                </div>
                <div id="main-body">
                  ${next.body()}
                </div>
            </div>
        </div>
        <div id="main-footer">
            <div id="main-footer-content">
                <div class="left">
                    <h4 class="green-header">Contact Info</h4>
                    <div class="contact-label"><strong>Email:</strong></div>
                    <div class="contact-info"><a href="mailto:sontek@gmail.com" title="Contact Sontek">sontek@gmail.com</a></div>
                    <div class="contact-label"><strong>Skype:</strong></div>
                    <div class="contact-info">sontek</div>
                </div>
                <div class="left">
                    <h4 class="green-header">Social Networking</h4>
                    <div class="contact-label"><strong>Twitter:</strong></div>
                    <div class="contact-info"><a href="http://twitter.com/sontek">http://twitter.com/sontek</a></div>
                    <div class="contact-label"><strong>Facebook:</strong></div>
                    <div class="contact-info"><a href="http://facebook.com/sontek">http://facebook.com/sontek</a></div>
                    <div class="contact-label"><strong>Github:</strong></div>
                    <div class="contact-info"><a href="http://github.com/sontek">http://github.com/sontek</a></div>
                    <div class="contact-label"><strong>LinkedIn:</strong></div>
                    <div class="contact-info"><a href="http://linkedin.com/in/sontek">http://linkedin.com/in/sontek</a></div>
                </div>
            </div>
        </div>
    </body>
</html>
