import {
    Card,
    Page,
    Layout,
    TextContainer,
    Image,
    Stack,
    Link,
    Text,
    LegacyCard,
    Banner,
    List,
    IndexTable,
    EmptySearchResult,
  } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import React from 'react';

// Import statements for drop zone
import { DropZone, LegacyStack, Thumbnail } from "@shopify/polaris";
import { NoteMinor } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
  
  //Drop Zone
export default function PreviewTable() {
    const { t } = useTranslation();
  
    const products = [
        {
            row: "1",
            product: "Coffee mug",
            productid: 123453,
            metafield: "material",
            prevMetafieldValue: "N/A",
            newMetafieldValue: "rubber",
        },
        {
            row: "2",
            product: "Snowboard",
            productid: 183632,
            metafield: "material",
            prevMetafieldValue: "N/A",
            newMetafieldValue: "wood",
        },
        {
            row: "3",
            product: "Pen",
            productid: 123453,
            metafield: "material",
            prevMetafieldValue: "N/A",
            newMetafieldValue: "metal",
        }
    ];

    const resourceName = {
        singular: 'Product',
        plural: 'Products',
    };

    const emptyStateMarkup = (
        <EmptySearchResult 
            title={"CSV file is empty"}
            description={"Try uploading a different file"}
            withIllustration
        />
    );

    const rowMarkup = products.map(
        (
        {row, product, productid, metafield, prevMetafieldValue, newMetafieldValue},
        index,
        ) => (
            <IndexTable.Row id={row} key={row} position={index}>
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {row}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{product}</IndexTable.Cell>
                <IndexTable.Cell>{productid}</IndexTable.Cell>
                <IndexTable.Cell>{metafield}</IndexTable.Cell>
                <IndexTable.Cell>{prevMetafieldValue}</IndexTable.Cell>
                <IndexTable.Cell>{newMetafieldValue}</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );
  
    return (
      <Page narrowWidth>
        <TitleBar title={t("HomePage.title")} />
          <LegacyCard>
            <IndexTable resourceName={resourceName} 
            itemCount={products.length} 
            emptyState={emptyStateMarkup}
            headings={[
                {title: 'Row'},
                {title: 'Product'},
                {title: 'Product ID'},
                {title: 'Metafield'},
                {title: 'Current Value'},
                {title: 'New Value'},
            ]}
            selectable={false}
            >
                {rowMarkup}
            </IndexTable>
          </LegacyCard>
      </Page>
    );
}