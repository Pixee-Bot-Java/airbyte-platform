import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { useConnectionStatus } from "components/connection/ConnectionStatus/useConnectionStatus";
import { CopyButton } from "components/ui/CopyButton";
import { FlexContainer, FlexItem } from "components/ui/Flex";
import { Icon } from "components/ui/Icon";
import { Link } from "components/ui/Link";
import { Message, MessageProps, MessageType, isHigherSeverity, MESSAGE_SEVERITY_LEVELS } from "components/ui/Message";
import { Text } from "components/ui/Text";

import { useCurrentWorkspaceId } from "area/workspace/utils";
import { useDestinationDefinitionVersion, useSourceDefinitionVersion } from "core/api";
import { ActorDefinitionVersionRead, FailureOrigin } from "core/api/types/AirbyteClient";
import { shouldDisplayBreakingChangeBanner, getHumanReadableUpgradeDeadline } from "core/domain/connector";
import { FeatureItem, useFeature } from "core/services/features";
import { failureUiDetailsFromReason } from "core/utils/errorStatusMessage";
import { useSchemaChanges } from "hooks/connection/useSchemaChanges";
import { useConnectionEditService } from "hooks/services/ConnectionEdit/ConnectionEditService";
import { ConnectionRoutePaths, RoutePaths } from "pages/routePaths";

import styles from "./ConnectionStatusMessages.module.scss";

const reduceToHighestSeverityMessage = (messages: MessageProps[]): MessageProps[] => {
  // get the highest error type of all the messages e.g. error > warning > everything else
  const defaultMessageLevel = "info";
  const highestSeverityLevel = messages.reduce<MessageType>((highestSeverity: MessageType, message: MessageProps) => {
    const messageType = message.type ?? defaultMessageLevel;
    if (isHigherSeverity(messageType, highestSeverity)) {
      return messageType;
    }
    return highestSeverity;
  }, defaultMessageLevel);

  // filter out all messages that are not the highest severity level
  return messages.filter((message) => message.type === highestSeverityLevel);
};

/**
 * Get the error message to display for a given actor definition version
 * @param actorDefinitionVersion The actor definition version to get the error message for
 * @param connectorBreakingChangeDeadlinesEnabled
 * @returns An array containing id of the message to display and the type of error
 */
export const getBreakingChangeErrorMessage = (
  actorDefinitionVersion: Pick<ActorDefinitionVersionRead, "supportState">,
  connectorBreakingChangeDeadlinesEnabled: boolean
): {
  errorMessageId: string;
  errorType: MessageType;
} => {
  // On OSS we do not pause connections for breaking changes, so we do not care about deadlines or unsupported versions
  if (!connectorBreakingChangeDeadlinesEnabled) {
    return { errorMessageId: "connectionForm.breakingChange.deprecatedNoDeadline.message", errorType: "warning" };
  }

  return actorDefinitionVersion.supportState === "unsupported"
    ? { errorMessageId: "connectionForm.breakingChange.unsupported.message", errorType: "error" }
    : { errorMessageId: "connectionForm.breakingChange.deprecated.message", errorType: "warning" };
};

