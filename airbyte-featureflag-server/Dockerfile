ARG JDK_IMAGE=airbyte/airbyte-base-java-image:3.2.3

FROM scratch as builder
WORKDIR /app
ADD airbyte-app.tar /app

FROM ${JDK_IMAGE}
EXPOSE 8007 5005
ENV APPLICATION airbyte-featureflag-server
ENV VERSION ${VERSION}

WORKDIR /app
COPY --chown=airbyte:airbyte --from=builder /app /app
USER airbyte:airbyte

ENTRYPOINT ["/bin/bash", "-c", "airbyte-app/bin/${APPLICATION}"]
