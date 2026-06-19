deploy@bank-sampah-contabo:/var/www/bank-sampah-app/current$ sudo nano /etc/nginx/sites-available/bank-sampah
deploy@bank-sampah-contabo:/var/www/bank-sampah-app/current$ sudo nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
deploy@bank-sampah-contabo:/var/www/bank-sampah-app/current$ sudo systemctl reload nginx
deploy@bank-sampah-contabo:/var/www/bank-sampah-app/current$ curl -I -H "Host: bsgondangansejahtera.com" http://127.0.0.1
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Date: Fri, 19 Jun 2026 13:33:01 GMT
Content-Type: text/html; charset=utf-8
Content-Length: 9239
Connection: keep-alive
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
x-nextjs-cache: HIT
x-nextjs-prerender: 1
x-nextjs-prerender: 1
x-nextjs-stale-time: 300
X-Powered-By: Next.js
Cache-Control: s-maxage=31536000
ETag: "nh004vbmcs74n"

deploy@bank-sampah-contabo:/var/www/bank-sampah-app/current$ sudo ss -tulpn | grep ':80'
tcp   LISTEN 0      511          0.0.0.0:80        0.0.0.0:*    users:(("nginx",pid=87029,fd=5),("nginx",pid=87028,fd=5),("nginx",pid=87027,fd=5),("nginx",pid=87025,fd=5),("nginx",pid=87024,fd=5),("nginx",pid=87023,fd=5),("nginx",pid=76011,fd=5))
tcp   LISTEN 0      511             [::]:80           [::]:*    users:(("nginx",pid=87029,fd=6),("nginx",pid=87028,fd=6),("nginx",pid=87027,fd=6),("nginx",pid=87025,fd=6),("nginx",pid=87024,fd=6),("nginx",pid=87023,fd=6),("nginx",pid=76011,fd=6))
deploy@bank-sampah-contabo:/var/www/bank-sampah-app/current$ sudo ufw status
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere                  
Nginx Full                 ALLOW       Anywhere                  
OpenSSH (v6)               ALLOW       Anywhere (v6)             
Nginx Full (v6)            ALLOW       Anywhere (v6)             

deploy@bank-sampah-contabo:/var/www/bank-sampah-app/current$ 