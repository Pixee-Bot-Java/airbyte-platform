/*
 * Copyright (c) 2020-2024 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.workers.temporal.sync;

import io.airbyte.config.StandardSyncOutput;
import io.airbyte.workers.models.ReplicationActivityInput;
import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;

/**
 * ReplicationActivity.
 */
@ActivityInterface
public interface ReplicationActivity {

  @ActivityMethod
  StandardSyncOutput replicateV2(final ReplicationActivityInput replicationInput);

  @ActivityMethod
  String startReplication(final ReplicationActivityInput replicationInput);

  @ActivityMethod
  StandardSyncOutput getReplicationOutput(final ReplicationActivityInput replicationInput, final String workloadId);

  @ActivityMethod
  Boolean isTerminal(final ReplicationActivityInput replicationActivityInput, final String workloadId);

  @ActivityMethod
  void cancel(final ReplicationActivityInput replicationInput, final String workloadId);

}
