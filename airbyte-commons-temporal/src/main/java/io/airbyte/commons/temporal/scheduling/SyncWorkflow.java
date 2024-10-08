/*
 * Copyright (c) 2020-2024 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.commons.temporal.scheduling;

import io.airbyte.config.StandardSyncInput;
import io.airbyte.config.StandardSyncOutput;
import io.airbyte.persistence.job.models.IntegrationLauncherConfig;
import io.airbyte.persistence.job.models.JobRunConfig;
import io.temporal.workflow.SignalMethod;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;
import java.util.UUID;

/**
 * Run an airbyte sync method in temporal.
 */
@WorkflowInterface
public interface SyncWorkflow {

  @WorkflowMethod
  StandardSyncOutput run(JobRunConfig jobRunConfig,
                         IntegrationLauncherConfig sourceLauncherConfig,
                         IntegrationLauncherConfig destinationLauncherConfig,
                         StandardSyncInput syncInput,
                         UUID connectionId);

  @SignalMethod
  void checkAsyncActivityStatus();

}
