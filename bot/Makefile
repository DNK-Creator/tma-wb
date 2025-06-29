build:
	docker build -t tgbot .

# pass BOT_TOKEN from your shell or CI environment
run:
	docker run -d \
	  -p 3000:3000 \
	  --name tgbot \
	  --rm \
	  -e BOT_TOKEN=$(VITE_BOT_TOKEN) \
	  tgbot