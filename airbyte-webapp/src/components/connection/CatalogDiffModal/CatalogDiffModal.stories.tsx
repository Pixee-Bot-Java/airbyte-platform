import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FormattedMessage } from "react-intl";

import { Modal } from "components/ui/Modal";

import { CatalogDiff } from "core/api/types/AirbyteClient";
import { ModalServiceProvider } from "hooks/services/Modal";

import { CatalogDiffModal } from "./CatalogDiffModal";

export default {
  title: "connection/CatalogDiffModal",
  component: CatalogDiffModal,
} as ComponentMeta<typeof CatalogDiffModal>;

const Template: ComponentStory<typeof CatalogDiffModal> = (args) => {
  return (
    <ModalServiceProvider>
      <Modal size="md" title={<FormattedMessage id="connection.updateSchema.completed" />}>
        <CatalogDiffModal catalogDiff={args.catalogDiff} catalog={args.catalog} onComplete={() => null} />
      </Modal>
    </ModalServiceProvider>
  );
};

const oneStreamAddCatalogDiff: CatalogDiff = {
  transforms: [
    {
      transformType: "add_stream",
      streamDescriptor: { namespace: "apple", name: "banana" },
    },
  ],
};

const oneFieldAddCatalogDiff: CatalogDiff = {
  transforms: [
    {
      transformType: "update_stream",
      streamDescriptor: { namespace: "apple", name: "harissa_paste" },
      updateStream: {
        streamAttributeTransforms: [],
        fieldTransforms: [{ transformType: "add_field", fieldName: ["users", "phone"], breaking: false }],
      },
    },
  ],
};

const oneFieldUpdateCatalogDiff: CatalogDiff = {
  transforms: [
    {
      transformType: "update_stream",
      streamDescriptor: { namespace: "apple", name: "harissa_paste" },
      updateStream: {
        streamAttributeTransforms: [],
        fieldTransforms: [
          {
            transformType: "update_field_schema",
            breaking: false,
            fieldName: ["users", "address"],
            updateFieldSchema: { oldSchema: { type: "number" }, newSchema: { type: "string" } },
          },
        ],
      },
    },
  ],
};

const fullCatalogDiff: CatalogDiff = {
  transforms: [
    {
      transformType: "update_stream",
      streamDescriptor: { namespace: "too_long_of_a_namespace", name: "too_long_of_a_name_for_this" },
      updateStream: {
        streamAttributeTransforms: [],
        fieldTransforms: [
          { transformType: "add_field", fieldName: ["users", "phone"], breaking: false },
          { transformType: "add_field", fieldName: ["users", "email"], breaking: false },
          { transformType: "remove_field", fieldName: ["users", "id"], breaking: true },
          { transformType: "remove_field", fieldName: ["users", "lastName"], breaking: false },
          {
            transformType: "remove_field",
            fieldName:
              "universe.milky_way_galaxy.earth.land.north_america.alaska.yukon.businesses.stores.names.created_at".split(
                "."
              ),
            breaking: false,
          },
          {
            transformType: "remove_field",
            fieldName: "universe.milky_way_galaxy.earth.ocean.pacific.great_barrier_reef.creatures.fish.names.id".split(
              "."
            ),
            breaking: true,
          },
          {
            transformType: "update_field_schema",
            breaking: false,
            fieldName: ["users", "address"],
            updateFieldSchema: { oldSchema: { type: "number" }, newSchema: { type: "string" } },
          },
          {
            transformType: "update_field_schema",
            breaking: false,
            fieldName: ["package", "dimensions", "size", "width", "updated_at"],
            updateFieldSchema: { oldSchema: { type: "string" }, newSchema: { type: "DateTime" } },
          },
          {
            transformType: "update_field_schema",
            breaking: true,
            fieldName: ["users", "id"],
            updateFieldSchema: { oldSchema: { type: "number" }, newSchema: { type: "string" } },
          },
          {
            transformType: "update_field_schema",
            breaking: true,
            fieldName: ["package", "from", "address", "country", "id"],
            updateFieldSchema: { oldSchema: { type: "string" }, newSchema: { type: "DateTime" } },
          },
        ],
      },
    },
    {
      transformType: "add_stream",
      streamDescriptor: { namespace: "apple", name: "banana" },
    },
    {
      transformType: "add_stream",
      streamDescriptor: {
        namespace: "too_long_of_a_namespace",
        name: "too_long_of_a_name_for_this_too_long_of_a_name_for_this_too_long_of_a_name_for_this",
      },
    },
    {
      transformType: "remove_stream",
      streamDescriptor: { namespace: "apple", name: "dragonfruit" },
    },
    {
      transformType: "remove_stream",
      streamDescriptor: { namespace: "apple", name: "eclair" },
    },
    {
      transformType: "remove_stream",
      streamDescriptor: { namespace: "apple", name: "fishcake" },
    },
    {
      transformType: "remove_stream",
      streamDescriptor: { namespace: "apple", name: "gelatin_mold" },
    },
  ],
};

export const Primary = Template.bind({});
Primary.args = {
  catalogDiff: fullCatalogDiff,
  catalog: { streams: [] },
};

export const OneStreamAdd = Template.bind({});
OneStreamAdd.args = {
  catalogDiff: oneStreamAddCatalogDiff,
  catalog: { streams: [] },
};

export const OneFieldAdd = Template.bind({});
OneFieldAdd.args = {
  catalogDiff: oneFieldAddCatalogDiff,
  catalog: { streams: [] },
};

export const OneFieldUpdate = Template.bind({});
OneFieldUpdate.args = {
  catalogDiff: oneFieldUpdateCatalogDiff,
  catalog: { streams: [] },
};
