//////////////////////////// IMPORT STATEMENTS ////////////////////////////

import {
  Page,
  Layout,
  Image,
  Link,
  Text,
  LegacyCard,
  Banner,
  List,
  Button,
  Divider,
  IndexTable,
  EmptySearchResult,
} from "@shopify/polaris";
import { TitleBar, useNavigate } from "@shopify/app-bridge-react";
import { createSearchParams } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import React from 'react';

// Import statements for drop zone
import { DropZone, LegacyStack, Thumbnail } from "@shopify/polaris";
import { NoteMinor } from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

//////////////////////////// HOMEPAGE FUNCTION ////////////////////////////

export default function HomePage() {
  const { t } = useTranslation();
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [displayTable, setDisplayTable] = useState(false);
  const [products, setProducts] = useState([]);

  //////////////////////////// FUNCTIONS: DROP ZONE & PARSE FILE ////////////////////////////

  const [file, setFile] = useState<File>();
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const hasError = rejectedFiles.length > 0;

  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], rejectedFiles: File[]) =>
    {
      setFile(acceptedFiles[0]);
      setRejectedFiles(rejectedFiles);
    },
    [],
  );
  const fileUpload = !file && <DropZone.FileUpload actionHint="File type must be .csv" />

  function removeFile() {
    setFile(undefined);
  }

  const isDisabled = file ? false : true;

  const handleOnClick = useCallback(
    async () => {
      const response = await fetch(
        "/api/csvparse",
        {
          method: "POST",
          body: file,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      if (response.ok) {
        console.log("Success!");
        //console.log(response.json());
        let metafieldTableValues = await response.json();
        await setProducts(metafieldTableValues);
        setDisplayTable(true);
        console.log(metafieldTableValues);
      } else {
        console.log("Failure!");
      }
    },
    [file],
  );

  const uploadedFiles = file && (
    <LegacyStack vertical>
        <LegacyStack alignment="center">
          <Thumbnail size="small" alt={file.name} source={ NoteMinor } />
          <div>
            {file.name}{' '}
            <Text variant="bodySm" as="p">
              {file.size} bytes
            </Text>
          </div>
        </LegacyStack>
    </LegacyStack>
  );

  const errorMessage = hasError && (
    <Banner
      title="The following files couldn't be uploaded:"
      status="critical"
    >
      <List type="bullet">
        {rejectedFiles.map((file, index) => (
          <List.Item key={index}>
            {`${file.name} is not supported. File type must be .csv.`}
          </List.Item>
        ))}
      </List>
    </Banner>
  );

  //////////////////////////// FUNCTIONS: DISPLAY PARSED DATA ////////////////////////////

  /*const products = [
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
  ];*/

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
      {productTitle, productId, metafieldNamespace, metafieldKey, metafieldCurrentValue, metafieldNewValue},
      index,
    ) => (
      <IndexTable.Row id={index.toString()} key={index} position={index}>
          <IndexTable.Cell>
              <Text variant="bodyMd" fontWeight="bold" as="span">
                  {index+1}
              </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{productTitle}</IndexTable.Cell>
          <IndexTable.Cell>{productId}</IndexTable.Cell>
          <IndexTable.Cell>{metafieldNamespace}</IndexTable.Cell>
          <IndexTable.Cell>{metafieldKey}</IndexTable.Cell>
          <IndexTable.Cell>{metafieldCurrentValue}</IndexTable.Cell>
          <IndexTable.Cell>{metafieldNewValue}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );
  
  //////////////////////////// RETURN: DISPLAY PARSED DATA ////////////////////////////
  if (displayTable) {
    return (
      <Page>
        <TitleBar title={t("HomePage.title")} />
          <LegacyCard>
            <IndexTable resourceName={resourceName} 
            itemCount={products.length} 
            emptyState={emptyStateMarkup}
            headings={[
                {title: 'Item'},
                {title: 'Product'},
                {title: 'Product ID'},
                {title: 'Metafield Namespace'},
                {title: 'Metafield Key'},
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
  } else {
  //////////////////////////// RETURN: DISPLAY DROP ZONE ////////////////////////////
    return (
      <Page narrowWidth>
        <TitleBar title={t("HomePage.title")} />
        <Layout>
          <Layout.Section>
            {errorMessage}
          </Layout.Section>
          <Layout.Section>
            <LegacyCard sectioned title="Upload CSV file" actions={[{ content: "Remove File", onAction: removeFile }]}>
              <DropZone 
                accept={"text/csv"}
                onDrop={handleDropZoneDrop}
                allowMultiple={false}
                errorOverlayText="File type must be .csv"
                dropOnPage={true}
              variableHeight>
                {uploadedFiles}
                {fileUpload}
              </DropZone>
              <Divider borderColor="transparent" borderWidth="5" />
              <Divider borderColor="transparent" borderWidth="5" />
              <Divider borderColor="transparent" borderWidth="5" />
              <Button primary size={"medium"} disabled={isDisabled} onClick={handleOnClick}>Upload</Button>
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
}