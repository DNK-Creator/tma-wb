build:
	docker build -t tgbot .

run:
	-docker rm -f tgbot 2>/dev/null || true
	docker run -d \
	  --restart unless-stopped \
	  -p 3000:3000 \
	  --name tgbot \
	  -e BOT_TOKEN=$(BOT_TOKEN) \
	  -e SUPABASE_KEY=$(SUPABASE_KEY) \
	  tgbot