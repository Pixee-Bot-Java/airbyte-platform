import { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import { Button } from "components/ui/Button";
import { ModalBody, ModalFooter } from "components/ui/Modal";

import { AirbyteCatalog, CatalogDiff } from "core/api/types/AirbyteClient";

import styles from "./CatalogDiffModal.module.scss";
import { DiffSection } from "./DiffSection";
import { FieldSection } from "./FieldSection";
import { getSortedDiff } from "./utils";

interface CatalogDiffModalProps {
  catalogDiff: CatalogDiff;
  catalog?: AirbyteCatalog;
  onComplete?: () => void;
}

export const CatalogDiffModal: React.FC<CatalogDiffModalProps> = ({ catalogDiff, catalog, onComplete }) => {
  const { newItems, removedItems, changedItems } = useMemo(
    () => getSortedDiff(catalogDiff.transforms),
    [catalogDiff.transforms]
  );

  return (
    <>
      <ModalBody maxHeight={400} padded={false}>
        <div className={styles.modalContent}>
          {removedItems.length > 0 && <DiffSection streams={removedItems} diffVerb="removed" catalog={catalog} />}
          {newItems.length > 0 && <DiffSection streams={newItems} diffVerb="new" />}
          {changedItems.length > 0 && <FieldSection streams={changedItems} diffVerb="changed" />}
        </div>
      </ModalBody>
      {onComplete && (
        <ModalFooter>
          <Button onClick={onComplete} data-testid="update-schema-confirm-btn">
            <FormattedMessage id="connection.updateSchema.confirm" />
          </Button>
        </ModalFooter>
      )}
    </>
  );
};
