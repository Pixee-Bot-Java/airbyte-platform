##@ Images:

VERSION ?= $(shell git rev-parse --short HEAD)
IMAGES_DIR := ./oss/docker
OS ?= $(shell uname | tr '[:upper:]' '[:lower:]')

PUBLISH ?= false

BASE_JAVA_IMAGE_VERSION ?= 3.2.3
BASE_JAVA_IMAGE = airbyte/airbyte-base-java-image:$(BASE_JAVA_IMAGE_VERSION)
BASE_BUSYBOX_IMAGE_VERSION ?= 1.28
ALPINE_IMAGE_VERSION ?= 3.18

image.base-images: ## Build all the base images
image.base-images: buildx.start
image.base-images: image.airbyte-base-java-image image.airbyte-base-java-python-image image.airbyte-base-java-worker-image

image.airbyte-base-java-image: ## Build the airbyte-base-java-image
image.airbyte-base-java-image: buildx.start
	@if [ "$(PUBLISH)" = "true" ]; then \
		docker buildx build -t airbyte/airbyte-base-java-image:$(VERSION) \
			--builder airbyte-image-builder \
			--platform linux/amd64,linux/arm64 \
			--push \
			-f $(IMAGES_DIR)/airbyte-base-java-image/Dockerfile . ; \
	else \
		docker build -t airbyte/airbyte-base-java-image:$(VERSION) -f $(IMAGES_DIR)/airbyte-base-java-image/Dockerfile . ; \
	fi

image.airbyte-base-java-python-image: ## Build the airbyte/airbyte-base-java-python-image
image.airbyte-base-java-python-image: buildx.start
	@if [ "$(PUBLISH)" = "true" ]; then \
		docker buildx build -t airbyte/airbyte-base-java-python-image:$(VERSION) \
			--builder airbyte-image-builder \
			--build-arg JDK_IMAGE=$(BASE_JAVA_IMAGE) \
			--platform linux/amd64,linux/arm64 \
			--push \
			-f $(IMAGES_DIR)/airbyte-base-java-python-image/Dockerfile . ; \
	else \
		docker build \
			--build-arg JDK_IMAGE=$(BASE_JAVA_IMAGE) \
			-t airbyte/airbyte-base-java-python-image:$(VERSION) \
			-f $(IMAGES_DIR)/airbyte-base-java-python-image/Dockerfile . ; \
	fi

image.airbyte-base-java-worker-image: ## Build the airbyte/airbyte-base-java-worker-image
	@if [ "$(PUBLISH)" = "true" ]; then \
		docker buildx build -t airbyte/airbyte-base-java-worker-image:$(VERSION) \
			--build-arg JDK_IMAGE=$(BASE_JAVA_IMAGE) \
			--platform linux/amd64,linux/arm64 \
			--push \
			-f $(IMAGES_DIR)/airbyte-base-java-worker-image/Dockerfile . ; \
	else \
		docker build \
			--build-arg JDK_IMAGE=$(BASE_JAVA_IMAGE) \
			-t airbyte/airbyte-base-java-worker-image:$(VERSION) \
			-f $(IMAGES_DIR)/airbyte-base-java-worker-image/Dockerfile . ; \
	fi

image.airbyte-busybox: ## Build the airbyte/busybox image
	@if [ "$(PUBLISH)" = "true" ]; then \
		docker buildx build -t airbyte/busybox:$(VERSION) \
			--build-arg BASE_BUSYBOX_IMAGE_VERSION=$(BASE_BUSYBOX_IMAGE_VERSION) \
			--platform linux/amd64,linux/arm64 \
			--push \
			-f $(IMAGES_DIR)/airbyte-busybox/Dockerfile . ; \
	else \
		docker build \
			--build-arg BASE_BUSYBOX_IMAGE_VERSION=$(BASE_BUSYBOX_IMAGE_VERSION) \
			-t airbyte/busybox:$(VERSION) \
			-f $(IMAGES_DIR)/airbyte-busybox/Dockerfile . ; \
	fi

image.airbyte-mc: ## Build the airbyte/mc image
	@if [ "$(PUBLISH)" = "true" ]; then \
		docker buildx build -t airbyte/mc:$(VERSION) \
			--build-arg ALPINE_IMAGE_VERSION=$(ALPINE_IMAGE_VERSION) \
			--platform linux/amd64,linux/arm64 \
			--push \
			-f $(IMAGES_DIR)/airbyte-mc/Dockerfile . ; \
	else \
		docker build \
			--build-arg ALPINE_IMAGE_VERSION=$(ALPINE_IMAGE_VERSION) \
			-t airbyte/mc:$(VERSION) \
			-f $(IMAGES_DIR)/airbyte-mc/Dockerfile . ; \
	fi
