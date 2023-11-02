"use client";

import React, { useEffect, useState } from "react";
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
} from "react-vis";
import {
  Input,
  NumberInput,
  Text,
  Divider,
  MantineProvider,
  Loader,
  Center,
  Stack,
  Table,
  Title,
  Combobox,
  InputBase,
  useCombobox,
  Fieldset,
} from "@mantine/core";

import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTooltip,
} from "victory";

import pppData from "../data/ppp_data.json";
import countryToCurrency from "../data/country_to_currencies.json";
// import currencyData from "../data/currencies.json";

export default function PPP_comparator() {
  return PPPComparisonForm();
}

function simplifyCountryList(countryList: any) {
  console.log(countryList);
  // create an empty JSON object to store the simplified list
  let simplifiedList: any = [];
  // each country contains a country_id, country, year, and ppp
  // we only want to keep the one instance of each country with the most recent year
  countryList.forEach((country: any) => {
    let countryExists = false;
    // if the country is not in the simplified list, add it
    simplifiedList.forEach((simplifiedCountry: any) => {
      if (simplifiedCountry.country_id === country.country_id) {
        countryExists = true;
        if (simplifiedCountry.year < country.year) {
          simplifiedCountry.year = country.year;
          simplifiedCountry.ppp = country.ppp;
        }
      }
    });
    if (!countryExists && country.ppp !== null) {
      simplifiedList.push(country);
    }
  });

  return simplifiedList;
}