export const ConnectionStatusMessages: React.FC = () => {
  const navigate = useNavigate();
  const { formatMessage } = useIntl();

  const workspaceId = useCurrentWorkspaceId();
  const { connection } = useConnectionEditService();
  const { failureReason, lastSyncJobId, lastSyncAttemptNumber, isRunning } = useConnectionStatus(
    connection.connectionId
  );
  const { hasBreakingSchemaChange } = useSchemaChanges(connection.schemaChange);
  const sourceActorDefinitionVersion = useSourceDefinitionVersion(connection.sourceId);
  const destinationActorDefinitionVersion = useDestinationDefinitionVersion(connection.destinationId);
  const connectorBreakingChangeDeadlinesEnabled = useFeature(FeatureItem.ConnectorBreakingChangeDeadlines);
  const [typeCount, setTypeCount] = useState<Partial<Record<MessageType, number>>>({});

  const errorMessagesToDisplay = useMemo<MessageProps[]>(() => {
    const errorMessages: MessageProps[] = [];

    if (isRunning) {
      return [];
    }

    // If we have an error message and no breaking schema changes, show the error message
    if (failureReason && !hasBreakingSchemaChange) {
      const failureUiDetails = failureUiDetailsFromReason(failureReason, formatMessage);

      const isError = failureUiDetails.type === "error";
      if (isError) {
        const isSourceError = failureUiDetails.origin === FailureOrigin.source;

        const targetRoute = isSourceError ? RoutePaths.Source : RoutePaths.Destination;
        const targetRouteId = isSourceError ? connection.sourceId : connection.destinationId;
        const configError = {
          text: formatMessage(
            { id: "failureMessage.label" },
            {
              type: (
                <Text size="lg" bold as="span">
                  {failureUiDetails.typeLabel}:
                </Text>
              ),
              message: failureUiDetails.message,
            }
          ),
          onAction: () => navigate(`/${RoutePaths.Workspaces}/${workspaceId}/${targetRoute}/${targetRouteId}`),
          actionBtnText: formatMessage({
            id: isSourceError
              ? "connection.stream.status.checkSourceSettings"
              : "connection.stream.status.checkDestinationSettings",
          }),
          type: "error",
          "data-testid": `connection-status-message-error-${isSourceError ? "source" : "destination"}`,
        } as const;

        errorMessages.push(configError);
      } else {
        const hasInternalErrorMessage = !!failureUiDetails.secondaryMessage;
        const goToLogError = {
          text: formatMessage(
            { id: "failureMessage.label" },
            {
              type: (
                <Text size="lg" bold as="span">
                  {failureUiDetails.typeLabel}:
                </Text>
              ),
              message: failureUiDetails.message,
            }
          ),
          type: "warning",
          children: hasInternalErrorMessage && (
            <FlexContainer>
              <FlexItem grow alignSelf="center">
                <Text>{failureUiDetails.secondaryMessage}</Text>
              </FlexItem>
              <FlexContainer direction="row" gap="sm">
                <CopyButton content={failureUiDetails.secondaryMessage!} />
                <Link
                  to={`../${ConnectionRoutePaths.JobHistory}#${lastSyncJobId}::${lastSyncAttemptNumber}`}
                  title={formatMessage({ id: "connection.stream.status.seeLogs" })}
                  className={styles.buttonLikeLink}
                >
                  <Icon type="share" />
                </Link>
              </FlexContainer>
            </FlexContainer>
          ),
          childrenClassName: styles.internalErrorMessage,
          isExpandable: hasInternalErrorMessage,
          "data-testid": `connection-status-message-warning`,
        } as const;
        errorMessages.push(goToLogError);
      }
    }

    // If we have schema changes, show the correct message
    if (hasBreakingSchemaChange) {
      errorMessages.push({
        text: formatMessage({
          id: "connection.schemaChange.breaking",
        }),
        onAction: () => navigate(`../${ConnectionRoutePaths.Replication}`, { state: { triggerRefreshSchema: true } }),
        actionBtnText: formatMessage({ id: "connection.schemaChange.reviewAction" }),
        type: "error",
        "data-testid": `connection-status-message-breaking-schema-change`,
      });
    }

    // Warn the user of any breaking changes in the source definition
    const breakingChangeErrorMessages: MessageProps[] = [];
    if (shouldDisplayBreakingChangeBanner(sourceActorDefinitionVersion)) {
      const { errorMessageId, errorType } = getBreakingChangeErrorMessage(
        sourceActorDefinitionVersion,
        connectorBreakingChangeDeadlinesEnabled
      );

      breakingChangeErrorMessages.push({
        text: formatMessage(
          { id: errorMessageId },
          {
            actor_name: connection.source.name,
            actor_definition_name: connection.source.sourceName,
            actor_type: "source",
            upgrade_deadline: getHumanReadableUpgradeDeadline(sourceActorDefinitionVersion),
          }
        ),
        onAction: () =>
          navigate(`/${RoutePaths.Workspaces}/${workspaceId}/${RoutePaths.Source}/${connection.sourceId}`),
        actionBtnText: formatMessage({
          id: "connectionForm.breakingChange.source.buttonLabel",
        }),
        actionBtnProps: {
          className: styles.breakingChangeButton,
        },
        type: errorType,
        iconOverride: "warning",
        "data-testid": `breaking-change-${errorType}-connection-banner`,
      });
    }

    // Warn the user of any breaking changes in the destination definition
    if (shouldDisplayBreakingChangeBanner(destinationActorDefinitionVersion)) {
      const { errorMessageId, errorType } = getBreakingChangeErrorMessage(
        destinationActorDefinitionVersion,
        connectorBreakingChangeDeadlinesEnabled
      );

      breakingChangeErrorMessages.push({
        text: formatMessage(
          { id: errorMessageId },
          {
            actor_name: connection.destination.name,
            actor_definition_name: connection.destination.destinationName,
            actor_type: "destination",
            upgrade_deadline: getHumanReadableUpgradeDeadline(destinationActorDefinitionVersion),
          }
        ),
        onAction: () =>
          navigate(`/${RoutePaths.Workspaces}/${workspaceId}/${RoutePaths.Destination}/${connection.destinationId}`),
        actionBtnText: formatMessage({
          id: "connectionForm.breakingChange.destination.buttonLabel",
        }),
        actionBtnProps: {
          className: styles.breakingChangeButton,
        },
        type: errorType,
        iconOverride: "warning",
        "data-testid": `breaking-change-${errorType}-connection-banner`,
      });
    }

    // If we have both source and destination breaking changes, with different error levels, we only
    // want to show the highest level error message
    const onlyHighLevelBreakingChangeErrorMessages = reduceToHighestSeverityMessage(breakingChangeErrorMessages);
    errorMessages.push(...onlyHighLevelBreakingChangeErrorMessages);

    // count the number of messages for each "type" and set the state
    setTypeCount(
      errorMessages.reduce<Partial<Record<MessageType, number>>>((acc, curr) => {
        if (curr.type) {
          acc[curr.type] = (acc[curr.type] || 0) + 1;
        }
        return acc;
      }, {})
    );

    // sort messages by severity level
    return errorMessages.sort((msg1, msg2) => {
      // since MessageProps.type is optional, we need to check for undefined
      if (!(msg1.type && msg2.type)) {
        return 0;
      }
      return MESSAGE_SEVERITY_LEVELS[msg2?.type] - MESSAGE_SEVERITY_LEVELS[msg1?.type];
    });
  }, [
    isRunning,
    failureReason,
    hasBreakingSchemaChange,
    sourceActorDefinitionVersion,
    destinationActorDefinitionVersion,
    formatMessage,
    connection.sourceId,
    connection.destinationId,
    connection.source.name,
    connection.source.sourceName,
    connection.destination.name,
    connection.destination.destinationName,
    navigate,
    workspaceId,
    lastSyncJobId,
    lastSyncAttemptNumber,
    connectorBreakingChangeDeadlinesEnabled,
  ]);

  if (errorMessagesToDisplay.length > 0) {
    return (
      <FlexContainer
        direction="column"
        data-error-count={typeCount.error}
        data-warning-count={typeCount.warning}
        data-notification-count={typeCount.info}
      >
        {errorMessagesToDisplay.map((message, index) => (
          <Message key={index} className={styles.error} {...message} />
        ))}
      </FlexContainer>
    );
  }

  return null;
};
