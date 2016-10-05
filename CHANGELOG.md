## Changelog

10/04/2016: 4.1.x -> 4.2.0
1. "Add a domain" is now live. Please uses API >= 3.4.0 for this new functionality

09/30/2016: 4.1.0 -> 4.1.1
1. "Add an account" is now live. Please uses API >= 3.3.1 for this new functionality

09/30/2016: 4.0.0 -> 4.1.0
1. unreadCount is now separated from folders
2. Please uses API >= 3.3.0 for this new change

07/22/2016: 4.0.0
1. Uses Vuex instead of direct state mutations

07/17/2016: 3.2.0
1. Address book: edit friendlyName and/or fold the address friendlyName

06/07/2016: 2.x -> 3.0.0
1. (API) Dermail now supports per (main) domain DKIM signing outbound and verifying inbound.
2. (API) By default, Dermail checks for incoming emails for SPF. If SPF is not either "pass", "neutral", or "softfail", the emails will be moved to SPAM folder
3. (API) By default, Dermail checks for incoming emails for DKIM. If *any* DKIM signature fails the verification (not "pass" or "tempfail"), the emails will be moved to SPAM folder
4. Webmail now has a "Security" page for setting up SPF and DKIM. DMARC is planned.

05/06/2016 -> 2.7.x -> 2.8.0
1. Supports update alias. More functionalities on the way.

05/06/2016 -> 2.6.x -> 2.7.1
1. Reverting to running Socket.io with API processes.
2. Please see Dermail-API changelog for details

05/05/2016 -> 2.6.0 -> 2.6.1
1. Actually, a simple nginx trick will require no modification for existing code:
```
location /socket.io {
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection "upgrade";
	proxy_http_version 1.1;
	proxy_set_header Accept-Encoding "";
	proxy_pass http://IP:1999;
}
```

05/05/2016 -> 2.5.x -> 2.6.0
1. API breaking: Socket.io no longer runs with API processes; it is now running on a single process
2. Please configure `socketEndpoint` in your `config.json`