const PPPComparisonForm = () => {
  const pppSource = "https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.CD";

  const [fullPPPData, setFullPPPData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState(
    "Fill all the fields to see how much your purchase would cost a local!"
  );
  // tableData should contain datafield, year, source, and value
  const [tableData, setTableData] = useState<any>([]);
  const tableRows = tableData.map((element: any) => (
    <Table.Tr key={element.datafield}>
      <Table.Td>{element.datafield}</Table.Td>
      <Table.Td>{element.value}</Table.Td>
      <Table.Td>{element.year}</Table.Td>
      <Table.Td>{element.source}</Table.Td>
    </Table.Tr>
  ));

  const [purchasePrice, setPurchasePrice] = useState<string | number>("");
  const [purchaseCountry, setPurchaseCountry] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  const [purchaseCountryPPPHistory, setPurchaseCountryPPPHistory] =
    useState<any>([]);

  const [userCountryPPPHistory, setUserCountryPPPHistory] = useState<any>([]);

  const userCountryComboBox = useCombobox({
    onDropdownClose: () => userCountryComboBox.resetSelectedOption(),
  });

  const purchaseCountryComboBox = useCombobox({
    onDropdownClose: () => purchaseCountryComboBox.resetSelectedOption(),
  });

  const countryOptions = fullPPPData.map((country: any) => (
    <Combobox.Option
      key={country["Country Code"]}
      value={country["Country Name"]}
    >
      {country["Country Name"]}
    </Combobox.Option>
  ));

  useEffect(() => {
    // join pppdata and countrytocurrencies on country_code and location
    let temp_list: any = [];
    pppData.forEach((ppp: any) => {
      // check that any data exist for some between 1960 and 2022
      let dataExists = false;
      for (let i = 2022; i >= 1960; i--) {
        if (ppp[i] !== null && ppp[i] !== "") {
          dataExists = true;
          // break;
        }
      }
      if (dataExists) {
        let foundCountry = false;
        countryToCurrency.forEach((country: any) => {
          if (ppp["Country Code"] === country.country_Code && !foundCountry) {
            foundCountry = true;
            // add coutnry['Currency_Code'] to ppp object
            temp_list.push({
              ...ppp,
              currency_code: country["Currency_Code"],
              currency_name: country["Currency Name"],
            });
          }
        });
      }
    });

    // console.log(temp_list);
    temp_list.sort((a: any, b: any) =>
      a["Country Name"] > b["Country Name"] ? 1 : -1
    );
    setFullPPPData(temp_list);
    setLoading(false);
  }, []);

  useEffect(() => {
    // check if all the values are filled
    if (
      purchasePrice !== "" &&
      purchaseCountry !== null &&
      userCountry !== null
    ) {
      let userCountryObject: any[] = [];
      let purchaseCountryObject: any[] = [];
      // go through the full ppp data and find the country objects
      fullPPPData.forEach((country: any) => {
        if (country["Country Name"] === userCountry) {
          userCountryObject = country;
        }
        if (country["Country Name"] === purchaseCountry) {
          purchaseCountryObject = country;
        }
      });

      console.log(userCountryObject);
      console.log(purchaseCountryObject);

      // the objects contain keys with the name of the year from 1960 to 2022. find the newest year that has a value for both countries
      let userCountryPPP = 0;
      let userCountryYear = 0;
      let userCurrencyCode = "";
      let userCurrencyName = "";
      let purchaseCountryPPP = 0;
      let purchaseCountryYear = 0;
      let purchaseCurrencyCode = "";
      let purchaseCurrencyName = "";

      let temp_purchase_country_ppp_history: any = [];
      let temp_user_country_ppp_history: any = [];

      for (let i = 2022; i >= 1960; i--) {
        if (userCountryObject[i] !== null && userCountryObject[i] !== "") {
          if (userCountryYear < i) {
            userCountryPPP = userCountryObject[i];
            userCountryYear = i;
            userCurrencyCode = userCountryObject["currency_code"];
            userCurrencyName = userCountryObject["currency_name"];
          }
          temp_user_country_ppp_history.push({
            year: i,
            ppp: userCountryObject[i],
            label:
              "Year: " +
              i +
              "\n PPP: " +
              Number(userCountryObject[i]).toFixed(2),
          });
        }

        if (
          purchaseCountryObject[i] !== null &&
          purchaseCountryObject[i] !== ""
        ) {
          if (purchaseCountryYear < i) {
            purchaseCountryPPP = purchaseCountryObject[i];
            purchaseCountryYear = i;
            purchaseCurrencyCode = purchaseCountryObject["currency_code"];
            purchaseCurrencyName = purchaseCountryObject.currency_name;
          }
          temp_purchase_country_ppp_history.push({
            year: i,
            ppp: purchaseCountryObject[i],
            label:
              "Year: " +
              i +
              "\n PPP: " +
              Number(purchaseCountryObject[i]).toFixed(2),
          });
        }
      }
      setPurchaseCountryPPPHistory(temp_purchase_country_ppp_history);
      setUserCountryPPPHistory(temp_user_country_ppp_history);

      console.log(
        "userCountryPPP: " +
          userCountryPPP +
          " userCountryYear: " +
          userCountryYear +
          " userCurrencyCode: " +
          userCurrencyCode
      );
      console.log(
        "purchaseCountryPPP: " +
          purchaseCountryPPP +
          " purchaseCountryYear: " +
          purchaseCountryYear +
          " purchaseCurrencyCode: " +
          purchaseCurrencyCode
      );

      // calculate the output value
      let output =
        (Number(purchasePrice) / purchaseCountryPPP) * userCountryPPP;

      setAnswerText(
        "Somebody from " +
          purchaseCountry +
          " spending " +
          purchasePrice +
          " " +
          purchaseCurrencyCode +
          " (" +
          purchaseCurrencyName +
          ") " +
          " on something would be the equivalent of you spending " +
          output.toFixed(2) +
          " " +
          userCurrencyCode +
          " (" +
          userCurrencyName +
          ") on something in " +
          userCountry +
          "! "
      );
      let temp_table_data: any = [];
      temp_table_data.push({
        datafield: "Purchase Price",
        value: purchasePrice,
        year: "N/A",
        source: "User Input",
      });
      temp_table_data.push({
        datafield: purchaseCountry + " PPP in " + purchaseCurrencyCode,
        value: purchaseCountryPPP,
        year: purchaseCountryYear,
        source: pppSource,
      });
      temp_table_data.push({
        datafield: userCountry + " PPP in " + userCurrencyCode,
        value: userCountryPPP,
        year: userCountryYear,
        source: pppSource,
      });
      setTableData(temp_table_data);
    } else {
      setAnswerText(
        "Fill all the fields to see how much your purchase would cost a local!"
      );
    }
    console.log("answer updated!");
  }, [purchasePrice, purchaseCountry, userCountry]);

  return (
    // if true then show the form
    // else show "loading"
    <MantineProvider>
      {loading ? (
        <>
          <Stack>
            <Center>
              <Text>Loading data from API...</Text>
            </Center>
            <Center>
              <Loader color="blue" type="bars" />
            </Center>
          </Stack>
        </>
      ) : (
        <Stack>
          <Center>
            <Title order={2}>
              What is Purchasing Power Parity and what can it tell us?{" "}
            </Title>
          </Center>
          <Center>
            <Text style={{ maxWidth: 600 }}>
              Purchasing Power Parity (PPP) is an economic theory and metric
              used to compare the relative value of currencies in different
              countries. PPP is based on the idea that in the absence of
              transportation costs and trade barriers, identical goods should
              have the same price when expressed in a common currency. We can
              use it to see how expensive a purchase is in a foreign country is
              relative to the local level of income. For example, if a coffee in
              India costs 150 rupees, we can use the tool and see that it would
              be the equivalent of spending $6.55 on a coffee in the US. This
              information can then be used to make more informed decisions about
              how to spend money abroad.
            </Text>
          </Center>
          <Center>
            <Fieldset
              legend="Get persepctive on a foreign purchase!"
              style={{ maxWidth: 600 }}
            >
              <NumberInput
                variant="filled"
                radius="lg"
                label="Purchasing Price in local currency"
                // description="How expensive is the purchase?"
                placeholder="0"
                value={purchasePrice}
                onChange={(val) => {
                  setPurchasePrice(val);
                  // calculateAnswer();
                }}
                min={0}
              ></NumberInput>
              <Combobox
                store={purchaseCountryComboBox}
                withinPortal={false}
                onOptionSubmit={(val) => {
                  setPurchaseCountry(val);
                  purchaseCountryComboBox.closeDropdown();
                  // calculateAnswer();
                }}
              >
                <Combobox.Target>
                  <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    onClick={() => purchaseCountryComboBox.toggleDropdown()}
                    rightSectionPointerEvents="none"
                    label="In what country?"
                    radius="lg"
                  >
                    {purchaseCountry || (
                      <Input.Placeholder>Purchase Country</Input.Placeholder>
                    )}
                  </InputBase>
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
                    {countryOptions}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>

              <Combobox
                store={userCountryComboBox}
                withinPortal={false}
                onOptionSubmit={(val) => {
                  setUserCountry(val);
                  userCountryComboBox.closeDropdown();
                  // calculateAnswer();
                }}
              >
                <Combobox.Target>
                  <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    onClick={() => userCountryComboBox.toggleDropdown()}
                    rightSectionPointerEvents="none"
                    label="Where do you work?"
                    radius="lg"
                  >
                    {userCountry || (
                      <Input.Placeholder>Your Country</Input.Placeholder>
                    )}
                  </InputBase>
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
                    {countryOptions}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
              <Divider style={{ marginTop: 10, marginBottom: 10 }} />
              <Text>{answerText}</Text>
              {/* check if tableData is empty */}
              {tableData.length > 0 ? (
                <>
                  <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                  <Center>
                    <Text>Here is the data used to calculate the answer:</Text>
                  </Center>
                  <Center>
                    <Table striped withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Description</Table.Th>
                          <Table.Th>Value</Table.Th>
                          <Table.Th>Date</Table.Th>
                          <Table.Th>Source</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{tableRows}</Table.Tbody>
                    </Table>{" "}
                  </Center>
                  <Center>
                    <Text>Historical data for {purchaseCountry}:</Text>
                  </Center>
                  <Center>
                    <VictoryChart
                      style={{
                        parent: {
                          backgroundColor: "#1a1b1e",
                          borderRadius: "5px",
                          padding: "20px",
                        },
                      }}
                    >
                      <VictoryAxis
                        style={{
                          axis: { stroke: "#c1c2c5" },
                          tickLabels: { fill: "#c1c2c5" },
                          axisLabel: { fill: "#c1c2c5" },
                        }}
                        label="Year"
                      />
                      <VictoryAxis
                        dependentAxis
                        style={{
                          axis: { stroke: "#c1c2c5" },
                          tickLabels: { fill: "#c1c2c5" },
                          axisLabel: { fill: "#c1c2c5" },
                        }}
                        label="PPP"
                      />
                      <VictoryBar
                        labelComponent={<VictoryTooltip />}
                        data={purchaseCountryPPPHistory}
                        x="year"
                        y="ppp"
                        style={{
                          data: {
                            fill: "#c1c2c5",
                          },
                          labels: {
                            fill: "#1a1b1e",
                          },
                        }}
                      />
                    </VictoryChart>
                  </Center>
                  <Center>
                    <Text>Historical data for {userCountry}:</Text>
                  </Center>
                  <Center>
                    <VictoryChart
                      style={{
                        parent: {
                          backgroundColor: "#1a1b1e",
                          borderRadius: "5px",
                          padding: "20px",
                        },
                      }}
                    >
                      <VictoryAxis
                        style={{
                          axis: { stroke: "#c1c2c5" },
                          tickLabels: { fill: "#c1c2c5" },
                          axisLabel: { fill: "#c1c2c5" },
                        }}
                        label="Year"
                      />
                      <VictoryAxis
                        dependentAxis
                        style={{
                          axis: { stroke: "#c1c2c5" },
                          tickLabels: { fill: "#c1c2c5" },
                          axisLabel: { fill: "#c1c2c5" },
                        }}
                        label="PPP"
                      />
                      <VictoryBar
                        labelComponent={<VictoryTooltip />}
                        data={userCountryPPPHistory}
                        x="year"
                        y="ppp"
                        style={{
                          data: {
                            fill: "#c1c2c5",
                          },
                          labels: {
                            fill: "#1a1b1e",
                          },
                        }}
                      />
                    </VictoryChart>
                  </Center>
                </>
              ) : (
                <></>
              )}
            </Fieldset>
          </Center>
        </Stack>
      )}
    </MantineProvider>
  );
};
